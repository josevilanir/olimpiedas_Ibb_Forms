import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";

interface TextInputStepProps {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
  onNext: () => void;
  canProceed: boolean;
}

export function TextInputStep({ label, value, placeholder, type = "text", onChange, onNext, canProceed }: TextInputStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>{label}</div>
      <div className={styles.inputRow}>
        <input
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter" && canProceed) onNext(); }}
        />
        <motion.button
          className="btn btn-primary"
          disabled={!canProceed}
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          →
        </motion.button>
      </div>
    </div>
  );
}
