import styles from "../../pages/AdminDashboard.module.css";

interface FeedbackToastProps {
  feedback: { type: "success" | "error"; msg: string } | null;
}

export function FeedbackToast({ feedback }: FeedbackToastProps) {
  if (!feedback) return null;
  return (
    <div className={`${styles.feedback} ${feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>
      {feedback.msg}
    </div>
  );
}
