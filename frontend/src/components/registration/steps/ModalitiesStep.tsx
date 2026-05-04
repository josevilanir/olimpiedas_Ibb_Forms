import { motion } from "framer-motion";
import type { RegistrationFormData, Modality } from "../../../types";
import styles from "../../../pages/RegistrationPage.module.css";
import { ModalityCard } from "../ModalityCard";
import { UnavailableModalityCard } from "../UnavailableModalityCard";
import { ageLabel } from "../../../utils/format";

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
  return (
    <div
      className={styles.questionBlock}
      style={{
        boxShadow: themeColor !== "transparent" ? `0 0 40px ${themeColor}, inset 0 0 20px ${themeColor}` : undefined,
        transition: "box-shadow 0.4s ease",
      }}
    >
      <div className={styles.questionLabel}>Escolha as modalidades</div>
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

      {availableMods.length > 0 && (
        <div className={styles.modalityGroup}>
          <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupEligible}`}>
            ✓ Modalidades disponíveis para você
          </div>
          <div className={styles.modalitiesGrid}>
            {availableMods.map((m) => (
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

      {unavailableMods.length > 0 && (
        <div className={styles.modalityGroup}>
          <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupRestricted}`}>
            🔒 Modalidades indisponíveis
          </div>
          <div className={styles.modalitiesGrid}>
            {unavailableMods.map(({ modality, reasons }) => (
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
