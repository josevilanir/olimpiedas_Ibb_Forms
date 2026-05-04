interface HeroSectionProps {
  countdown: { d: string; h: string; m: string; s: string };
  tickerItems: string[];
  onGoToRegistration: () => void;
}

export function HeroSection({ countdown, tickerItems, onGoToRegistration }: HeroSectionProps) {
  const trackItems = [...tickerItems, ...tickerItems];

  return (
    <section id="hero">
      <div className="hero-bg"></div>
      <div className="hero-man"></div>
      <div className="hero-texture"></div>
      <div className="hero-orb"></div>
      <div className="hero-diagonal"></div>

      <div className="hero-content">
        <div className="hero-eyebrow">Igreja Batista Bereana · Natal/RN</div>

        <h1 className="hero-title">
          OLIMPÍADAS<br />
          <span className="accent">IBB</span>
        </h1>

        <div className="hero-bottom">
          <div>
            <p className="hero-sub">
              <strong>18 modalidades.</strong> Corridas, esportes coletivos, e-sports e muito mais — para toda a família da IBB.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px" }}>
            <div className="countdown">
              <div className="cd-unit"><div className="cd-num">{countdown.d}</div><div className="cd-label">Dias</div></div>
              <div className="cd-sep">:</div>
              <div className="cd-unit"><div className="cd-num">{countdown.h}</div><div className="cd-label">Horas</div></div>
              <div className="cd-sep">:</div>
              <div className="cd-unit"><div className="cd-num">{countdown.m}</div><div className="cd-label">Min</div></div>
              <div className="cd-sep">:</div>
              <div className="cd-unit"><div className="cd-num">{countdown.s}</div><div className="cd-label">Seg</div></div>
            </div>
            <div className="hero-cta-group">
              <button className="btn-primary" onClick={onGoToRegistration}>Quero participar →</button>
              <button className="btn-ghost" onClick={() => document.getElementById("modalidades")?.scrollIntoView({ behavior: "smooth" })}>Ver modalidades</button>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hint" onClick={() => document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" })}>
        <span className="scroll-chevron">❯</span>
        <span className="scroll-chevron">❯</span>
      </div>

      <div className="ticker hero-ticker">
        <div className="ticker-track">
          {trackItems.map((item, i) => (
            <span key={i} className="ticker-item">{item}<span className="sep">✦</span></span>
          ))}
        </div>
      </div>
    </section>
  );
}
