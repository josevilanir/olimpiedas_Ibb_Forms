import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";

interface DateInputStepProps {
  label: string;
  value: string;
  age: number | null;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function DateInputStep({ label, value, age, onChange, onNext }: DateInputStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>{label}</div>
      <input
        type="date"
        className="form-input"
        value={value}
        max={new Date().toISOString().split("T")[0]}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
      />
      {age !== null && (
        <div className={styles.ageBadge}>
          🎂 Idade calculada: <strong>{age} anos</strong>
        </div>
      )}
      {age !== null && (
        <motion.button
          className="btn btn-primary"
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Confirmar →
        </motion.button>
      )}
    </div>
  );
}
