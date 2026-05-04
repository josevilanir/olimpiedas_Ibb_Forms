import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { RegistrationFormData, Participant, MembershipStatus, Gender, Modality } from "../types";
import { useModalities } from "../hooks/useModalities";
import { calculateAge } from "../hooks/useAge";
import { api } from "../services/api";
import styles from "./RegistrationPage.module.css";
import { ProgressBar } from "../components/registration/ProgressBar";
import { SuccessScreen } from "../components/registration/SuccessScreen";
import { DisclaimerStep } from "../components/registration/steps/DisclaimerStep";
import { ProfileStep } from "../components/registration/steps/ProfileStep";
import { TextInputStep } from "../components/registration/steps/TextInputStep";
import { DateInputStep } from "../components/registration/steps/DateInputStep";
import { GenderStep } from "../components/registration/steps/GenderStep";
import { MemberStep } from "../components/registration/steps/MemberStep";
import { HealthStep } from "../components/registration/steps/HealthStep";
import { PaymentDisclaimerStep } from "../components/registration/steps/PaymentDisclaimerStep";
import { ModalitiesStep } from "../components/registration/steps/ModalitiesStep";
import { TermsStep } from "../components/registration/steps/TermsStep";

// ─── Step indices ─────────────────────────────────────────────────────────────
const S = {
  DISCLAIMER_1: 0,
  DISCLAIMER_2: 1,
  DISCLAIMER_3: 2,
  PROFILE: 3,
  PARENT_NAME: 4,
  FULL_NAME: 5,
  BIRTH_DATE: 6,
  WHATSAPP: 7,
  GENDER: 8,
  MEMBER: 9,
  HEALTH: 10,
  PAYMENT_DISCLAIMER: 11,
  MODALITIES: 12,
  TERMS: 13,
} as const;

const TOTAL_STEPS = 14;
const PAYMENT_DISCLAIMER_TOTAL = 8;

