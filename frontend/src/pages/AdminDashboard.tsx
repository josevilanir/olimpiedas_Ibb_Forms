import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import type { Gender, Modality, MembershipStatus, Participant, PaymentStatus, Stats } from "../types";
import { api } from "../services/api";
import { useAuthContext } from "../contexts/AuthContext";
import styles from "./AdminDashboard.module.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

type View = "modalities" | "participants" | "stats" | "finance";
type MemberFilter = "ALL" | "SIM" | "NAO" | "GR";
type ChartMode = "ageGroups" | "modalities";
type PaymentFilter = "ALL" | PaymentStatus;
type PieMode = "gender" | "membership" | "payment";

interface EditState {
  participant: Participant;
  fullName: string;
  whatsapp: string;
  healthIssues: string;
  gender: Gender;
  isMember: MembershipStatus;
  birthDate: string;
  modalityIds: string[];
}

export default function AdminDashboard() {
  const { token: rawToken, user, logout } = useAuthContext();
  const token = rawToken!; // ProtectedRoute garante autenticação antes deste componente
  const adminName = user?.name ?? "";
  const navigate = useNavigate();
  function onLogout() { logout(); navigate("/"); }
  const [view, setView] = useState<View>("modalities");
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [selectedModality, setSelectedModality] = useState<Modality | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingMod, setLoadingMod] = useState(true);
  const [loadingPart, setLoadingPart] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [statsData, setStatsData] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalitySearchQuery, setModalitySearchQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");
  const [chartMode, setChartMode] = useState<ChartMode>("modalities");
  const [pieMode, setPieMode] = useState<PieMode>("gender");
  const [activeBar, setActiveBar] = useState<{ id: string; name: string } | null>(null);
  const [pieStatsData, setPieStatsData] = useState<Stats | null>(null);
  const [loadingPieStats, setLoadingPieStats] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Drag-to-scroll for charts
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [mouseDownX, setMouseDownX] = useState(0); // Para detectar clique vs drag

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setMouseDownX(e.pageX);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    // Pequeno delay para permitir que o clique seja processado antes de resetar isDragging?
    // Na verdade, se não arrastou, isDragging nunca ficou true.
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    // Só inicia o drag se mover mais de 5px (evita matar o clique)
    if (!isDragging) {
      if (Math.abs(e.pageX - mouseDownX) > 5) {
        setIsDragging(true);
      } else {
        return;
      }
    }

    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    api.modalities.list()
      .then(setModalities)
      .finally(() => setLoadingMod(false));
  }, []);

  function loadStats(filter?: MemberFilter) {
    setView("stats");
    const isMember = (filter ?? memberFilter) === "ALL" ? undefined : (filter ?? memberFilter) as "SIM" | "NAO" | "GR";
    setLoadingStats(true);
    api.admin.getStats(token, isMember)
      .then(setStatsData)
      .finally(() => setLoadingStats(false));
  }

  function handleMemberFilterChange(f: MemberFilter) {
    setMemberFilter(f);
    setActiveBar(null);
    setPieStatsData(null);
    loadStats(f);
  }

  function handleBarClick(entry: Record<string, unknown>) {
    const id = entry.id as string | undefined;
    const name = entry.name as string | undefined;
    if (!id || !name) return;
    if (activeBar?.id === id) {
      setActiveBar(null);
      setPieStatsData(null);
      return;
    }
    setActiveBar({ id, name });
    const isMember = memberFilter === "ALL" ? undefined : memberFilter as "SIM" | "NAO" | "GR";
    setLoadingPieStats(true);
    api.admin.getStats(token, isMember, id)
      .then(setPieStatsData)
      .finally(() => setLoadingPieStats(false));
  }

  function clearBarFilter() {
    setActiveBar(null);
    setPieStatsData(null);
  }

  const loadParticipants = useCallback((modality: Modality) => {
    setSelectedModality(modality);
    setView("participants");
    setSearchQuery("");
    setLoadingPart(true);
    api.admin.getParticipants(token, modality.id)
      .then(setParticipants)
      .finally(() => setLoadingPart(false));
  }, [token]);

  async function handleDelete(id: string) {
    await api.admin.deleteParticipant(token, id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
    showFeedback("success", "Inscrição removida com sucesso.");
  }

  async function handleSaveEdit() {
    if (!editState) return;
    setSaving(true);
    try {
      const updated = await api.admin.updateParticipant(token, editState.participant.id, {
        fullName: editState.fullName,
        whatsapp: editState.whatsapp,
        healthIssues: editState.healthIssues,
        gender: editState.gender,
        isMember: editState.isMember,
        birthDate: editState.birthDate,
        modalityIds: editState.modalityIds,
      });
      setParticipants((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setEditState(null);
      showFeedback("success", "Inscrição atualizada com sucesso.");
    } catch {
      showFeedback("error", "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePaymentStatus(p: Participant, newStatus: PaymentStatus) {
    try {
      const updated = await api.admin.updateParticipant(token, p.id, { paymentStatus: newStatus });
      setParticipants((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      const labels: Record<PaymentStatus, string> = {
        PAGO: "Pagamento confirmado.",
        PENDENTE: "Pagamento marcado como pendente.",
        CANCELADO: "Inscrição marcada como cancelada."
      };
      showFeedback("success", labels[newStatus]);
    } catch {
      showFeedback("error", "Erro ao atualizar pagamento.");
    }
  }

  function showFeedback(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  }

  async function handleExport(modalityId?: string) {
    const query = modalityId ? `?modalityId=${modalityId}` : "";
    const url = `${BASE_URL}/admin/export${query}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const msg = errorBody?.error ?? `Erro ${response.status}`;
        showFeedback("error", msg);
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `inscritos_olimpiadas_ibb_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 1000);
    } catch {
      showFeedback("error", "Erro de rede ao exportar. Verifique sua conexão.");
    }
  }

  function handlePrint() {
    window.print();
  }

  function ageLabel(minAge: number | null, maxAge: number | null) {
    if (!minAge && !maxAge) return "Livre";
    if (minAge && maxAge) return `${minAge}–${maxAge} anos`;
    if (minAge) return `${minAge}+ anos`;
    return `até ${maxAge} anos`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  function calcAge(birthDate: string) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function isAgeOutOfRange(birthDate: string, modality: Modality | null): boolean {
    if (!modality) return false;
    const { minAge, maxAge } = modality;
    if (!minAge && !maxAge) return false;
    const age = calcAge(birthDate);
    if (minAge && age < minAge) return true;
    if (maxAge && age > maxAge) return true;
    return false;
  }

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === "ALL" || p.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className={styles.layout}>
      {/* Overlay for mobile */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayActive : ""}`} 
        onClick={closeSidebar}
      />

      {/* Floating Toggle Button */}
      <button 
        className={styles.mobileToggle} 
        onClick={toggleSidebar}
        aria-label="Menu"
      >
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarIcon}>🏆</span>
          <div>
            <p className={styles.sidebarTitle}>Olimpíadas IBB</p>
            <p className={styles.sidebarSub}>Admin</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${view === "modalities" ? styles.navBtnActive : ""}`}
            onClick={() => { setView("modalities"); closeSidebar(); }}
          >
            Modalidades
          </button>
          <button
            className={`${styles.navBtn} ${view === "stats" ? styles.navBtnActive : ""}`}
            onClick={() => { loadStats(); setPieMode("gender"); setView("stats"); closeSidebar(); }}
          >
            Estatísticas
          </button>
          <button
            className={`${styles.navBtn} ${view === "finance" ? styles.navBtnActive : ""}`}
            onClick={() => { loadStats(); setView("finance"); closeSidebar(); }}
          >
            Financeiro
          </button>
          {selectedModality && (
            <button
              className={`${styles.navBtn} ${view === "participants" ? styles.navBtnActive : ""}`}
              onClick={() => { setView("participants"); closeSidebar(); }}
            >
              ↳ {selectedModality.name}
            </button>
          )}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.adminName}>{adminName}</p>
          <button className={styles.logoutBtn} onClick={onLogout}>Sair</button>
        </div>
      </aside>

      <main className={styles.main}>
        {feedback && (
          <div className={`${styles.feedback} ${feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>
            {feedback.msg}
          </div>
        )}

        {/* MODALITIES VIEW */}
        {view === "modalities" && (
          <div>
            <div className={styles.pageHeader}>
              <h2>Modalidades</h2>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input
                  className={`form-input ${styles.searchInput}`}
                  style={{ maxWidth: "250px", marginBottom: 0 }}
                  placeholder="Buscar modalidade..."
                  value={modalitySearchQuery}
                  onChange={(e) => setModalitySearchQuery(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={() => handleExport()}>
                  Exportar todas (Excel)
                </button>
              </div>
            </div>

            {loadingMod && <p className={styles.loading}>Carregando...</p>}

            <div className={styles.modalityGrid}>
              {modalities
                .filter(m => m.name.toLowerCase().includes(modalitySearchQuery.toLowerCase()))
                .map((m) => (
                <div key={m.id} className={styles.modalityCard}>
                  <div className={styles.modalityCardHeader}>
                    <h3>{m.name}</h3>
                    <span className={`badge ${m.requiresMembership ? "badge-primary" : "badge-success"}`}>
                      {m.requiresMembership ? "Membros IBB/GR" : "Aberto"}
                    </span>
                  </div>
                  <p className={styles.modalityMeta}>
                    Faixa etária: <strong>{ageLabel(m.minAge, m.maxAge)}</strong>
                  </p>
                  {m.maxSpots && (
                    <p className={styles.modalityMeta}>
                      Vagas: <strong>{m.maxSpots}</strong>
                    </p>
                  )}
                  <p className={styles.modalityMeta}>
                    Coord: <strong>{m.coordinatorName}</strong>
                  </p>
                  <div className={styles.modalityActions}>
                    <button className="btn btn-primary" onClick={() => loadParticipants(m)}>
                      Ver inscritos
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExport(m.id)}>
                      Excel
                    </button>
                  </div>
                </div>
              ))}
              {modalities.filter(m => m.name.toLowerCase().includes(modalitySearchQuery.toLowerCase())).length === 0 && (
                <p className={styles.noData} style={{ gridColumn: "1 / -1" }}>Nenhuma modalidade encontrada.</p>
              )}
            </div>
          </div>
        )}

        {/* STATS VIEW */}
        {view === "stats" && (
          <div>
            <div className={styles.pageHeader}>
              <h2>Estatísticas</h2>
              <button className="btn btn-secondary" onClick={() => handleExport()}>
                Exportar tudo (Excel)
              </button>
            </div>

            {/* Member filter pills */}
            <div className={styles.memberFilterRow}>
              {(["ALL", "SIM", "GR", "NAO"] as MemberFilter[]).map((f) => {
                const labels: Record<MemberFilter, string> = {
                  ALL: "Todos",
                  SIM: "Membro IBB",
                  GR: "Freq. GR",
                  NAO: "Não membro",
                };
                return (
                  <button
                    key={f}
                    className={`${styles.filterPill} ${memberFilter === f ? styles.filterPillActive : ""}`}
                    onClick={() => handleMemberFilterChange(f)}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            {loadingStats && <p className={styles.loading}>Carregando estatísticas...</p>}


            {statsData && (
              <>
                {/* Bar chart with mode selector */}
                <div className={styles.chartSection}>
                  <div className={styles.chartHeader}>
                    <div className={styles.chartTabs}>
                      <button
                        className={`${styles.chartTab} ${chartMode === "modalities" ? styles.chartTabActive : ""}`}
                        onClick={() => setChartMode("modalities")}
                      >
                        Por modalidade
                      </button>
                      <button
                        className={`${styles.chartTab} ${chartMode === "ageGroups" ? styles.chartTabActive : ""}`}
                        onClick={() => setChartMode("ageGroups")}
                      >
                        Faixas etárias
                      </button>
                    </div>
                  </div>

                  {chartMode === "modalities" && (() => {
                    const sortedData = [...statsData.modalityStats].sort((a, b) => b.count - a.count);
                    return (
                      <div 
                        className={styles.chartScrollWrapper}
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                      >
                        <div style={{ 
                          width: "100%", 
                          minWidth: Math.max(sortedData.length * 120, 1400), 
                          pointerEvents: isDragging ? 'none' : 'auto' 
                        }}>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={sortedData}
                              margin={{ top: 8, right: 24, bottom: 120, left: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                              <XAxis
                                dataKey="name"
                                tick={{ fill: "rgba(200,230,225,0.6)", fontSize: 11 }}
                                axisLine={false} tickLine={false}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                              />
                              <YAxis allowDecimals={false} tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                              <Tooltip
                                contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                                itemStyle={{ color: "#e8f4f3", fontWeight: "bold" }}
                                cursor={{ fill: "rgba(10,157,143,0.08)" }}
                              />
                              <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                name="Inscritos"
                                onClick={(entry) => handleBarClick(entry as unknown as Record<string, unknown>)}
                              >
                                {sortedData.map((entry) => (
                                  <Cell
                                    key={entry.id}
                                    fill={activeBar?.id === entry.id ? "#14d6c5" : "#0aad9f"}
                                    opacity={activeBar && activeBar.id !== entry.id ? 0.4 : 1}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })()}

                  {chartMode === "ageGroups" && (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={Object.entries(statsData.ageGroups).map(([label, count]) => ({ label: `${label} anos`, count }))}
                        margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="label" tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                          itemStyle={{ color: "#e8f4f3", fontWeight: "bold" }}
                          cursor={{ fill: "rgba(10,157,143,0.08)" }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inscritos" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Demographic pie charts */}
                {(() => {
                  const src = pieStatsData ?? statsData;
                  const currentPieMode = pieMode;
                  
                  const pieData = currentPieMode === "gender"
                    ? [
                        { name: "Masculino", value: src.genderCount.MASCULINO, color: "#3b82f6" },
                        { name: "Feminino", value: src.genderCount.FEMININO, color: "#c084fc" },
                      ]
                    : currentPieMode === "membership"
                    ? [
                        { name: "Membro IBB", value: src.memberCount.SIM, color: "#0aad9f" },
                        { name: "Freq. GR", value: src.memberCount.GR, color: "#3b82f6" },
                        { name: "Não membro", value: src.memberCount.NAO, color: "#f59e0b" },
                      ]
                    : [
                        { name: "Pago", value: src.paymentCount.PAGO, color: "#10b981" },
                        { name: "Pendente", value: src.paymentCount.PENDENTE, color: "#f59e0b" },
                        { name: "Cancelado", value: src.paymentCount.CANCELADO, color: "#ef4444" },
                      ];
                  const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);
                  return (
                    <div className={styles.chartSection}>
                      <div className={styles.chartHeader}>
                        <div className={styles.chartTabs}>
                          <button
                            className={`${styles.chartTab} ${currentPieMode === "gender" ? styles.chartTabActive : ""}`}
                            onClick={() => setPieMode("gender")}
                          >
                            Gênero
                          </button>
                          <button
                            className={`${styles.chartTab} ${currentPieMode === "membership" ? styles.chartTabActive : ""}`}
                            onClick={() => setPieMode("membership")}
                          >
                            Vínculo
                          </button>
                          <button
                            className={`${styles.chartTab} ${currentPieMode === "payment" ? styles.chartTabActive : ""}`}
                            onClick={() => setPieMode("payment")}
                          >
                            Pagamento
                          </button>
                        </div>
                        {activeBar && (
                          <button className={styles.activeBarBadge} onClick={clearBarFilter}>
                            {activeBar.name} ×
                          </button>
                        )}
                      </div>
                      <div className={styles.pieRow} style={loadingPieStats ? { opacity: 0.45, pointerEvents: "none", transition: "opacity 0.2s" } : { transition: "opacity 0.2s" }}>
                        <div className={styles.pieChartWrap}>
                          <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                              <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ pointerEvents: "none" }}
                              >
                                <tspan x="50%" dy="-0.4em" fill="#e8f4f3" fontSize="30" fontWeight="700">
                                  {pieTotal}
                                </tspan>
                                <tspan x="50%" dy="1.5em" fill="rgba(200,230,225,0.45)" fontSize="11">
                                  {pieTotal === 1 ? "inscrito" : "inscritos"}
                                </tspan>
                              </text>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={72}
                                outerRadius={108}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                              >
                                {pieData.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => {
                                  const v = typeof value === "number" ? value : 0;
                                  return [`${v} (${pieTotal > 0 ? Math.round((v / pieTotal) * 100) : 0}%)`, ""];
                                }}
                                contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                                itemStyle={{ color: "#e8f4f3", fontWeight: "bold" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className={styles.pieLegend}>
                          {pieData.map((entry) => (
                            <div key={entry.name} className={styles.pieLegendItem}>
                              <span className={styles.pieLegendDot} style={{ background: entry.color }} />
                              <span className={styles.pieLegendName}>{entry.name}</span>
                              <span className={styles.pieLegendVal}>
                                {entry.value}
                                <span className={styles.pieLegendPct}>
                                  {" "}({pieTotal > 0 ? Math.round((entry.value / pieTotal) * 100) : 0}%)
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* FINANCE VIEW */}
        {view === "finance" && (
          <div>
            <div className={styles.pageHeader}>
              <h2>Controle Financeiro</h2>
              <button className="btn btn-secondary" onClick={() => handleExport()}>
                Exportar Excel
              </button>
            </div>

            {loadingStats && <p className={styles.loading}>Carregando dados financeiros...</p>}

            {statsData && (
              <>
                <div className={styles.statsCards}>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Total Inscritos (Ativos)</p>
                    <p className={styles.statValue}>{statsData.totalParticipants}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Pagamentos Confirmados</p>
                    <p className={styles.statValue}>{statsData.paymentCount.PAGO}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Receita Esperada</p>
                    <p className={styles.statValue}>R$ {statsData.revenue.estimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Receita Realizada</p>
                    <p className={`${styles.statValue} ${styles.statValueSuccess}`}>R$ {statsData.revenue.actual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}



        {/* PARTICIPANTS VIEW */}
        {view === "participants" && selectedModality && (
          <div>
            <div className={styles.pageHeader}>
              <div>
                <button className={styles.backBtn} onClick={() => setView("modalities")}>
                  ← Voltar
                </button>
                <h2>{selectedModality.name}</h2>
                <p className={styles.participantCount}>{participants.length} inscrito{participants.length !== 1 ? "s" : ""}</p>
              </div>
              <div className={styles.participantActions}>
                <button className="btn btn-secondary" onClick={handlePrint}>
                  🖨️ Imprimir lista
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport(selectedModality.id)}>
                  Exportar Excel
                </button>
              </div>
            </div>

            {/* Search and filters */}
            <div className={styles.filterBar}>
              <input
                className={`form-input ${styles.searchInput}`}
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className={styles.paymentFilterRow}>
                {(["ALL", "PENDENTE", "PAGO", "CANCELADO"] as PaymentFilter[]).map((f) => {
                  const labels: Record<PaymentFilter, string> = {
                    ALL: "Todos Pagamentos",
                    PENDENTE: "Pendentes",
                    PAGO: "Pagos",
                    CANCELADO: "Cancelados",
                  };
                  return (
                    <button
                      key={f}
                      className={`${styles.filterPill} ${paymentFilter === f ? styles.filterPillActive : ""}`}
                      onClick={() => setPaymentFilter(f)}
                    >
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
            </div>

            {loadingPart && <p className={styles.loading}>Carregando inscritos...</p>}

            {!loadingPart && participants.length === 0 && (
              <div className={styles.empty}>Nenhum inscrito nesta modalidade ainda.</div>
            )}

            {!loadingPart && participants.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Responsável</th>
                      <th>Idade</th>
                      <th>WhatsApp</th>
                      <th>Sexo</th>
                      <th>Membro</th>
                      <th>Pagamento</th>
                      <th>Inf. Saúde</th>
                      <th>Inscrito em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((p) => {
                      const ageAlert = isAgeOutOfRange(p.birthDate, selectedModality);
                      return (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.fullName}</strong>
                            {ageAlert && (
                              <span className={styles.ageAlert} title="Idade fora do range da modalidade">
                                {" "}⚠️
                              </span>
                            )}
                          </td>
                          <td>{p.parentName ?? "—"}</td>
                          <td>{calcAge(p.birthDate)} anos</td>
                          <td>{p.whatsapp}</td>
                          <td>{p.gender === "MASCULINO" ? "Masc." : "Fem."}</td>
                          <td>
                            <span className={`badge ${p.isMember === "NAO" ? "badge-warning" : "badge-success"}`}>
                              {p.isMember}
                            </span>
                          </td>
                          <td>
                            <select
                              className={`${styles.paymentSelect} ${styles[`paymentStatus-${p.paymentStatus}`]}`}
                              value={p.paymentStatus}
                              onChange={(e) => handleUpdatePaymentStatus(p, e.target.value as PaymentStatus)}
                            >
                              <option value="PENDENTE">Pendente</option>
                              <option value="PAGO">Pago</option>
                              <option value="CANCELADO">Cancelado</option>
                            </select>
                            {p.paidAt && (
                              <p className={styles.paidAtLabel} title="Data da confirmação">
                                {new Date(p.paidAt).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </td>
                          <td className={styles.healthCell}>{p.healthIssues || "—"}</td>
                          <td>{formatDate(p.createdAt)}</td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                className={`btn ${styles.btnSm} btn-secondary`}
                                onClick={() => setEditState({
                                  participant: p,
                                  fullName: p.fullName,
                                  whatsapp: p.whatsapp,
                                  healthIssues: p.healthIssues ?? "",
                                  gender: p.gender,
                                  isMember: p.isMember,
                                  birthDate: p.birthDate.slice(0, 10),
                                  modalityIds: p.subscriptions.map((s) => s.modalityId),
                                })}
                              >
                                Editar
                              </button>
                              <button
                                className={`btn ${styles.btnSm} btn-danger`}
                                onClick={() => setDeleteId(p.id)}
                              >
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PRINT LAYOUT */}
      {view === "participants" && selectedModality && (
        <div className={styles.printLayout}>
          <h2>Lista de Chamada — {selectedModality.name}</h2>
          <p className={styles.printDate}>Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
          <table className={styles.printTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Vínculo</th>
                <th>WhatsApp</th>
                <th>Assinatura / Obs</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.fullName}</td>
                  <td>{p.isMember}</td>
                  <td>{p.whatsapp}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirmar remoção</h3>
            <p>Tem certeza que deseja remover esta inscrição? Esta ação não pode ser desfeita.</p>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editState && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <h3>Editar inscrição</h3>
            <div className={styles.editForm}>
              <div className={styles.editGrid}>
                <div className="form-group">
                  <label className="form-label">Nome completo</label>
                  <input
                    className="form-input"
                    value={editState.fullName}
                    onChange={(e) => setEditState((s) => s && ({ ...s, fullName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input
                    className="form-input"
                    value={editState.whatsapp}
                    onChange={(e) => setEditState((s) => s && ({ ...s, whatsapp: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <input
                    className="form-input"
                    type="date"
                    value={editState.birthDate}
                    onChange={(e) => setEditState((s) => s && ({ ...s, birthDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select
                    className="form-input"
                    value={editState.gender}
                    onChange={(e) => setEditState((s) => s && ({ ...s, gender: e.target.value as Gender }))}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vínculo IBB</label>
                  <select
                    className="form-input"
                    value={editState.isMember}
                    onChange={(e) => setEditState((s) => s && ({ ...s, isMember: e.target.value as MembershipStatus }))}
                  >
                    <option value="SIM">Membro IBB</option>
                    <option value="GR">Freq. GR</option>
                    <option value="NAO">Não membro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Informações de saúde</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={editState.healthIssues}
                  onChange={(e) => setEditState((s) => s && ({ ...s, healthIssues: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modalidades</label>
                <div className={styles.modalityCheckboxes}>
                  {modalities.map((m) => (
                    <label key={m.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={editState.modalityIds.includes(m.id)}
                        onChange={(e) => {
                          setEditState((s) => {
                            if (!s) return s;
                            const ids = e.target.checked
                              ? [...s.modalityIds, m.id]
                              : s.modalityIds.filter((id) => id !== m.id);
                            return { ...s, modalityIds: ids };
                          });
                        }}
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setEditState(null)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving} onClick={handleSaveEdit}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
