import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";

interface ProfileStepProps {
  onSelectAdult: () => void;
  onSelectChild: () => void;
}

export function ProfileStep({ onSelectAdult, onSelectChild }: ProfileStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>Essa inscrição é para:</div>
      <div className={styles.profileOptions}>
        <motion.button
          className={styles.profileBtn}
          onClick={onSelectAdult}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className={styles.profileIcon}>👤</span>
          <span className={styles.profileLabel}>Para mim</span>
          <span className={styles.profileDesc}>Adulto ou adolescente</span>
        </motion.button>
        <motion.button
          className={styles.profileBtn}
          onClick={onSelectChild}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className={styles.profileIcon}>👶</span>
          <span className={styles.profileLabel}>Para meu filho(a)</span>
          <span className={styles.profileDesc}>Inscrição infantil</span>
        </motion.button>
      </div>
    </div>
  );
}
