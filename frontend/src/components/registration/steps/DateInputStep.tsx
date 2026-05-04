import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";
import { DateWheelPicker } from "../DateWheelPicker";

interface DateInputStepProps {
  label: string;
  value: string;
  age: number | null;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function DateInputStep({ label, value, age, onChange, onNext }: DateInputStepProps) {
  // Convert YYYY-MM-DD string to Date object, avoiding timezone shifts
  const dateValue = value ? new Date(value + "T00:00:00") : undefined;

  const handleDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
  };

  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>{label}</div>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2.5rem 0', width: '100%' }}>
        <DateWheelPicker 
          value={dateValue}
          onChange={handleDateChange}
          size="lg"
        />
      </div>

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
