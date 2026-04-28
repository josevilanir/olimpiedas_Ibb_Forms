import { useState, useEffect, useCallback } from "react";
import type { Modality, Participant } from "../types";
import { api } from "../services/api";
import styles from "./AdminDashboard.module.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

interface Props {
  token: string;
  adminName: string;
  onLogout: () => void;
}

type View = "modalities" | "participants" | "stats";

interface Stats {
  totalParticipants: number;
  genderCount: { MASCULINO: number; FEMININO: number };
  memberCount: { SIM: number; NAO: number; GR: number };
  ageGroups: { "3-9": number; "10-13": number; "14-17": number; "18+": number };
  modalityStats: { id: string; name: string; count: number }[];
}

interface EditState {
  participant: Participant;
  fullName: string;
  whatsapp: string;
  healthIssues: string;
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

  useEffect(() => {
    api.modalities.list()
      .then(setModalities)
      .finally(() => setLoadingMod(false));
  }, []);

  function loadStats() {
    setView("stats");
    if (statsData) return;
    setLoadingStats(true);
    api.admin.getStats(token)
      .then(setStatsData)
      .finally(() => setLoadingStats(false));
  }

  const loadParticipants = useCallback((modality: Modality) => {
    setSelectedModality(modality);
    setView("participants");
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
            onClick={loadStats}
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
                    <span className={styles.statValue}>{statsData.memberCount.SIM + statsData.memberCount.GR}</span>
                    <span className={styles.statLabel}>Membros IBB/GR</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statValue}>{statsData.memberCount.NAO}</span>
                    <span className={styles.statLabel}>Não membros</span>
                  </div>
                </div>

                {/* Faixas etárias */}
                <div className={styles.chartSection}>
                  <h3>Faixas etárias</h3>
                  <div className={styles.barChart}>
                    {Object.entries(statsData.ageGroups).map(([label, count]) => {
                      const pct = statsData.totalParticipants > 0 ? Math.round((count / statsData.totalParticipants) * 100) : 0;
                      return (
                        <div key={label} className={styles.barRow}>
                          <span className={styles.barLabel}>{label} anos</span>
                          <div className={styles.barTrack}>
                            <div className={styles.barFill} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={styles.barCount}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inscritos por modalidade */}
                <div className={styles.chartSection}>
                  <h3>Inscritos por modalidade</h3>
                  <div className={styles.barChart}>
                    {statsData.modalityStats
                      .sort((a, b) => b.count - a.count)
                      .map((m) => {
                        const max = Math.max(...statsData.modalityStats.map((x) => x.count), 1);
                        const pct = Math.round((m.count / max) * 100);
                        return (
                          <div key={m.id} className={styles.barRow}>
                            <span className={styles.barLabel}>{m.name}</span>
                            <div className={styles.barTrack}>
                              <div className={styles.barFill} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={styles.barCount}>{m.count}</span>
                          </div>
                        );
                      })}
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
              <button className="btn btn-secondary" onClick={() => handleExport(selectedModality.id)}>
                Exportar Excel
              </button>
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
                      <th>Inf. Saúde</th>
                      <th>Inscrito em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.fullName}</strong></td>
                        <td>{p.parentName ?? "—"}</td>
                        <td>{calcAge(p.birthDate)} anos</td>
                        <td>{p.whatsapp}</td>
                        <td>{p.gender === "MASCULINO" ? "Masc." : "Fem."}</td>
                        <td>
                          <span className={`badge ${p.isMember === "NAO" ? "badge-warning" : "badge-success"}`}>
                            {p.isMember}
                          </span>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

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
          <div className={styles.modal}>
            <h3>Editar inscrição</h3>
            <div className={styles.editForm}>
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
                <label className="form-label">Informações de saúde</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editState.healthIssues}
                  onChange={(e) => setEditState((s) => s && ({ ...s, healthIssues: e.target.value }))}
                />
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
