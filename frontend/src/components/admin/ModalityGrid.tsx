import type { Modality } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";
import { ageLabel } from "../../utils/format";

interface ModalityGridProps {
  modalities: Modality[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportAll: () => void;
  onExportModality: (id: string) => void;
  onViewParticipants: (modality: Modality) => void;
  loading: boolean;
}

export function ModalityGrid({
  modalities, searchQuery, onSearchChange, onExportAll, onExportModality, onViewParticipants, loading,
}: ModalityGridProps) {
  const filtered = modalities.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Modalidades</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            className={`form-input ${styles.searchInput}`}
            style={{ maxWidth: "250px", marginBottom: 0 }}
            placeholder="Buscar modalidade..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={onExportAll}>
            Exportar todas (Excel)
          </button>
        </div>
      </div>

      {loading && <p className={styles.loading}>Carregando...</p>}

      <div className={styles.modalityGrid}>
        {filtered.map((m) => (
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
              <button className="btn btn-primary" onClick={() => onViewParticipants(m)}>
                Ver inscritos
              </button>
              <button className="btn btn-secondary" onClick={() => onExportModality(m.id)}>
                Excel
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className={styles.noData} style={{ gridColumn: "1 / -1" }}>Nenhuma modalidade encontrada.</p>
        )}
      </div>
    </div>
  );
}
