import { motion } from "framer-motion";
import type { Gender } from "../../../types";
import styles from "../../../pages/RegistrationPage.module.css";

interface GenderStepProps {
  label: string;
  onSelect: (gender: Gender) => void;
}

export function GenderStep({ label, onSelect }: GenderStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>{label}</div>
      <div className={styles.optionGroup}>
        {(["MASCULINO", "FEMININO"] as Gender[]).map((g) => (
          <motion.button
            key={g}
            className={styles.optionBtn}
            onClick={() => onSelect(g)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {g === "MASCULINO" ? "Masculino" : "Feminino"}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
