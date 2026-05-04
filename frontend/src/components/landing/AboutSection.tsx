import galery1 from "../../assets/galery/20250531_154713.jpg";
import galery2 from "../../assets/galery/20250601_092812.jpg";
import galery3 from "../../assets/galery/DSC06671.jpeg";
import galery4 from "../../assets/galery/IMG_7160.jpg";
import galery5 from "../../assets/galery/IMG_7650.jpg";

const galleryImages = [galery1, galery2, galery3, galery4, galery5];

export function AboutSection() {
  return (
    <section id="sobre">
      <div className="sobre-grid">
        <div className="sobre-img-block reveal">
          <div className="sobre-img">
            <div className="sobre-gallery">
              {galleryImages.map((src, idx) => (
                <div key={idx} className="sobre-gallery-item">
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
          <p className="reveal reveal-delay-2">As Olimpíadas IBB reúnem membros e convidados da Igreja Batista Bereana em diversas modalidades esportivas e recreativas — de corridas a e-sports, passando por futebol, vôlei, natação e muito mais.</p>
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
