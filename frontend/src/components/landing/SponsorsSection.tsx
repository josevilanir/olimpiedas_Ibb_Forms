import { useEffect, useRef } from "react";
import logo1 from "../../assets/sponsors/1.png";
import logo2 from "../../assets/sponsors/2.png";
import logo3 from "../../assets/sponsors/3.png";
import logo4 from "../../assets/sponsors/4.png";
import logo5 from "../../assets/sponsors/5.png";
import logo6 from "../../assets/sponsors/6.png";
import logo7 from "../../assets/sponsors/7.png";
import logo8 from "../../assets/sponsors/8.png";
import logo9 from "../../assets/sponsors/9.png";
import logo10 from "../../assets/sponsors/10.png";
import logo11 from "../../assets/sponsors/11.png";
import logo12 from "../../assets/sponsors/12.png";
import logo13 from "../../assets/sponsors/13.png";
import logo14 from "../../assets/sponsors/14.png";

interface Sponsor {
  name: string;
  logo: string;
  url?: string;
}

const sponsorsList: Sponsor[] = [
  { name: "Patrocinador 1", logo: logo1 },
  { name: "Patrocinador 2", logo: logo2 },
  { name: "Patrocinador 3", logo: logo3 },
  { name: "Patrocinador 4", logo: logo4 },
  { name: "Patrocinador 5", logo: logo5 },
  { name: "Patrocinador 6", logo: logo6 },
  { name: "Patrocinador 7", logo: logo7 },
  { name: "Patrocinador 8", logo: logo8 },
  { name: "Patrocinador 9", logo: logo9 },
  { name: "Patrocinador 10", logo: logo10 },
  { name: "Patrocinador 11", logo: logo11 },
  { name: "Patrocinador 12", logo: logo12 },
  { name: "Patrocinador 13", logo: logo13 },
  { name: "Patrocinador 14", logo: logo14 },
];

export function SponsorsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="patrocinadores" className="sponsors-section">
      <div className="section-eyebrow reveal">Parceiros</div>
      <h2 className="section-title reveal reveal-delay-1">
        Nossos<br />Patrocinadores
      </h2>
      <p className="sponsors-subtitle reveal reveal-delay-2">
        Agradecemos imensamente às marcas e empresas que acreditam no esporte, na integração e na nossa comunidade.
      </p>

      <div className="sponsors-grid reveal reveal-delay-3">
        {sponsorsList.map((sponsor, index) => {
          const cardContent = (
            <img
              src={sponsor.logo}
              alt={`Logo ${sponsor.name}`}
              loading="lazy"
              decoding="async"
              className="sponsor-logo"
            />
          );

          if (sponsor.url) {
            return (
              <a
                key={index}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`sponsor-card sponsor-card-${index + 1}`}
                title={`Visitar site de ${sponsor.name}`}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <div key={index} className={`sponsor-card sponsor-card-${index + 1}`} title={sponsor.name}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
