import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";

interface HealthStepProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSkip: () => void;
  onNext: () => void;
}

export function HealthStep({ label, value, onChange, onSkip, onNext }: HealthStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>
        {label}
        <span className={styles.optional}>(opcional)</span>
      </div>
      <textarea
        className="form-textarea"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Informe alergias, condições médicas ou contato de emergência"
        autoFocus
      />
      <div className={styles.inputRow} style={{ marginTop: "var(--space-3)" }}>
        <motion.button
          className="btn btn-secondary"
          onClick={onSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Não tenho / Pular
        </motion.button>
        <motion.button
          className="btn btn-primary"
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continuar →
        </motion.button>
      </div>
    </div>
  );
}
