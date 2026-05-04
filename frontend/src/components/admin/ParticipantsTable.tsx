import type { Modality, Participant, PaymentStatus, SortKey, SortDir, PaymentFilter } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";
import { calcAge, isAgeOutOfRange } from "../../utils/age";
import { formatDate } from "../../utils/format";

interface ParticipantsTableProps {
  modality: Modality;
  participants: Participant[];
  loading: boolean;
  searchQuery: string;
  paymentFilter: PaymentFilter;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSearchChange: (q: string) => void;
  onPaymentFilterChange: (f: PaymentFilter) => void;
  onSort: (key: SortKey) => void;
  onBack: () => void;
  onPrint: () => void;
  onExport: (modalityId: string) => void;
  onEdit: (p: Participant) => void;
  onDelete: (id: string) => void;
  onUpdatePayment: (p: Participant, status: PaymentStatus) => void;
}

const paymentFilterLabels: Record<PaymentFilter, string> = {
  ALL: "Todos Pagamentos",
  PENDENTE: "Pendentes",
  PAGO: "Pagos",
  CANCELADO: "Cancelados",
};

export function ParticipantsTable({
  modality, participants, loading, searchQuery, paymentFilter, sortKey, sortDir,
  onSearchChange, onPaymentFilterChange, onSort, onBack, onPrint, onExport,
  onEdit, onDelete, onUpdatePayment,
}: ParticipantsTableProps) {
  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function getSortedParticipants(list: Participant[]): Participant[] {
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (sortKey === "age") {
        aVal = calcAge(a.birthDate);
        bVal = calcAge(b.birthDate);
      } else if (sortKey === "createdAt") {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else {
        aVal = (a[sortKey] ?? "").toString().toLowerCase();
        bVal = (b[sortKey] ?? "").toString().toLowerCase();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const filtered = getSortedParticipants(participants.filter((p) => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === "ALL" || p.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={onBack}>← Voltar</button>
          <h2>{modality.name}</h2>
          <p className={styles.participantCount}>{participants.length} inscrito{participants.length !== 1 ? "s" : ""}</p>
        </div>
        <div className={styles.participantActions}>
          <button className="btn btn-secondary" onClick={onPrint}>🖨️ Imprimir lista</button>
          <button className="btn btn-secondary" onClick={() => onExport(modality.id)}>Exportar Excel</button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          className={`form-input ${styles.searchInput}`}
          placeholder="Buscar por nome..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className={styles.paymentFilterRow}>
          {(["ALL", "PENDENTE", "PAGO", "CANCELADO"] as PaymentFilter[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterPill} ${paymentFilter === f ? styles.filterPillActive : ""}`}
              onClick={() => onPaymentFilterChange(f)}
            >
              {paymentFilterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className={styles.loading}>Carregando inscritos...</p>}

      {!loading && participants.length === 0 && (
        <div className={styles.empty}>Nenhum inscrito nesta modalidade ainda.</div>
      )}

      {!loading && participants.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => onSort("fullName")} style={{ cursor: "pointer" }}>Nome{sortIndicator("fullName")}</th>
                <th onClick={() => onSort("parentName")} style={{ cursor: "pointer" }}>Responsável{sortIndicator("parentName")}</th>
                <th onClick={() => onSort("age")} style={{ cursor: "pointer" }}>Idade{sortIndicator("age")}</th>
                <th>WhatsApp</th>
                <th>Sexo</th>
                <th onClick={() => onSort("isMember")} style={{ cursor: "pointer" }}>Membro{sortIndicator("isMember")}</th>
                <th onClick={() => onSort("paymentStatus")} style={{ cursor: "pointer" }}>Pagamento{sortIndicator("paymentStatus")}</th>
                <th>Inf. Saúde</th>
                <th onClick={() => onSort("createdAt")} style={{ cursor: "pointer" }}>Inscrito em{sortIndicator("createdAt")}</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const ageAlert = isAgeOutOfRange(p.birthDate, modality);
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.fullName}</strong>
                      {ageAlert && (
                        <span className={styles.ageAlert} title="Idade fora do range da modalidade"> ⚠️</span>
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
                        onChange={(e) => onUpdatePayment(p, e.target.value as PaymentStatus)}
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
                        <button className={`btn ${styles.btnSm} btn-secondary`} onClick={() => onEdit(p)}>Editar</button>
                        <button className={`btn ${styles.btnSm} btn-danger`} onClick={() => onDelete(p.id)}>Remover</button>
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
  );
}
