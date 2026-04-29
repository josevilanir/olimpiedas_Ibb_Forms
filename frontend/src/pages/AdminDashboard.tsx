import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { Gender, Modality, MembershipStatus, Participant, PaymentStatus } from "../types";
import { api } from "../services/api";
import styles from "./AdminDashboard.module.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

interface Props {
  token: string;
  adminName: string;
  onLogout: () => void;
}

type View = "modalities" | "participants" | "stats";
type MemberFilter = "ALL" | "SIM" | "NAO" | "GR";
type ChartMode = "ageGroups" | "modalities";

interface Stats {
  totalParticipants: number;
  genderCount: { MASCULINO: number; FEMININO: number };
  memberCount: { SIM: number; NAO: number; GR: number };
  ageGroups: { "3-9": number; "10-13": number; "14-17": number; "18+": number };
  modalityStats: { id: string; name: string; count: number; maxSpots: number | null }[];
}

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

export default function AdminDashboard({ token, adminName, onLogout }: Props) {
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
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("ALL");
  const [chartMode, setChartMode] = useState<ChartMode>("modalities");

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
    loadStats(f);
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

  async function handleTogglePayment(p: Participant) {
    const newStatus: PaymentStatus = p.paymentStatus === "PAGO" ? "PENDENTE" : "PAGO";
    try {
      const updated = await api.admin.updateParticipant(token, p.id, { paymentStatus: newStatus });
      setParticipants((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      showFeedback("success", newStatus === "PAGO" ? "Pagamento confirmado." : "Pagamento marcado como pendente.");
    } catch {
      showFeedback("error", "Erro ao atualizar pagamento.");
    }
  }

  function showFeedback(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  }

  function handleExport(modalityId?: string) {
    const query = modalityId ? `?modalityId=${modalityId}` : "";
    const url = `${BASE_URL}/admin/export${query}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    Object.assign(link.style, { display: "none" });
    document.body.appendChild(link);
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    fetch(url, { headers })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.click();
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      });
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

  const filteredParticipants = participants.filter((p) =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
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
            onClick={() => setView("modalities")}
          >
            Modalidades
          </button>
          <button
            className={`${styles.navBtn} ${view === "stats" ? styles.navBtnActive : ""}`}
            onClick={() => loadStats()}
          >
            Estatísticas
          </button>
          {selectedModality && (
            <button
              className={`${styles.navBtn} ${view === "participants" ? styles.navBtnActive : ""}`}
              onClick={() => setView("participants")}
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
              <button className="btn btn-secondary" onClick={() => handleExport()}>
                Exportar todas (Excel)
              </button>
            </div>

            {loadingMod && <p className={styles.loading}>Carregando...</p>}

            <div className={styles.modalityGrid}>
              {modalities.map((m) => (
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
                {/* Summary cards */}
                <div className={styles.statsCards}>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.totalParticipants}</span>
                    <span className={styles.statLabel}>Total de inscritos</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.genderCount.MASCULINO}</span>
                    <span className={styles.statLabel}>Masculino</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.genderCount.FEMININO}</span>
                    <span className={styles.statLabel}>Feminino</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.memberCount.SIM}</span>
                    <span className={styles.statLabel}>Membros IBB</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.memberCount.GR}</span>
                    <span className={styles.statLabel}>Freq. GR</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.memberCount.NAO}</span>
                    <span className={styles.statLabel}>Não membros</span>
                  </div>
                </div>

                {/* Single bar chart with mode selector */}
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

                  {chartMode === "modalities" && (
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(260, statsData.modalityStats.length * 36)}
                    >
                      <BarChart
                        data={[...statsData.modalityStats].sort((a, b) => b.count - a.count)}
                        margin={{ top: 8, right: 24, bottom: 90, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "rgba(200,230,225,0.6)", fontSize: 11 }}
                          axisLine={false} tickLine={false}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                        />
                        <YAxis allowDecimals={false} tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                          cursor={{ fill: "rgba(10,157,143,0.08)" }}
                        />
                        <Bar dataKey="count" fill="#0aad9f" radius={[4, 4, 0, 0]} name="Inscritos" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

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
                          cursor={{ fill: "rgba(10,157,143,0.08)" }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inscritos" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
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

            {/* Search bar */}
            <div className={styles.searchBar}>
              <input
                className={`form-input ${styles.searchInput}`}
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                            <button
                              className={`${styles.paymentToggle} ${p.paymentStatus === "PAGO" ? styles.paymentPago : styles.paymentPendente}`}
                              onClick={() => handleTogglePayment(p)}
                              title={p.paymentStatus === "PAGO" ? "Clique para marcar como pendente" : "Clique para confirmar pagamento"}
                            >
                              {p.paymentStatus === "PAGO" ? "✓ Pago" : "Pendente"}
                            </button>
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
