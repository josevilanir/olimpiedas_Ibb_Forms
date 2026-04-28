import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { RegistrationFormData, Participant, MembershipStatus, Gender, Modality } from "../types";
import { useModalities } from "../hooks/useModalities";
import { calculateAge } from "../hooks/useAge";
import { api } from "../services/api";
import { generateComprovantePdf } from "../utils/generatePdf";
import styles from "./RegistrationPage.module.css";

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

// ─── Payment disclaimer sub-screens ──────────────────────────────────────────
const PAYMENT_DISCLAIMER_TITLES = [
  "Sobre o valor",
  "Sobre a camisa",
  "Valor por pessoa",
  "Crianças até 8 anos",
  "A partir de 9 anos",
  "Como pagar",
  "Escolha de modalidades",
  "Número mínimo de inscritos",
] as const;

const PAYMENT_DISCLAIMER_CHECKBOXES = [
  "Entendi sobre o propósito do valor.",
  "Entendi que a camisa é vendida separadamente.",
  "Entendi — pago uma vez e escolho quantas modalidades quiser.",
  "Entendi a regra de isenção para crianças até 8 anos.",
  "Entendi que a partir de 09 anos o valor é R$ 15,09.",
  "Entendi como fazer o pagamento e enviar o comprovante para a Nanda.",
  "Entendi — vou escolher as modalidades no próximo passo.",
  "Entendi sobre o número mínimo de inscrições por modalidade.",
] as const;

// ─── Modality → theme color map ───────────────────────────────────────────────
const MODALITY_COLORS: [string, string][] = [
  ["natação",      "rgba(14,165,233,0.12)"],
  ["futsal",       "rgba(34,197,94,0.12)"],
  ["tênis",        "rgba(239,68,68,0.12)"],
  ["basquete",     "rgba(249,115,22,0.12)"],
  ["vôlei",        "rgba(139,92,246,0.12)"],
  ["corrida",      "rgba(236,72,153,0.12)"],
  ["caminhada",    "rgba(20,184,166,0.12)"],
  ["e-sports",     "rgba(99,102,241,0.12)"],
  ["circuito",     "rgba(245,158,11,0.12)"],
  ["queimada",     "rgba(132,204,22,0.12)"],
  ["funcional",    "rgba(16,185,129,0.12)"],
];

function modalityColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of MODALITY_COLORS) {
    if (lower.includes(key)) return color;
  }
  return "transparent";
}

// ─── Animation presets ────────────────────────────────────────────────────────
const slideVariants = {
  initial: (dir: number) => ({ x: dir * 300, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (dir: number) => ({ x: dir * -300, opacity: 0 }),
};

const microBtn = {
  whileHover: { scale: 1.05 },
  whileTap:   { scale: 0.95 },
} as const;

const microOption = {
  whileHover: { scale: 1.03 },
  whileTap:   { scale: 0.97 },
} as const;

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        <span className={styles.progressRunner} style={{ left: `calc(${pct}% - 14px)` }}>
          🏃‍♂️
        </span>
        <span className={styles.progressFlag}>🏁</span>
      </div>
      <p className={styles.progressLabel}>Etapa {step + 1} de {total}</p>
    </div>
  );
}

// ─── Modality card ────────────────────────────────────────────────────────────
function ModalityCard({
  modality,
  selected,
  eligible,
  onToggle,
  onHover,
  ageRangeLabel,
}: {
  modality: Modality;
  selected: boolean;
  eligible: boolean;
  onToggle: () => void;
  onHover: (color: string) => void;
  ageRangeLabel: string;
}) {
  return (
    <motion.button
      className={`${styles.modalityCard} ${selected ? styles.modalitySelected : ""} ${!eligible ? styles.modalityLocked : ""}`}
      onClick={onToggle}
      disabled={!eligible}
      whileHover={eligible ? { scale: 1.03, boxShadow: "0 4px 20px rgba(102,126,234,0.3)" } : undefined}
      whileTap={eligible ? { scale: 0.97 } : undefined}
      onHoverStart={eligible ? () => onHover(modalityColor(modality.name)) : undefined}
      onHoverEnd={eligible ? () => onHover("transparent") : undefined}
    >
      <span className={styles.modalityName}>{modality.name}</span>
      <span className={styles.modalityCoord}>Coord: {modality.coordinatorName}</span>
      <span className={styles.modalityAge}>{ageRangeLabel}</span>
      {modality.requiresMembership && (
        <span className={styles.modalityMember}>Membros IBB/GR</span>
      )}
      {selected && <span className={styles.modalityCheck}>✓</span>}
    </motion.button>
  );
}

