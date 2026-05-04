import { motion } from "framer-motion";
import styles from "../../../pages/RegistrationPage.module.css";

const PAYMENT_DISCLAIMER_TITLES = [
  "Valor por pessoa",
  "Sobre o valor",
  "Sobre a camisa",
  "Crianças até 8 anos",
  "A partir de 9 anos",
  "Como pagar",
  "Escolha de modalidades",
  "Número mínimo de inscritos",
] as const;

const PAYMENT_DISCLAIMER_CHECKBOXES = [
  "Entendi — pago uma vez e escolho quantas modalidades quiser.",
  "Entendi sobre o propósito do valor.",
  "Entendi que a camisa é vendida separadamente.",
  "Entendi a regra de isenção para crianças até 8 anos.",
  "Entendi que a partir de 09 anos o valor é R$ 15,09.",
  "Entendi como fazer o pagamento e enviar o comprovante para a Nanda.",
  "Entendi — vou escolher as modalidades no próximo passo.",
  "Entendi sobre o número mínimo de inscrições por modalidade.",
] as const;

interface PaymentDisclaimerStepProps {
  subStep: number;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onNext: () => void;
}

export function PaymentDisclaimerStep({ subStep, checked, onCheck, onNext }: PaymentDisclaimerStepProps) {
  return (
    <div className={styles.questionBlock}>
      <div className={styles.questionLabel}>{PAYMENT_DISCLAIMER_TITLES[subStep]}</div>

      {subStep === 0 && (
        <div className={styles.disclaimer}>
          <p>👤 O valor de <strong>R$ 15,09 é por pessoa, e não por modalidade</strong>. Isso significa que você paga somente uma vez e pode se inscrever em quantas modalidades quiser.</p>
        </div>
      )}
      {subStep === 1 && (
        <div className={styles.disclaimer}>
          <p>💰 O valor é simbólico e serve para custear despesas e necessidades básicas para a execução do evento.</p>
        </div>
      )}
      {subStep === 2 && (
        <div className={styles.disclaimer}>
          <p>👕 A camisa será vendida à parte e <strong>não está inclusa</strong> no valor apresentado! Sendo este, somente o valor da <strong>INSCRIÇÃO</strong>.</p>
        </div>
      )}
      {subStep === 3 && (
        <div className={styles.disclaimer}>
          <p>👶 Crianças até <strong>08 (oito) anos</strong> de idade não precisam pagar o valor apresentado para se inscrever, estão isentas, mas os pais precisam preencher este formulário e fazer a inscrição da mesma forma.</p>
        </div>
      )}
      {subStep === 4 && (
        <div className={styles.disclaimer}>
          <p>📋 Todos (crianças, adolescentes, jovens e adultos) a partir de <strong>09 anos</strong> de idade pagam o valor normal de <strong>R$ 15,09</strong>.</p>
        </div>
      )}
      {subStep === 5 && (
        <div className={styles.disclaimer}>
          <p>💳 O valor da inscrição deve ser pago para o seguinte pix (e-mail):</p>
          <p><strong>eventosibbnatal@gmail.com</strong></p>
          <p style={{ marginTop: "var(--space-3)", fontWeight: "600", color: "var(--color-gray-800)" }}>⚠️ ATENÇÃO!</p>
          <p>Favor enviar o comprovante do pix para <strong>Maria Fernanda (Nanda)</strong> para efetivar sua inscrição nas Olimpíadas IBB. O contato dela está disponível no nosso grupo dos <strong>INFORMATIVOS IBB</strong> no WhatsApp.</p>
          <p>Lembrando que o pix (transferência) em si deve ser feito para o e-mail descrito acima e <strong>não para o número de Nanda</strong>. Para ela você vai enviar somente o comprovante do pix já feito.</p>
        </div>
      )}
      {subStep === 6 && (
        <div className={styles.disclaimer}>
          <p>🏅 Nesse momento é importante para nós sabermos as modalidades que gostaria de participar, desde já nos programaremos para que seja um momento de grande lazer, alegria e comunhão.</p>
          <p>Não se preocupe, as modalidades que são jogadas em equipes serão formadas/divididas levando em consideração as idades e/ou "nível" do participante (iniciante, intermediário, avançado).</p>
        </div>
      )}
      {subStep === 7 && (
        <div className={styles.disclaimer}>
          <p style={{ fontWeight: "600", color: "var(--color-gray-800)" }}>⚠️ ATENÇÃO!</p>
          <p>Com exceção das modalidades <strong>"CORRIDA"</strong> e <strong>"CAMINHADA"</strong>, para as demais modalidades acontecerem precisamos de um número mínimo de inscritos definido pelo coordenador de cada modalidade.</p>
          <ul style={{ marginTop: "var(--space-2)", paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <li>Caso este número mínimo não seja atingido ao fim das inscrições, a modalidade será cancelada.</li>
            <li>O eventual cancelamento de uma das modalidades será informado em nossos grupos de WhatsApp.</li>
          </ul>
        </div>
      )}

      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        <span>{PAYMENT_DISCLAIMER_CHECKBOXES[subStep]}</span>
      </label>
      <motion.button
        className="btn btn-primary"
        disabled={!checked}
        onClick={onNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {subStep === 7 ? "Escolher modalidades →" : "Entendido, continuar →"}
      </motion.button>
    </div>
  );
}
