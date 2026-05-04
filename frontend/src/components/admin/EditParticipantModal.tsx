import type { Gender, Modality, MembershipStatus, EditState } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";

interface EditParticipantModalProps {
  editState: EditState;
  modalities: Modality[];
  saving: boolean;
  onEditStateChange: (updater: (prev: EditState | null) => EditState | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditParticipantModal({ editState, modalities, saving, onEditStateChange, onSave, onCancel }: EditParticipantModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.modalLarge}`}>
        <h3>Editar inscrição</h3>
        <div className={styles.editForm}>
          <div className={styles.editGrid}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                className="form-input"
                value={editState.fullName}
                onChange={(e) => onEditStateChange((s) => s && ({ ...s, fullName: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                className="form-input"
                value={editState.whatsapp}
                onChange={(e) => onEditStateChange((s) => s && ({ ...s, whatsapp: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input
                className="form-input"
                type="date"
                value={editState.birthDate}
                onChange={(e) => onEditStateChange((s) => s && ({ ...s, birthDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sexo</label>
              <select
                className="form-input"
                value={editState.gender}
                onChange={(e) => onEditStateChange((s) => s && ({ ...s, gender: e.target.value as Gender }))}
              >
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vínculo IBB</label>
              <select
                className="form-input"
                value={editState.isMember}
                onChange={(e) => onEditStateChange((s) => s && ({ ...s, isMember: e.target.value as MembershipStatus }))}
              >
                <option value="SIM">Membro IBB</option>
                <option value="GR">Freq. GR</option>
                <option value="NAO">Não membro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Informações de saúde</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={editState.healthIssues}
              onChange={(e) => onEditStateChange((s) => s && ({ ...s, healthIssues: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Modalidades</label>
            <div className={styles.modalityCheckboxes}>
              {modalities.map((m) => (
                <label key={m.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editState.modalityIds.includes(m.id)}
                    onChange={(e) => {
                      onEditStateChange((s) => {
                        if (!s) return s;
                        const ids = e.target.checked
                          ? [...s.modalityIds, m.id]
                          : s.modalityIds.filter((id) => id !== m.id);
                        return { ...s, modalityIds: ids };
                      });
                    }}
                  />
                  {m.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={onSave}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
