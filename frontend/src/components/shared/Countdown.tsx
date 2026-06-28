import styles from "./Countdown.module.css";

interface CountdownProps {
  countdown: { d: string; h: string; m: string; s: string };
}

export function Countdown({ countdown }: CountdownProps) {
  return (
    <div className={styles.countdown}>
      <div className={styles.cdUnit}>
        <div className={styles.cdNum}>{countdown.d}</div>
        <div className={styles.cdLabel}>Dias</div>
      </div>
      <div className={styles.cdSep}>:</div>
      <div className={styles.cdUnit}>
        <div className={styles.cdNum}>{countdown.h}</div>
        <div className={styles.cdLabel}>Horas</div>
      </div>
      <div className={styles.cdSep}>:</div>
      <div className={styles.cdUnit}>
        <div className={styles.cdNum}>{countdown.m}</div>
        <div className={styles.cdLabel}>Min</div>
      </div>
      <div className={styles.cdSep}>:</div>
      <div className={styles.cdUnit}>
        <div className={styles.cdNum}>{countdown.s}</div>
        <div className={styles.cdLabel}>Seg</div>
      </div>
    </div>
  );
}
