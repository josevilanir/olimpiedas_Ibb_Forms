import { motion } from "framer-motion";
import type { MembershipStatus } from "../../../types";
import styles from "../../../pages/RegistrationPage.module.css";

interface MemberStepProps {
  onSelect: (status: MembershipStatus) => void;
}

const options: { value: MembershipStatus; label: string }[] = [
  { value: "SIM", label: "Sou membro da IBB" },
  { value: "GR",  label: "Frequento um GR da IBB" },
  { value: "NAO", label: "Não sou membro" },
];

export function MemberStep({ onSelect }: MemberStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>Vínculo com a IBB</div>
      <div className={styles.optionGroup}>
        {options.map(({ value, label }) => (
          <motion.button
            key={value}
            className={styles.optionBtn}
            onClick={() => onSelect(value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
