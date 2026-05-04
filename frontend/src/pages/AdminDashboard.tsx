import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import type { Modality, Participant, PaymentStatus, Stats, View, MemberFilter, ChartMode, PaymentFilter, PieMode, SortKey, SortDir, EditState } from "../types";
import { api } from "../services/api";
import { useAuthContext } from "../contexts/AuthContext";
import styles from "./AdminDashboard.module.css";
import { FeedbackToast } from "../components/admin/FeedbackToast";
import { DeleteConfirmModal } from "../components/admin/DeleteConfirmModal";
import { EditParticipantModal } from "../components/admin/EditParticipantModal";
import { PrintLayout } from "../components/admin/PrintLayout";
import { Sidebar } from "../components/admin/Sidebar";
import { ModalityGrid } from "../components/admin/ModalityGrid";
import { StatsView } from "../components/admin/StatsView";
import { FinanceView } from "../components/admin/FinanceView";
import { ParticipantsTable } from "../components/admin/ParticipantsTable";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

export default function AdminDashboard() {
  const { token: rawToken, user, logout } = useAuthContext();
  const token = rawToken!;
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
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

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
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        showFeedback("error", errorBody?.error ?? `Erro ${response.status}`);
        return;
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `inscritos_olimpiadas_ibb_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { URL.revokeObjectURL(blobUrl); document.body.removeChild(link); }, 1000);
    } catch {
      showFeedback("error", "Erro de rede ao exportar. Verifique sua conexão.");
    }
  }

  async function handleExportFinance() {
    const url = `${BASE_URL}/admin/export-finance`;
    try {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        showFeedback("error", errorBody?.error ?? `Erro ${response.status}`);
        return;
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `financeiro_olimpiadas_ibb_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { URL.revokeObjectURL(blobUrl); document.body.removeChild(link); }, 1000);
    } catch {
      showFeedback("error", "Erro de rede ao exportar.");
    }
  }

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === "ALL" || p.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className={styles.layout}>
      <Sidebar
        view={view}
        selectedModality={selectedModality}
        adminName={adminName}
        isSidebarOpen={isSidebarOpen}
        onViewChange={(v) => setView(v)}
        onStatsClick={() => { loadStats(); setPieMode("gender"); }}
        onFinanceClick={() => { loadStats(); setView("finance"); }}
        onParticipantsClick={() => setView("participants")}
        onLogout={onLogout}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      <main className={styles.main}>
        <FeedbackToast feedback={feedback} />

        {view === "modalities" && (
          <ModalityGrid
            modalities={modalities}
            searchQuery={modalitySearchQuery}
            onSearchChange={setModalitySearchQuery}
            onExportAll={() => handleExport()}
            onExportModality={(id) => handleExport(id)}
            onViewParticipants={loadParticipants}
            loading={loadingMod}
          />
        )}

        {view === "stats" && (
          <StatsView
            statsData={statsData}
            pieStatsData={pieStatsData}
            loadingStats={loadingStats}
            loadingPieStats={loadingPieStats}
            memberFilter={memberFilter}
            chartMode={chartMode}
            pieMode={pieMode}
            activeBar={activeBar}
            onMemberFilterChange={handleMemberFilterChange}
            onChartModeChange={setChartMode}
            onPieModeChange={setPieMode}
            onBarClick={handleBarClick}
            onClearBarFilter={clearBarFilter}
          />
        )}

        {view === "finance" && (
          <FinanceView
            statsData={statsData}
            loadingStats={loadingStats}
            onExportFinance={handleExportFinance}
          />
        )}

        {view === "participants" && selectedModality && (
          <ParticipantsTable
            modality={selectedModality}
            participants={participants}
            loading={loadingPart}
            searchQuery={searchQuery}
            paymentFilter={paymentFilter}
            sortKey={sortKey}
            sortDir={sortDir}
            onSearchChange={setSearchQuery}
            onPaymentFilterChange={setPaymentFilter}
            onSort={handleSort}
            onBack={() => setView("modalities")}
            onPrint={() => window.print()}
            onExport={(id) => handleExport(id)}
            onEdit={(p) => setEditState({
              participant: p,
              fullName: p.fullName,
              whatsapp: p.whatsapp,
              healthIssues: p.healthIssues ?? "",
              gender: p.gender,
              isMember: p.isMember,
              birthDate: p.birthDate.slice(0, 10),
              modalityIds: p.subscriptions.map((s) => s.modalityId),
            })}
            onDelete={(id) => setDeleteId(id)}
            onUpdatePayment={handleUpdatePaymentStatus}
          />
        )}
      </main>

      {view === "participants" && selectedModality && (
        <PrintLayout
          modality={selectedModality}
          participants={filteredParticipants}
        />
      )}

      {deleteId && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {editState && (
        <EditParticipantModal
          editState={editState}
          modalities={modalities}
          saving={saving}
          onEditStateChange={setEditState}
          onSave={handleSaveEdit}
          onCancel={() => setEditState(null)}
        />
      )}
    </div>
  );
}
