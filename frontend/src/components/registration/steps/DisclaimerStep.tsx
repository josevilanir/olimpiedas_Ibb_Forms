import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";

interface DisclaimerStepProps {
  title: string;
  content: React.ReactNode;
  checkboxLabel: string;
  buttonLabel: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onNext: () => void;
}

export function DisclaimerStep({ title, content, checkboxLabel, buttonLabel, checked, onCheck, onNext }: DisclaimerStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>{title}</div>
      <div className={styles.disclaimer}>{content}</div>
      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        <span>{checkboxLabel}</span>
      </label>
      <motion.button
        className="btn btn-primary"
        disabled={!checked}
        onClick={onNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {buttonLabel}
      </motion.button>
    </div>
  );
}
