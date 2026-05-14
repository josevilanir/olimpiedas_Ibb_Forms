import { useState, useEffect } from "react";
import galery1 from "../../assets/galery/Natacao.jpeg";
import galery2 from "../../assets/galery/volei.jpeg";
import galery3 from "../../assets/galery/queimada.jpeg";
import galery4 from "../../assets/galery/Corrida.jpg";
import galery5 from "../../assets/galery/kids.png";

const galleryImages = [galery1, galery2, galery3, galery4, galery5];

export function AboutSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(true);

  useEffect(() => {
    if (!autoCycleEnabled || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [autoCycleEnabled, isPaused]);

  return (
    <section id="sobre">
      <div className="sobre-grid">
        <div className="sobre-img-block reveal">
          <div className="sobre-img">
            <div 
              className={`sobre-gallery ${autoCycleEnabled ? "is-cycling" : ""}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={() => setAutoCycleEnabled(false)}
            >
              {galleryImages.map((src, idx) => (
                <div 
                  key={idx} 
                  className={`sobre-gallery-item ${autoCycleEnabled && activeIndex === idx && !isPaused ? "active" : ""}`}
                >
                  <img src={src} alt={`galeria-${idx}`} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>
          <div className="sobre-badge">
            <span className="big">18</span>
            <span className="small">Modal-<br />idades</span>
          </div>
        </div>
        <div className="sobre-text">
          <div className="section-eyebrow reveal">Sobre o Evento</div>
          <h2 className="section-title reveal reveal-delay-1">Esporte,<br />fé &amp;<br />comunidade</h2>
          <p className="reveal reveal-delay-2">As Olimpíadas IBB reúnem membros e convidados da Igreja Batista Bereana em diversas modalidades esportivas e recreativas — de corridas a E-Sports, passando por futebol, vôlei, natação e muito mais.</p>
          <p className="reveal reveal-delay-3">Um evento para todas as idades. Desde os pequenos de 3 anos nas provas Kids até os adultos no circuito de obstáculos — há uma modalidade para cada membro da família IBB.</p>
          <p className="reveal reveal-delay-3">Incentivando a realização de atividades físicas em ambientes seguros e saudáveis através da comunhão entre os irmãos.</p>
          <div className="sobre-stats reveal reveal-delay-4">
            <div className="stat"><div className="n">18</div><div className="l">Modalidades</div></div>
            <div className="stat"><div className="n">3+</div><div className="l">Anos de idade</div></div>
            <div className="stat"><div className="n">R$15,09</div><div className="l">Inscrição</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
