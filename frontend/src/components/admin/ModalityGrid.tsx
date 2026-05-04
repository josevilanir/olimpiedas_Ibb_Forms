import type { Modality } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";
import { ageLabel } from "../../utils/format";
import { groupModalities, categoryLabels, categoryIcons, type ModalityCategory } from "../../utils/modalityGrouping";
import { Carousel } from "./Carousel";

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
  const groups = groupModalities(filtered);

  const categoriesOrder: ModalityCategory[] = ["corrida", "coletivo", "esports", "kids", "livre", "geral"];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2>Modalidades</h2>
          <p className={styles.pageSubHeader}>Visualize e gerencie as inscrições por modalidade.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div className={styles.searchWrapper}>
            <input
              className={`form-input ${styles.searchInput}`}
              style={{ maxWidth: "300px", marginBottom: 0 }}
              placeholder="Buscar modalidade..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={onExportAll}>
            Exportar todas (Excel)
          </button>
        </div>
      </div>

      {loading && <p className={styles.loading}>Carregando...</p>}

      <div className={styles.categoriesWrapper}>
        {categoriesOrder.map(cat => {
          const catModalities = groups[cat];
          if (catModalities.length === 0) return null;

          return (
            <Carousel
              key={cat}
              title={categoryLabels[cat]}
              icon={categoryIcons[cat]}
            >
              {catModalities.map((m) => (
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
                      Inscritos
                    </button>
                    <button className="btn btn-secondary" onClick={() => onExportModality(m.id)}>
                      Excel
                    </button>
                  </div>
                </div>
              ))}
            </Carousel>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <p className={styles.noData}>Nenhuma modalidade encontrada para sua busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