// ─── Initial form state ───────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegistrationPage() {
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

  // ── Modality grouping ──────────────────────────────────────────────────────
  const { eligibleMods, ageRestrictedMods, memberRestrictedMods } = useMemo(() => {
    if (age === null)
      return { eligibleMods: modalities, ageRestrictedMods: [] as Modality[], memberRestrictedMods: [] as Modality[] };

    const eligibleMods: Modality[] = [];
    const ageRestrictedMods: Modality[] = [];
    const memberRestrictedMods: Modality[] = [];

    for (const m of modalities) {
      const ageOk = (m.minAge === null || age >= m.minAge) && (m.maxAge === null || age <= m.maxAge);
      const memberOk = !m.requiresMembership || isMember;
      if (ageOk && memberOk) eligibleMods.push(m);
      else if (!ageOk) ageRestrictedMods.push(m);
      else memberRestrictedMods.push(m);
    }
    return { eligibleMods, ageRestrictedMods, memberRestrictedMods };
  }, [modalities, age, isMember]);

  // ── Confetti on success ────────────────────────────────────────────────────
  useEffect(() => {
    if (!registered) return;
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.45, x: 0.25 } }), 350);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.45, x: 0.75 } }), 600);
  }, [registered]);

  // ── Helpers ────────────────────────────────────────────────────────────────
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
    if (paymentDisclaimerStep >= PAYMENT_DISCLAIMER_TITLES.length - 1) {
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
      setPaymentDisclaimerStep(PAYMENT_DISCLAIMER_TITLES.length - 1);
    }
    setCurrentStep((prev) => {
      let next = prev - 1;
      if (next === S.PARENT_NAME && !form.isForChild) next = S.PROFILE;
      return Math.max(S.DISCLAIMER_1, next);
    });
  }

  function ageRangeLabel(minAge: number | null, maxAge: number | null) {
    if (minAge === null && maxAge === null) return "Livre";
    if (minAge !== null && maxAge !== null) return `${minAge}–${maxAge} anos`;
    if (minAge !== null) return `${minAge}+ anos`;
    return `até ${maxAge} anos`;
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

  // ── Step renderer ──────────────────────────────────────────────────────────
  function renderStep(): React.ReactNode {
    switch (currentStep) {
      case S.DISCLAIMER_1:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Antes de começar — leia com atenção</div>
            <div className={styles.disclaimer}>
              <p>📋 A inscrição é <strong>individual</strong>.</p>
              <p>Cada integrante da sua família deve preencher este formulário individualmente para se inscrever.</p>
            </div>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={disclaimerChecked} onChange={(e) => setDisclaimerChecked(e.target.checked)} />
              <span>Entendi — estou fazendo minha inscrição individual.</span>
            </label>
            <motion.button className="btn btn-primary" disabled={!disclaimerChecked} onClick={() => goNext()} {...microBtn}>
              Entendido, continuar →
            </motion.button>
          </div>
        );

      case S.DISCLAIMER_2:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Sobre o valor da inscrição</div>
            <div className={styles.disclaimer}>
              <p>💰 O valor da inscrição é <strong>por pessoa e não por modalidade</strong>.</p>
              <p>Você pode se inscrever em <strong>quantas modalidades quiser</strong> pagando apenas uma vez.</p>
            </div>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={disclaimerChecked} onChange={(e) => setDisclaimerChecked(e.target.checked)} />
              <span>Entendi — pago uma vez e escolho várias modalidades.</span>
            </label>
            <motion.button className="btn btn-primary" disabled={!disclaimerChecked} onClick={() => goNext()} {...microBtn}>
              Entendido, continuar →
            </motion.button>
          </div>
        );

      case S.DISCLAIMER_3:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Regras de participação</div>
            <div className={styles.disclaimer}>
              <p>🏅 Com exceção das modalidades <strong>CORRIDA</strong> e <strong>CAMINHADA</strong>, para participar das demais você precisa ser:</p>
              <ul style={{ marginTop: "var(--space-2)", paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <li>Membro IBB, <strong>ou</strong></li>
                <li>Frequentador de algum GR (Grupo de Relacionamento) da IBB.</li>
              </ul>
            </div>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={disclaimerChecked} onChange={(e) => setDisclaimerChecked(e.target.checked)} />
              <span>Entendi as regras de participação.</span>
            </label>
            <motion.button className="btn btn-primary" disabled={!disclaimerChecked} onClick={() => goNext()} {...microBtn}>
              Vamos lá! 🎉
            </motion.button>
          </div>
        );

      case S.PROFILE:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Quem vai participar?</div>
            <div className={styles.profileOptions}>
              <motion.button
                className={styles.profileBtn}
                onClick={() => { setField("isForChild", false); goNext(false); }}
                {...microOption}
              >
                <span className={styles.profileIcon}>👤</span>
                <span className={styles.profileLabel}>Para mim</span>
                <span className={styles.profileDesc}>Adulto ou adolescente</span>
              </motion.button>
              <motion.button
                className={styles.profileBtn}
                onClick={() => { setField("isForChild", true); goNext(true); }}
                {...microOption}
              >
                <span className={styles.profileIcon}>👶</span>
                <span className={styles.profileLabel}>Para meu filho(a)</span>
                <span className={styles.profileDesc}>Inscrição infantil</span>
              </motion.button>
            </div>
          </div>
        );

      case S.PARENT_NAME:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Nome do responsável</div>
            <div className={styles.inputRow}>
              <input
                className="form-input"
                value={form.parentName ?? ""}
                onChange={(e) => setField("parentName", e.target.value)}
                placeholder="Nome completo do responsável"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && form.parentName?.trim()) goNext(); }}
              />
              <motion.button className="btn btn-primary" disabled={!form.parentName?.trim()} onClick={() => goNext()} {...microBtn}>
                →
              </motion.button>
            </div>
          </div>
        );

      case S.FULL_NAME:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>
              {form.isForChild ? "Nome completo da criança" : "Seu nome completo"}
            </div>
            <div className={styles.inputRow}>
              <input
                className="form-input"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Nome e sobrenome"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && form.fullName.trim()) goNext(); }}
              />
              <motion.button className="btn btn-primary" disabled={!form.fullName.trim()} onClick={() => goNext()} {...microBtn}>
                →
              </motion.button>
            </div>
          </div>
        );

      case S.BIRTH_DATE:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>
              {form.isForChild ? "Data de nascimento do seu filho(a)" : "Sua data de nascimento"}
            </div>
            <input
              type="date"
              className="form-input"
              value={form.birthDate}
              max={new Date().toISOString().split("T")[0]}
              autoFocus
              onChange={(e) => setField("birthDate", e.target.value)}
            />
            {age !== null && (
              <div className={styles.ageBadge}>
                🎂 Idade calculada: <strong>{age} anos</strong>
              </div>
            )}
            {age !== null && (
              <motion.button className="btn btn-primary" onClick={() => goNext()} {...microBtn}>
                Confirmar →
              </motion.button>
            )}
          </div>
        );

      case S.WHATSAPP:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>
              {form.isForChild ? "WhatsApp do responsável" : "Seu WhatsApp"}
            </div>
            <div className={styles.inputRow}>
              <input
                className="form-input"
                value={form.whatsapp}
                onChange={(e) => setField("whatsapp", e.target.value)}
                placeholder="(84) 99999-9999"
                type="tel"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && form.whatsapp.trim()) goNext(); }}
              />
              <motion.button className="btn btn-primary" disabled={!form.whatsapp.trim()} onClick={() => goNext()} {...microBtn}>
                →
              </motion.button>
            </div>
          </div>
        );

      case S.GENDER:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>
              {form.isForChild ? "Sexo do seu filho(a)" : "Seu sexo"}
            </div>
            <div className={styles.optionGroup}>
              {(["MASCULINO", "FEMININO"] as Gender[]).map((g) => (
                <motion.button
                  key={g}
                  className={styles.optionBtn}
                  onClick={() => { setField("gender", g); goNext(); }}
                  {...microOption}
                >
                  {g === "MASCULINO" ? "Masculino" : "Feminino"}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case S.MEMBER:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Vínculo com a IBB</div>
            <div className={styles.optionGroup}>
              {(
                [
                  { value: "SIM", label: "Sou membro da IBB" },
                  { value: "GR",  label: "Frequento um GR da IBB" },
                  { value: "NAO", label: "Não sou membro" },
                ] as { value: MembershipStatus; label: string }[]
              ).map(({ value, label }) => (
                <motion.button
                  key={value}
                  className={styles.optionBtn}
                  onClick={() => { setField("isMember", value); goNext(); }}
                  {...microOption}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case S.HEALTH:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>
              {form.isForChild ? "Problemas de saúde do seu filho(a)" : "Seus problemas de saúde"}
              <span className={styles.optional}>(opcional)</span>
            </div>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.healthIssues ?? ""}
              onChange={(e) => setField("healthIssues", e.target.value)}
              placeholder="Informe alergias, condições médicas ou contato de emergência"
              autoFocus
            />
            <div className={styles.inputRow} style={{ marginTop: "var(--space-3)" }}>
              <motion.button
                className="btn btn-secondary"
                onClick={() => { setField("healthIssues", "Não informado"); goNext(); }}
                {...microBtn}
              >
                Não tenho / Pular
              </motion.button>
              <motion.button className="btn btn-primary" onClick={() => goNext()} {...microBtn}>
                Continuar →
              </motion.button>
            </div>
          </div>
        );

      case S.PAYMENT_DISCLAIMER:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>{PAYMENT_DISCLAIMER_TITLES[paymentDisclaimerStep]}</div>

            {paymentDisclaimerStep === 0 && (
              <div className={styles.disclaimer}>
                <p>💰 O valor é simbólico e serve para custear despesas e necessidades básicas para a execução do evento.</p>
              </div>
            )}

            {paymentDisclaimerStep === 1 && (
              <div className={styles.disclaimer}>
                <p>👕 A camisa será vendida à parte e <strong>não está inclusa</strong> no valor acima! Sendo este, somente o valor da <strong>INSCRIÇÃO</strong>.</p>
              </div>
            )}

            {paymentDisclaimerStep === 2 && (
              <div className={styles.disclaimer}>
                <p>👤 O valor de <strong>R$ 15,09 é por pessoa, e não por modalidade</strong>. Isso significa que você paga somente uma vez e pode se inscrever em quantas modalidades quiser.</p>
              </div>
            )}

            {paymentDisclaimerStep === 3 && (
              <div className={styles.disclaimer}>
                <p>👶 Crianças até <strong>08 (oito) anos</strong> de idade não precisam pagar o valor acima para se inscrever, estão isentas, mas os pais precisam preencher este formulário e fazer a inscrição da mesma forma.</p>
              </div>
            )}

            {paymentDisclaimerStep === 4 && (
              <div className={styles.disclaimer}>
                <p>📋 Todos (crianças, adolescentes, jovens e adultos) a partir de <strong>09 anos</strong> de idade pagam o valor normal de <strong>R$ 15,09</strong>.</p>
              </div>
            )}

            {paymentDisclaimerStep === 5 && (
              <div className={styles.disclaimer}>
                <p>💳 O valor da inscrição deve ser pago para o seguinte pix (e-mail):</p>
                <p><strong>eventosibbnatal@gmail.com</strong></p>
                <p style={{ marginTop: "var(--space-3)", fontWeight: "600", color: "var(--color-gray-800)" }}>⚠️ ATENÇÃO!</p>
                <p>Favor enviar o comprovante do pix para <strong>Maria Fernanda (Nanda)</strong> para efetivar sua inscrição nas Olimpíadas IBB. O contato dela está disponível no nosso grupo dos <strong>INFORMATIVOS IBB</strong> no WhatsApp.</p>
                <p>Lembrando que o pix (transferência) em si deve ser feito para o e-mail descrito acima e <strong>não para o número de Nanda</strong>. Para ela você vai enviar somente o comprovante do pix já feito.</p>
              </div>
            )}

            {paymentDisclaimerStep === 6 && (
              <div className={styles.disclaimer}>
                <p>🏅 Nesse momento é importante para nós sabermos as modalidades que gostaria de participar, desde já nos programaremos para que seja um momento de grande lazer, alegria e comunhão.</p>
                <p>Não se preocupe, as modalidades que são jogadas em equipes serão formadas/divididas levando em consideração as idades e/ou "nível" do participante (iniciante, intermediário, avançado).</p>
              </div>
            )}

            {paymentDisclaimerStep === 7 && (
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
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
              />
              <span>{PAYMENT_DISCLAIMER_CHECKBOXES[paymentDisclaimerStep]}</span>
            </label>
            <motion.button
              className="btn btn-primary"
              disabled={!disclaimerChecked}
              onClick={goNextPaymentDisclaimer}
              {...microBtn}
            >
              {paymentDisclaimerStep === 7 ? "Escolher modalidades →" : "Entendido, continuar →"}
            </motion.button>
          </div>
        );

      case S.MODALITIES:
        return (
          <div
            className={styles.questionBlock}
            style={{
              boxShadow: themeColor !== "transparent" ? `0 0 40px ${themeColor}, inset 0 0 20px ${themeColor}` : undefined,
              transition: "box-shadow 0.4s ease",
            }}
          >
            <div className={styles.questionLabel}>Escolha as modalidades</div>
            {age !== null && (
              <div className={styles.participantSummary}>
                {form.fullName} · {age} anos ·{" "}
                {form.isMember === "SIM" ? "Membro IBB" : form.isMember === "GR" ? "Membro GR" : "Não membro"}
              </div>
            )}

            {loadingModalities && <p className={styles.hint}>Carregando modalidades...</p>}
            {modalitiesError && <div className="alert alert-error">{modalitiesError}</div>}

            {blockedModality && (
              <div className={styles.blockModal}>
                <div className={styles.blockModalContent}>
                  <p>⚠️ {blockedModality}</p>
                  <button className="btn btn-primary" onClick={() => setBlockedModality(null)}>Entendido</button>
                </div>
              </div>
            )}

            {eligibleMods.length > 0 && (
              <div className={styles.modalityGroup}>
                <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupEligible}`}>
                  ✓ Modalidades disponíveis para você
                </div>
                <div className={styles.modalitiesGrid}>
                  {eligibleMods.map((m) => (
                    <ModalityCard
                      key={m.id}
                      modality={m}
                      selected={form.modalityIds.includes(m.id)}
                      eligible={true}
                      onToggle={() => handleModalityToggle(m)}
                      onHover={setThemeColor}
                      ageRangeLabel={ageRangeLabel(m.minAge, m.maxAge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {ageRestrictedMods.length > 0 && (
              <div className={styles.modalityGroup}>
                <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupRestricted}`}>
                  🔒 Não permitidas pela sua idade
                </div>
                <div className={styles.modalitiesGrid}>
                  {ageRestrictedMods.map((m) => (
                    <ModalityCard
                      key={m.id}
                      modality={m}
                      selected={false}
                      eligible={false}
                      onToggle={() =>
                        setBlockedModality(
                          `A modalidade "${m.name}" exige ${ageRangeLabel(m.minAge, m.maxAge)}. Sua idade (${age} anos) não atende esse requisito.`
                        )
                      }
                      onHover={() => {}}
                      ageRangeLabel={ageRangeLabel(m.minAge, m.maxAge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {memberRestrictedMods.length > 0 && (
              <div className={styles.modalityGroup}>
                <div className={`${styles.modalityGroupLabel} ${styles.modalityGroupMember}`}>
                  🔒 Exclusivas para Membros IBB
                </div>
                <div className={styles.modalitiesGrid}>
                  {memberRestrictedMods.map((m) => (
                    <ModalityCard
                      key={m.id}
                      modality={m}
                      selected={false}
                      eligible={false}
                      onToggle={() =>
                        setBlockedModality(`A modalidade "${m.name}" é exclusiva para membros da IBB ou GR.`)
                      }
                      onHover={() => {}}
                      ageRangeLabel={ageRangeLabel(m.minAge, m.maxAge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {form.modalityIds.length > 0 ? (
              <motion.button
                className="btn btn-primary"
                style={{ marginTop: "var(--space-4)" }}
                onClick={() => goNext()}
                {...microBtn}
              >
                Confirmar {form.modalityIds.length} modalidade{form.modalityIds.length !== 1 ? "s" : ""} →
              </motion.button>
            ) : (
              <p className={styles.hint}>Selecione ao menos uma modalidade para continuar.</p>
            )}
          </div>
        );

      case S.TERMS:
        return (
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>Avisos importantes — leia com atenção</div>

            <div className={styles.disclaimer}>
              <h3>💰 Taxa de inscrição e pagamento via PIX</h3>
              <p>
                A taxa de inscrição é de <strong>R$ 15,09 por pessoa</strong> (crianças até 8 anos são isentas).
              </p>
              <p>
                O pagamento deve ser feito via <strong>PIX</strong> para o e-mail{" "}
                <strong>eventosibbnatal@gmail.com</strong> e, em seguida, você deve enviar{" "}
                <strong>somente o comprovante</strong> para o contato da Nanda.{" "}
                {form.isMember === "NAO" ? (
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
                onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 1))}
              />
              <span>Li e entendi tudo sobre o valor e o processo de pagamento.</span>
            </label>

            {termsStep >= 1 && (
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={termsStep >= 2}
                  onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 2))}
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
                  onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 3))}
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
                    onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 4))}
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
                  onClick={handleSubmit}
                  {...microBtn}
                >
                  {submitting ? "Enviando..." : "Confirmar inscrição 🎉"}
                </motion.button>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>🏅</div>
            <h1>Inscrição confirmada!</h1>
            <p className={styles.successTagline}>Já pode começar a alongar! 🤸‍♂️</p>
            <p>
              Olá, <strong>{registered.fullName}</strong>! Sua inscrição foi registrada com sucesso.
            </p>
            <div className={styles.modalitiesList}>
              <h3>Modalidades inscritas:</h3>
              {registered.subscriptions.map((s) => (
                <div key={s.id} className={styles.modalityTag}>
                  {s.modality.name}
                </div>
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
              <motion.button className="btn btn-primary" onClick={() => generateComprovantePdf(registered)} {...microBtn}>
                Baixar Comprovante PDF
              </motion.button>
              <motion.button
                className="btn btn-secondary"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setCurrentStep(S.DISCLAIMER_1);
                  setTermsStep(0);
                  setRegistered(null);
                }}
                {...microBtn}
              >
                Nova inscrição
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
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
