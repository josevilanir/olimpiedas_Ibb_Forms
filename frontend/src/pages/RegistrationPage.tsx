import { useState, useEffect, useRef, useMemo } from "react";
import type { RegistrationFormData, Participant, MembershipStatus, Gender, Modality } from "../types";
import { useModalities } from "../hooks/useModalities";
import { calculateAge } from "../hooks/useAge";
import { api } from "../services/api";
import { generateComprovantePdf } from "../utils/generatePdf";
import styles from "./RegistrationPage.module.css";

// ─── Step indices ─────────────────────────────────────────────────────────────
const S = {
  PROFILE: 0,
  PARENT_NAME: 1,  // only when isForChild
  FULL_NAME: 2,
  BIRTH_DATE: 3,
  WHATSAPP: 4,
  GENDER: 5,
  MEMBER: 6,
  HEALTH: 7,
  MODALITIES: 8,
  TERMS: 9,
} as const;

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

// ─── QuestionBlock ─────────────────────────────────────────────────────────────
function QuestionBlock({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && ref.current) {
      const t = setTimeout(
        () => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        150
      );
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <div ref={ref} className={styles.questionBlock}>
      {children}
    </div>
  );
}

// ─── ModalityCard ──────────────────────────────────────────────────────────────
function ModalityCard({
  modality,
  selected,
  eligible,
  onToggle,
  ageRangeLabel,
}: {
  modality: Modality;
  selected: boolean;
  eligible: boolean;
  onToggle: () => void;
  ageRangeLabel: string;
}) {
  return (
    <button
      className={`${styles.modalityCard} ${selected ? styles.modalitySelected : ""} ${!eligible ? styles.modalityLocked : ""}`}
      onClick={onToggle}
      disabled={!eligible}
    >
      <span className={styles.modalityName}>{modality.name}</span>
      <span className={styles.modalityCoord}>Coord: {modality.coordinatorName}</span>
      <span className={styles.modalityAge}>{ageRangeLabel}</span>
      {modality.requiresMembership && (
        <span className={styles.modalityMember}>Membros IBB/GR</span>
      )}
      {selected && <span className={styles.modalityCheck}>✓</span>}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function RegistrationPage() {
  const [visibleStep, setVisibleStep] = useState<number>(S.PROFILE);
  const [form, setForm] = useState<RegistrationFormData>(INITIAL_FORM);
  const [blockedModality, setBlockedModality] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Participant | null>(null);

  // Terms progressive state
  const [termsStep, setTermsStep] = useState<number>(0);
  // 0 = show fee info only
  // 1 = fee "li e entendi" checked → show PIX email checkbox
  // 2 = PIX email checked → show Nanda checkbox
  // 3 = Nanda checked → show shirt info
  // 4 = shirt "li e entendi" checked → show submit

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
      const ageOk =
        (m.minAge === null || age >= m.minAge) &&
        (m.maxAge === null || age <= m.maxAge);
      const memberOk = !m.requiresMembership || isMember;

      if (ageOk && memberOk) eligibleMods.push(m);
      else if (!ageOk) ageRestrictedMods.push(m);
      else memberRestrictedMods.push(m);
    }
    return { eligibleMods, ageRestrictedMods, memberRestrictedMods };
  }, [modalities, age, isMember]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setField<K extends keyof RegistrationFormData>(key: K, value: RegistrationFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reveal(step: number) {
    setVisibleStep(step);
  }

  function revealNext(fromStep: number) {
    let next = fromStep + 1;
    // skip parentName if not for child
    if (next === S.PARENT_NAME && !form.isForChild) next = S.FULL_NAME;
    reveal(next);
  }

  function isVisible(step: number): boolean {
    if (step > visibleStep) return false;
    if (step === S.PARENT_NAME && !form.isForChild) return false;
    return true;
  }

  function ageRangeLabel(minAge: number | null, maxAge: number | null) {
    if (minAge === null && maxAge === null) return "Livre";
    if (minAge !== null && maxAge !== null) return `${minAge}–${maxAge} anos`;
    if (minAge !== null) return `${minAge}+ anos`;
    return `até ${maxAge} anos`;
  }

  function handleModalityToggle(modality: Modality) {
    if (form.modalityIds.includes(modality.id)) {
      setField("modalityIds", form.modalityIds.filter((id) => id !== modality.id));
      return;
    }
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

  // ── Success screen ─────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h1>Inscrição confirmada!</h1>
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
              <p>
                Taxa de inscrição: <strong>R$ 15,09 por pessoa</strong> (isento até 8 anos).
              </p>
              <p>
                Faça o PIX para <strong>eventosibbnatal@gmail.com</strong> e envie o comprovante para
                o contato da Nanda.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => generateComprovantePdf(registered)}>
                Baixar Comprovante PDF
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setVisibleStep(S.PROFILE);
                  setTermsStep(0);
                  setRegistered(null);
                }}
              >
                Nova inscrição
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Olimpíadas IBB</h1>
          <p className={styles.subtitle}>Formulário de inscrição</p>
        </header>

        {/* ── STEP 0: Profile ── */}
        <QuestionBlock visible={isVisible(S.PROFILE)}>
          <div className={styles.questionLabel}>Quem vai participar?</div>
          <div className={styles.profileOptions}>
            <button
              className={`${styles.profileBtn} ${!form.isForChild && visibleStep > S.PROFILE ? styles.profileBtnActive : ""}`}
              onClick={() => {
                setField("isForChild", false);
                revealNext(S.PROFILE);
              }}
            >
              <span className={styles.profileIcon}>👤</span>
              <span className={styles.profileLabel}>Para mim</span>
              <span className={styles.profileDesc}>Adulto ou adolescente</span>
            </button>
            <button
              className={`${styles.profileBtn} ${form.isForChild && visibleStep > S.PROFILE ? styles.profileBtnActive : ""}`}
              onClick={() => {
                setField("isForChild", true);
                revealNext(S.PROFILE);
              }}
            >
              <span className={styles.profileIcon}>👶</span>
              <span className={styles.profileLabel}>Para meu filho(a)</span>
              <span className={styles.profileDesc}>Inscrição infantil</span>
            </button>
          </div>
        </QuestionBlock>

        {/* ── STEP 1: Parent name (only for child) ── */}
        <QuestionBlock visible={isVisible(S.PARENT_NAME)}>
          <div className={styles.questionLabel}>Nome do responsável</div>
          <div className={styles.inputRow}>
            <input
              className="form-input"
              value={form.parentName ?? ""}
              onChange={(e) => setField("parentName", e.target.value)}
              placeholder="Nome completo do responsável"
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.parentName?.trim()) revealNext(S.PARENT_NAME);
              }}
            />
            <button
              className="btn btn-primary"
              disabled={!form.parentName?.trim()}
              onClick={() => revealNext(S.PARENT_NAME)}
            >
              →
            </button>
          </div>
        </QuestionBlock>

        {/* ── STEP 2: Full name ── */}
        <QuestionBlock visible={isVisible(S.FULL_NAME)}>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.fullName.trim()) revealNext(S.FULL_NAME);
              }}
            />
            <button
              className="btn btn-primary"
              disabled={!form.fullName.trim()}
              onClick={() => revealNext(S.FULL_NAME)}
            >
              →
            </button>
          </div>
        </QuestionBlock>

        {/* ── STEP 3: Birth date + age display ── */}
        <QuestionBlock visible={isVisible(S.BIRTH_DATE)}>
          <div className={styles.questionLabel}>Data de nascimento</div>
          <input
            type="date"
            className="form-input"
            value={form.birthDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setField("birthDate", e.target.value)}
          />
          {age !== null && (
            <div className={styles.ageBadge}>
              🎂 Idade calculada: <strong>{age} anos</strong>
            </div>
          )}
          {age !== null && visibleStep === S.BIRTH_DATE && (
            <button className="btn btn-primary" onClick={() => revealNext(S.BIRTH_DATE)}>
              Confirmar
            </button>
          )}
        </QuestionBlock>

        {/* ── STEP 4: WhatsApp ── */}
        <QuestionBlock visible={isVisible(S.WHATSAPP)}>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.whatsapp.trim()) revealNext(S.WHATSAPP);
              }}
            />
            <button
              className="btn btn-primary"
              disabled={!form.whatsapp.trim()}
              onClick={() => revealNext(S.WHATSAPP)}
            >
              →
            </button>
          </div>
        </QuestionBlock>

        {/* ── STEP 5: Gender ── */}
        <QuestionBlock visible={isVisible(S.GENDER)}>
          <div className={styles.questionLabel}>Sexo</div>
          <div className={styles.optionGroup}>
            {(["MASCULINO", "FEMININO"] as Gender[]).map((g) => (
              <button
                key={g}
                className={`${styles.optionBtn} ${form.gender === g ? styles.optionBtnActive : ""}`}
                onClick={() => {
                  setField("gender", g);
                  revealNext(S.GENDER);
                }}
              >
                {g === "MASCULINO" ? "Masculino" : "Feminino"}
              </button>
            ))}
          </div>
        </QuestionBlock>

        {/* ── STEP 6: IBB membership ── */}
        <QuestionBlock visible={isVisible(S.MEMBER)}>
          <div className={styles.questionLabel}>Vínculo com a IBB</div>
          <div className={styles.optionGroup}>
            {(
              [
                { value: "SIM", label: "Sou membro da IBB" },
                { value: "GR", label: "Sou membro de GR" },
                { value: "NAO", label: "Não sou membro" },
              ] as { value: MembershipStatus; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                className={`${styles.optionBtn} ${form.isMember === value && visibleStep > S.MEMBER ? styles.optionBtnActive : ""}`}
                onClick={() => {
                  setField("isMember", value);
                  revealNext(S.MEMBER);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </QuestionBlock>

        {/* ── STEP 7: Health issues ── */}
        <QuestionBlock visible={isVisible(S.HEALTH)}>
          <div className={styles.questionLabel}>
            Problemas de saúde / Contato de emergência
            <span className={styles.optional}>(opcional)</span>
          </div>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.healthIssues ?? ""}
            onChange={(e) => setField("healthIssues", e.target.value)}
            placeholder="Informe alergias, condições médicas ou contato de emergência"
          />
          <div className={styles.inputRow} style={{ marginTop: "var(--space-3)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setField("healthIssues", "Não informado");
                revealNext(S.HEALTH);
              }}
            >
              Não tenho / Pular
            </button>
            <button className="btn btn-primary" onClick={() => revealNext(S.HEALTH)}>
              Continuar →
            </button>
          </div>
        </QuestionBlock>

        {/* ── STEP 8: Modalities ── */}
        <QuestionBlock visible={isVisible(S.MODALITIES)}>
          <div className={styles.questionLabel}>Escolha as modalidades</div>
          {age !== null && (
            <div className={styles.participantSummary}>
              {form.fullName} · {age} anos ·{" "}
              {form.isMember === "SIM"
                ? "Membro IBB"
                : form.isMember === "GR"
                  ? "Membro GR"
                  : "Não membro"}
            </div>
          )}

          {loadingModalities && <p className={styles.hint}>Carregando modalidades...</p>}
          {modalitiesError && <div className="alert alert-error">{modalitiesError}</div>}

          {blockedModality && (
            <div className={styles.blockModal}>
              <div className={styles.blockModalContent}>
                <p>⚠️ {blockedModality}</p>
                <button className="btn btn-primary" onClick={() => setBlockedModality(null)}>
                  Entendido
                </button>
              </div>
            </div>
          )}

          {/* Eligible */}
          {eligibleMods.length > 0 && (
            <div className={styles.modalityGroup}>
              <div className={styles.modalityGroupLabel + " " + styles.modalityGroupEligible}>
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
                    ageRangeLabel={ageRangeLabel(m.minAge, m.maxAge)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Age restricted */}
          {ageRestrictedMods.length > 0 && (
            <div className={styles.modalityGroup}>
              <div className={styles.modalityGroupLabel + " " + styles.modalityGroupRestricted}>
                🔒 Modalidades não permitidas pela idade
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
                    ageRangeLabel={ageRangeLabel(m.minAge, m.maxAge)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Membership restricted */}
          {memberRestrictedMods.length > 0 && (
            <div className={styles.modalityGroup}>
              <div className={styles.modalityGroupLabel + " " + styles.modalityGroupMember}>
                🔒 Modalidades permitidas somente para Membros IBB
              </div>
              <div className={styles.modalitiesGrid}>
                {memberRestrictedMods.map((m) => (
                  <ModalityCard
                    key={m.id}
                    modality={m}
                    selected={false}
                    eligible={false}
                    onToggle={() =>
                      setBlockedModality(
                        `A modalidade "${m.name}" é exclusiva para membros da IBB ou GR.`
                      )
                    }
                    ageRangeLabel={ageRangeLabel(m.minAge, m.maxAge)}
                  />
                ))}
              </div>
            </div>
          )}

          {form.modalityIds.length > 0 && (
            <button
              className="btn btn-primary"
              style={{ marginTop: "var(--space-4)" }}
              onClick={() => revealNext(S.MODALITIES)}
            >
              Confirmar {form.modalityIds.length} modalidade{form.modalityIds.length !== 1 ? "s" : ""} →
            </button>
          )}
          {form.modalityIds.length === 0 && (
            <p className={styles.hint}>Selecione ao menos uma modalidade para continuar.</p>
          )}
        </QuestionBlock>

        {/* ── STEP 9: Terms (progressive checkboxes) ── */}
        <QuestionBlock visible={isVisible(S.TERMS)}>
          <div className={styles.questionLabel}>Avisos importantes — leia com atenção</div>

          {/* Bloco 1: Taxa + PIX */}
          <div className={styles.disclaimer}>
            <h3>💰 Taxa de inscrição e pagamento via PIX</h3>
            <p>
              A taxa de inscrição é de <strong>R$ 15,09 por pessoa</strong> (crianças até 8 anos são
              isentas).
            </p>
            <p>
              O pagamento deve ser feito via <strong>PIX</strong> para o e-mail{" "}
              <strong>eventosibbnatal@gmail.com</strong> e, em seguida, você deve enviar{" "}
              <strong>somente o comprovante</strong> para o contato da Nanda.{" "}
              {form.isMember === "NAO" ? (
                <>
                  O contato dela é: <strong>(84) 99647-9320</strong>.
                </>
              ) : (
                <>
                  O contato dela está disponível no nosso grupo dos{" "}
                  <strong>INFORMATIVOS IBB</strong> no WhatsApp.
                </>
              )}
            </p>
          </div>

          {/* Checkbox 1: Li e entendi */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={termsStep >= 1}
              onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 1))}
            />
            <span>Li e entendi tudo sobre o valor e o processo de pagamento.</span>
          </label>

          {/* Checkbox 2: PIX email (aparece depois do 1) */}
          {termsStep >= 1 && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={termsStep >= 2}
                onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 2))}
              />
              <span>
                Entendi que o PIX deve ser feito para o e-mail{" "}
                <strong>eventosibbnatal@gmail.com</strong>.
              </span>
            </label>
          )}

          {/* Checkbox 3: Nanda só comprovante (aparece depois do 2) */}
          {termsStep >= 2 && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={termsStep >= 3}
                onChange={(e) => e.target.checked && setTermsStep(Math.max(termsStep, 3))}
              />
              <span>
                Entendi que vou enviar somente o <strong>COMPROVANTE</strong> para o contato da Nanda
                e não vou fazer a transferência para a conta bancária dela.
              </span>
            </label>
          )}

          {/* Bloco 2: Camiseta (aparece depois do 3) */}
          {termsStep >= 3 && (
            <>
              <div className={styles.disclaimer} style={{ marginTop: "var(--space-4)" }}>
                <h3>👕 Camiseta não inclusa</h3>
                <p>
                  A camiseta oficial do evento <strong>não está inclusa</strong> na taxa de
                  inscrição e deverá ser adquirida separadamente, caso seja do seu interesse.
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

          {/* Submit (aparece depois do 4) */}
          {termsStep >= 4 && (
            <>
              {submitError && (
                <div className="alert alert-error" style={{ marginTop: "var(--space-3)" }}>
                  {submitError}
                </div>
              )}
              <button
                className="btn btn-primary"
                style={{ marginTop: "var(--space-4)", width: "100%" }}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Enviando..." : "Confirmar inscrição"}
              </button>
            </>
          )}
        </QuestionBlock>
      </div>
    </div>
  );
}
