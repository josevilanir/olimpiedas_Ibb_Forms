import { motion } from "framer-motion";
import type { MembershipStatus } from "../../../types";
import styles from "../../../pages/RegistrationPage.module.css";

interface TermsStepProps {
  isMember: MembershipStatus;
  termsStep: number;
  onTermsStepChange: (step: number) => void;
  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}

export function TermsStep({ isMember, termsStep, onTermsStepChange, submitting, submitError, onSubmit }: TermsStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>Antes de finalizar, precisamos frisar bastante as orientações abaixo — leia com atenção para que você não tenha problemas</div>

      <div className={styles.disclaimer}>
        <h3>💰 Taxa de inscrição e pagamento via PIX</h3>
        <p>
          A taxa de inscrição é de <strong>R$ 15,09 por pessoa</strong> (crianças até 8 anos são isentas).
        </p>
        <p>
          O pagamento deve ser feito via <strong>PIX</strong> para o e-mail{" "}
          <strong>eventosibbnatal@gmail.com</strong> e, em seguida, você deve enviar{" "}
          <strong>somente o comprovante</strong> para o contato da Nanda.{" "}
          {isMember === "NAO" ? (
            <>O contato dela é: <strong>(84) 99647-9320</strong>.</>
          ) : (
            <>O contato dela está disponível no nosso grupo dos <strong>INFORMATIVOS IBB</strong> no WhatsApp.</>
          )}
        </p>
      </div>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={termsStep >= 1}
          onChange={(e) => onTermsStepChange(e.target.checked ? 1 : 0)}
        />
        <span>Li e entendi tudo sobre o valor e o processo de pagamento.</span>
      </label>

      {termsStep >= 1 && (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={termsStep >= 2}
            onChange={(e) => onTermsStepChange(e.target.checked ? 2 : 1)}
          />
          <span>
            Entendi que o PIX deve ser feito para o e-mail <strong>eventosibbnatal@gmail.com</strong>.
          </span>
        </label>
      )}

      {termsStep >= 2 && (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={termsStep >= 3}
            onChange={(e) => onTermsStepChange(e.target.checked ? 3 : 2)}
          />
          <span>
            Entendi que vou enviar somente o <strong>COMPROVANTE</strong> para o contato da Nanda —
            não vou fazer a transferência para a conta dela.
          </span>
        </label>
      )}

      {termsStep >= 3 && (
        <>
          <div className={styles.disclaimer} style={{ marginTop: "var(--space-2)" }}>
            <h3>👕 Camiseta não inclusa</h3>
            <p>
              A camiseta oficial do evento <strong>não está inclusa</strong> na taxa de inscrição e
              deverá ser adquirida separadamente, caso seja do seu interesse.
            </p>
          </div>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={termsStep >= 4}
              onChange={(e) => onTermsStepChange(e.target.checked ? 4 : 3)}
            />
            <span>Li e entendi sobre a camiseta.</span>
          </label>
        </>
      )}

      {termsStep >= 4 && (
        <>
          {submitError && (
            <div className="alert alert-error" style={{ marginTop: "var(--space-3)" }}>
              {submitError}
            </div>
          )}
          <motion.button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-4)", width: "100%" }}
            disabled={submitting}
            onClick={onSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {submitting ? "Enviando..." : "Confirmar inscrição 🎉"}
          </motion.button>
        </>
      )}
    </div>
  );
}
