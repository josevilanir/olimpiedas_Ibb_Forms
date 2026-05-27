import { useState } from "react";
import { motion } from "framer-motion";
import type { RegistrationFormData, Modality } from "../../../types";
import styles from "../../../pages/RegistrationPage.module.css";
import { ModalityCard } from "../ModalityCard";
import { UnavailableModalityCard } from "../UnavailableModalityCard";
import { ageLabel } from "../../../utils/format";
import { getModalityCategory } from "../../../utils/modalityGrouping";

interface ModalitiesStepProps {
  form: RegistrationFormData;
  age: number | null;
  availableMods: Modality[];
  unavailableMods: { modality: Modality; reasons: string[] }[];
  loadingModalities: boolean;
  modalitiesError: string | null;
  blockedModality: string | null;
  themeColor: string;
  onToggleModality: (modality: Modality) => void;
  onSetThemeColor: (color: string) => void;
  onDismissBlock: () => void;
  onNext: () => void;
}

export function ModalitiesStep({
  form, age, availableMods, unavailableMods, loadingModalities, modalitiesError,
  blockedModality, themeColor, onToggleModality, onSetThemeColor, onDismissBlock, onNext,
}: ModalitiesStepProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredAvailable = availableMods.filter(m => activeFilter === "all" || getModalityCategory(m.name) === activeFilter);
  const filteredUnavailable = unavailableMods.filter(u => activeFilter === "all" || getModalityCategory(u.modality.name) === activeFilter);

  return (
    <div
      className={styles.questionBlock}
      style={{
        boxShadow: themeColor !== "transparent" ? `0 0 40px ${themeColor}, inset 0 0 20px ${themeColor}` : undefined,
        transition: "box-shadow 0.4s ease",
      }}
    >
      <div className={styles.questionLabel}>Escolha as modalidades</div>
      {(availableMods.length > 0 || unavailableMods.length > 0) && (
        <div className={styles.filterTabs}>
          {["all", "corrida", "coletivo", "esports", "individual"].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === "all" ? "Todas" : f === "coletivo" ? "Coletivos" : f === "individual" ? "Individual" : f === "esports" ? "E-Sports" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {age !== null && (
        <div className={styles.participantSummary}>
          {form.fullName} · {age} anos ·{" "}
          {form.isMember === "SIM" ? "Membro IBB" : form.isMember === "GR" ? "Membro GR" : "Não membro"}
        </div>
      )}

      {loadingModalities && <p className={styles.hint}>Carregando modalidades...</p>}
      {modalitiesError && <div className="alert alert-error">{modalitiesError}</div>}

      {blockedModality && (
        <div className={styles.blockModal}>
          <div className={styles.blockModalContent}>
            <p>⚠️ {blockedModality}</p>
            <button className="btn btn-primary" onClick={onDismissBlock}>Entendido</button>
          </div>
        </div>
      )}



      {filteredAvailable.length > 0 && (
        <div className={styles.modalityGroup}>
          <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupEligible}`}>
            ✓ Modalidades disponíveis para você
          </div>
          <div className={styles.modalitiesGrid}>
            {filteredAvailable.map((m) => (
              <ModalityCard
                key={m.id}
                modality={m}
                selected={form.modalityIds.includes(m.id)}
                eligible={true}
                onToggle={() => onToggleModality(m)}
                onHover={onSetThemeColor}
                ageRangeLabel={ageLabel(m.minAge, m.maxAge)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredUnavailable.length > 0 && (
        <div className={styles.modalityGroup}>
          <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupRestricted}`}>
            🔒 Modalidades indisponíveis
          </div>
          <div className={styles.modalitiesGrid}>
            {filteredUnavailable.map(({ modality, reasons }) => (
              <UnavailableModalityCard
                key={modality.id}
                modality={modality}
                reasons={reasons}
                ageRangeLabel={ageLabel(modality.minAge, modality.maxAge)}
              />
            ))}
          </div>
        </div>
      )}

      {form.modalityIds.length > 0 ? (
        <motion.button
          className="btn btn-primary"
          style={{ marginTop: "var(--space-4)" }}
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Confirmar {form.modalityIds.length} modalidade{form.modalityIds.length !== 1 ? "s" : ""} →
        </motion.button>
      ) : (
        <p className={styles.hint}>Selecione ao menos uma modalidade para continuar.</p>
      )}
    </div>
  );
}
