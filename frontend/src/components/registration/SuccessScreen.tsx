import { motion } from "framer-motion";
import type { Participant } from "../../types";
import styles from "../../pages/RegistrationPage.module.css";
import { generateComprovantePdf } from "../../utils/generatePdf";

interface SuccessScreenProps {
  participant: Participant;
  onNewRegistration: () => void;
  onGoHome: () => void;
}

export function SuccessScreen({ participant, onNewRegistration, onGoHome }: SuccessScreenProps) {
  return (
    <div className={styles.successCard}>
      <div className={styles.successIcon}>🏅</div>
      <h1>Inscrição confirmada!</h1>
      <p className={styles.successTagline}>Já pode começar a alongar! 🤸‍♂️</p>
      <p>
        Olá, <strong>{participant.fullName}</strong>! Sua inscrição foi registrada com sucesso.
      </p>
      <div className={styles.modalitiesList}>
        <h3>Modalidades inscritas:</h3>
        {participant.subscriptions.map((s) => (
          <div key={s.id} className={styles.modalityTag}>{s.modality.name}</div>
        ))}
      </div>
      <div className={styles.pixInfo}>
        <h3>Próximos passos</h3>
        <p>Taxa de inscrição: <strong>R$ 15,09 por pessoa</strong> (isento até 8 anos).</p>
        <p>
          Faça o PIX para <strong>eventosibbnatal@gmail.com</strong> e envie o comprovante para
          o contato da Nanda.
        </p>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
        <motion.button
          className="btn btn-primary"
          onClick={() => generateComprovantePdf(participant)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Baixar seu Ingresso PDF
        </motion.button>
        <motion.button
          className="btn btn-secondary"
          onClick={onNewRegistration}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Nova inscrição
        </motion.button>
        <motion.button
          className="btn btn-secondary"
          onClick={onGoHome}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voltar para página inicial
        </motion.button>
      </div>
    </div>
  );
}