const slideVariants = {
  initial: (dir: number) => ({ x: dir * 300, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (dir: number) => ({ x: dir * -300, opacity: 0 }),
};

const INITIAL_FORM: RegistrationFormData = {
  isForChild: false,
  isMember: "SIM",
  birthDate: "",
  fullName: "",
  parentName: "",
  whatsapp: "",
  gender: "",
  healthIssues: "",
  termsAccepted: false,
  modalityIds: [],
};

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(S.DISCLAIMER_1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<RegistrationFormData>(INITIAL_FORM);
  const [blockedModality, setBlockedModality] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Participant | null>(null);
  const [termsStep, setTermsStep] = useState<number>(0);
  const [paymentDisclaimerStep, setPaymentDisclaimerStep] = useState<number>(0);
  const [themeColor, setThemeColor] = useState("transparent");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const { modalities, loading: loadingModalities, error: modalitiesError } = useModalities();
  const age = useMemo(() => calculateAge(form.birthDate), [form.birthDate]);
  const isMember = form.isMember === "SIM" || form.isMember === "GR";

  const { availableMods, unavailableMods } = useMemo(() => {
    if (age === null)
      return { availableMods: modalities, unavailableMods: [] as { modality: Modality; reasons: string[] }[] };

    const availableMods: Modality[] = [];
    const unavailableMods: { modality: Modality; reasons: string[] }[] = [];

    for (const m of modalities) {
      const reasons: string[] = [];
      const ageOk = (m.minAge === null || age >= m.minAge) && (m.maxAge === null || age <= m.maxAge);
      const memberOk = !m.requiresMembership || isMember;
      if (!ageOk) reasons.push(`Sua idade (${age} anos) não atende a faixa exigida.`);
      if (!memberOk) reasons.push(`Modalidade exclusiva para membros IBB ou GR.`);
      if (reasons.length === 0) availableMods.push(m);
      else unavailableMods.push({ modality: m, reasons });
    }
    return { availableMods, unavailableMods };
  }, [modalities, age, isMember]);

  useEffect(() => {
    if (!registered) return;
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.45, x: 0.25 } }), 350);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.45, x: 0.75 } }), 600);
  }, [registered]);

  function setField<K extends keyof RegistrationFormData>(key: K, value: RegistrationFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goNext(forChild?: boolean) {
    setDirection(1);
    setDisclaimerChecked(false);
    setCurrentStep((prev) => {
      let next = prev + 1;
      const childFlag = forChild !== undefined ? forChild : form.isForChild;
      if (next === S.PARENT_NAME && !childFlag) next = S.FULL_NAME;
      return next;
    });
  }

  function goNextPaymentDisclaimer() {
    setDirection(1);
    if (paymentDisclaimerStep >= PAYMENT_DISCLAIMER_TOTAL - 1) {
      goNext();
    } else {
      setDisclaimerChecked(false);
      setPaymentDisclaimerStep((p) => p + 1);
    }
  }

  function goBack() {
    setDirection(-1);
    if (currentStep === S.PAYMENT_DISCLAIMER && paymentDisclaimerStep > 0) {
      setDisclaimerChecked(false);
      setPaymentDisclaimerStep((p) => p - 1);
      return;
    }
    if (currentStep === S.MODALITIES) {
      setPaymentDisclaimerStep(PAYMENT_DISCLAIMER_TOTAL - 1);
    }
    setCurrentStep((prev) => {
      let next = prev - 1;
      if (next === S.PARENT_NAME && !form.isForChild) next = S.PROFILE;
      return Math.max(S.DISCLAIMER_1, next);
    });
  }

  function handleModalityToggle(modality: Modality) {
    if (form.modalityIds.includes(modality.id))
      setField("modalityIds", form.modalityIds.filter((id) => id !== modality.id));
    else
      setField("modalityIds", [...form.modalityIds, modality.id]);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const participant = await api.participants.register({ ...form, termsAccepted: true });
      setRegistered(participant);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao enviar inscrição.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep(): React.ReactNode {
    switch (currentStep) {
      case S.DISCLAIMER_1:
        return (
          <DisclaimerStep
            title="Antes de começar — leia com atenção"
            content={
              <>
                <p>📋 A inscrição é <strong>individual</strong>.</p>
                <p>Cada integrante da sua família deve preencher este formulário individualmente para se inscrever.</p>
              </>
            }
            checkboxLabel="Entendi — estou fazendo minha inscrição individual."
            buttonLabel="Entendido, continuar →"
            checked={disclaimerChecked}
            onCheck={setDisclaimerChecked}
            onNext={() => goNext()}
          />
        );

      case S.DISCLAIMER_2:
        return (
          <DisclaimerStep
            title="Sobre o valor da inscrição"
            content={
              <>
                <p>💰 O valor da inscrição é <strong>por pessoa e não por modalidade</strong>.</p>
                <p>Você pode se inscrever em <strong>quantas modalidades quiser</strong> pagando apenas uma vez.</p>
              </>
            }
            checkboxLabel="Entendi — pago uma vez e escolho várias modalidades."
            buttonLabel="Entendido, continuar →"
            checked={disclaimerChecked}
            onCheck={setDisclaimerChecked}
            onNext={() => goNext()}
          />
        );

      case S.DISCLAIMER_3:
        return (
          <DisclaimerStep
            title="Regras de participação"
            content={
              <>
                <p>🏅 Com exceção das modalidades de <strong>CORRIDA</strong> (Longa e Curtas) e <strong>CAMINHADA</strong>, para participar das demais você precisa ser:</p>
                <ul style={{ marginTop: "var(--space-2)", paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  <li>Membro IBB, <strong>ou</strong></li>
                  <li>Frequentador de algum GR (Grupo de Relacionamento) da IBB.</li>
                </ul>
              </>
            }
            checkboxLabel="Entendi as regras de participação."
            buttonLabel="Vamos lá! 🎉"
            checked={disclaimerChecked}
            onCheck={setDisclaimerChecked}
            onNext={() => goNext()}
          />
        );

      case S.PROFILE:
        return (
          <ProfileStep
            onSelectAdult={() => { setField("isForChild", false); goNext(false); }}
            onSelectChild={() => { setField("isForChild", true); goNext(true); }}
          />
        );

      case S.PARENT_NAME:
        return (
          <TextInputStep
            label="Nome do responsável"
            value={form.parentName ?? ""}
            placeholder="Nome completo do responsável"
            onChange={(v) => setField("parentName", v)}
            onNext={() => goNext()}
            canProceed={!!(form.parentName?.trim())}
          />
        );

      case S.FULL_NAME:
        return (
          <TextInputStep
            label={form.isForChild ? "Nome completo da criança" : "Seu nome completo"}
            value={form.fullName}
            placeholder="Nome e sobrenome"
            onChange={(v) => setField("fullName", v)}
            onNext={() => goNext()}
            canProceed={!!form.fullName.trim()}
          />
        );

      case S.BIRTH_DATE:
        return (
          <DateInputStep
            label={form.isForChild ? "Data de nascimento do seu filho(a)" : "Sua data de nascimento"}
            value={form.birthDate}
            age={age}
            onChange={(v) => setField("birthDate", v)}
            onNext={() => goNext()}
          />
        );

      case S.WHATSAPP:
        return (
          <TextInputStep
            label={form.isForChild ? "WhatsApp do responsável" : "Seu WhatsApp"}
            value={form.whatsapp}
            placeholder="(84) 99999-9999"
            type="tel"
            onChange={(v) => setField("whatsapp", v)}
            onNext={() => goNext()}
            canProceed={!!form.whatsapp.trim()}
          />
        );

      case S.GENDER:
        return (
          <GenderStep
            label={form.isForChild ? "Sexo do seu filho(a)" : "Seu sexo"}
            onSelect={(g: Gender) => { setField("gender", g); goNext(); }}
          />
        );

      case S.MEMBER:
        return (
          <MemberStep
            onSelect={(s: MembershipStatus) => { setField("isMember", s); goNext(); }}
          />
        );

      case S.HEALTH:
        return (
          <HealthStep
            label={form.isForChild ? "Problemas de saúde do seu filho(a)" : "Seus problemas de saúde"}
            value={form.healthIssues ?? ""}
            onChange={(v) => setField("healthIssues", v)}
            onSkip={() => { setField("healthIssues", "Não informado"); goNext(); }}
            onNext={() => goNext()}
          />
        );

      case S.PAYMENT_DISCLAIMER:
        return (
          <PaymentDisclaimerStep
            subStep={paymentDisclaimerStep}
            checked={disclaimerChecked}
            onCheck={setDisclaimerChecked}
            onNext={goNextPaymentDisclaimer}
          />
        );

      case S.MODALITIES:
        return (
          <ModalitiesStep
            form={form}
            age={age}
            availableMods={availableMods}
            unavailableMods={unavailableMods}
            loadingModalities={loadingModalities}
            modalitiesError={modalitiesError}
            blockedModality={blockedModality}
            themeColor={themeColor}
            onToggleModality={handleModalityToggle}
            onSetThemeColor={setThemeColor}
            onDismissBlock={() => setBlockedModality(null)}
            onNext={() => goNext()}
          />
        );

      case S.TERMS:
        return (
          <TermsStep
            isMember={form.isMember}
            termsStep={termsStep}
            onTermsStepChange={setTermsStep}
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        );

      default:
        return null;
    }
  }

  if (registered) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <SuccessScreen
            participant={registered}
            onNewRegistration={() => {
              setForm(INITIAL_FORM);
              setCurrentStep(S.DISCLAIMER_1);
              setTermsStep(0);
              setRegistered(null);
            }}
            onGoHome={() => navigate("/")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ProgressBar step={currentStep} total={TOTAL_STEPS} />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Olimpíadas IBB</h1>
          <p className={styles.subtitle}>Formulário de inscrição</p>
        </header>
        {currentStep > S.DISCLAIMER_1 && (
          <motion.button
            className={styles.backBtn}
            onClick={goBack}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Voltar
          </motion.button>
        )}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep === S.PAYMENT_DISCLAIMER ? `payment-${paymentDisclaimerStep}` : currentStep}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
