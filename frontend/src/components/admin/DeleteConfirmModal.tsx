import styles from "../../pages/AdminDashboard.module.css";

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Confirmar remoção</h3>
        <p>Tem certeza que deseja remover esta inscrição? Esta ação não pode ser desfeita.</p>
        <div className={styles.modalActions}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
