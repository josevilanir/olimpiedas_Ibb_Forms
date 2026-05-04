import { motion } from "framer-motion";

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
      <motion.div 
        className="hero-man"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      <div className="hero-texture"></div>
      <div className="hero-orb"></div>
      <div className="hero-diagonal"></div>

      <div className="hero-content">
        <motion.div 
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          Igreja Batista Bereana · Natal/RN
        </motion.div>

        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
        >
          OLIMPÍADAS<br />
          <span className="accent">IBB</span>
        </motion.h1>

        <motion.div 
          className="hero-bottom"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
        >
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
        </motion.div>
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

