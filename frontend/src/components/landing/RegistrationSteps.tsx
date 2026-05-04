interface RegistrationStepsProps {
  onGoToRegistration: () => void;
}

export function RegistrationSteps({ onGoToRegistration }: RegistrationStepsProps) {
  return (
    <section id="inscricao">
      <div className="section-eyebrow reveal">Como participar</div>
      <h2 className="section-title reveal reveal-delay-1">Simples assim</h2>

      <div className="steps-grid">
        <div className="step-card reveal reveal-delay-1">
          <div className="step-n">1</div>
          <div className="step-title">Preencha o formulário</div>
          <div className="step-desc">Dados pessoais e data de nascimento — a elegibilidade é calculada automaticamente.</div>
          <div className="step-bar"></div>
        </div>
        <div className="step-card reveal reveal-delay-2">
          <div className="step-n">2</div>
          <div className="step-title">Escolha modalidades</div>
          <div className="step-desc">As modalidades disponíveis para você são exibidas com base na sua idade e vínculo com a IBB.</div>
          <div className="step-bar"></div>
        </div>
        <div className="step-card reveal reveal-delay-3">
          <div className="step-n">3</div>
          <div className="step-title">Pague via PIX</div>
          <div className="step-desc">R$ 15,09 por pessoa. Crianças de até 8 anos não pagam.<br />Enviar comprovante para Maria Fernanda (Nanda) para efetivar sua inscrição.</div>
          <div className="step-bar"></div>
        </div>
        <div className="step-card reveal reveal-delay-4">
          <div className="step-n">4</div>
          <div className="step-title">Receba o comprovante</div>
          <div className="step-desc">Comprovante de inscrição em PDF gerado automaticamente no seu navegador.</div>
          <div className="step-bar"></div>
        </div>
      </div>

      <div className="pix-box reveal">
        <div>
          <div className="pix-label">PIX</div>
          <div className="pix-sub">Pagamento via chave de e-mail</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="pix-key">eventosibbnatal<span>@gmail.com</span></div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "4px", fontFamily: "var(--font-display)", letterSpacing: "1px" }}>R$ 15,09 · isento até 8 anos</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>Enviar comprovante para Maria Fernanda (Nanda) para efetivar sua inscrição.</div>
        </div>
        <button className="btn-primary" style={{ flexShrink: 0 }} onClick={onGoToRegistration}>Ir para o formulário →</button>
      </div>
    </section>
  );
}
