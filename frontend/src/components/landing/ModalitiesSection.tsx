import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const modalities = [
  { name: "Corrida Longa 5km",        cat: "corrida",   age: "Livre",      icon: "🏃", tag: "open",   coord: "Emicarlo Souza e Carlos Mora", desc: "Percurso de 5km para testar sua resistência." },
  { name: "Caminhada 2,5km",          cat: "corrida",   age: "Livre",      icon: "🚶", tag: "open",   coord: "Emicarlo Souza e Carlos Mora", desc: "Caminhada leve ideal para todas as idades." },
  { name: "Corrida Curta Adulta",     cat: "corrida",   age: "14+ anos",   icon: "⚡", tag: "member", sub: "100m · 200m", coord: "Emicarlo Souza e Carlos Mora", desc: "Velocidade máxima nas pistas curtas." },
  { name: "Corrida Curta Pré-Teens",  cat: "corrida",   age: "09–13 anos", icon: "⚡", tag: "member", sub: "100m · 200m", coord: "Emicarlo Souza e Carlos Mora", desc: "Velocidade explosiva para a garotada." },
  { name: "Corrida Curta Kids",       cat: "corrida",   age: "03–08 anos", icon: "⚡", tag: "member", sub: "10m · 20m · 30m", coord: "Emicarlo Souza e Carlos Mora", desc: "Os primeiros passos no atletismo infantil." },
  { name: "Futsal",                   cat: "coletivo",  age: "14+ anos",   icon: "⚽", tag: "member", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "O clássico e emocionante futebol de salão." },
  { name: "Futsal Pré-Teens",         cat: "coletivo",  age: "10–13 anos", icon: "⚽", tag: "member", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Torneio de futsal para as novas gerações." },
  { name: "Vôlei de Quadra",          cat: "coletivo",  age: "14+ anos",   icon: "🏐", tag: "member", coord: "Daniel César", desc: "Saques, cortes e muita emoção na quadra." },
  { name: "Queimada",                 cat: "coletivo",  age: "11+ anos",   icon: "🔥", tag: "member", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Esquiva, agilidade e trabalho em equipe." },
  { name: "Basquete",                 cat: "coletivo",  age: "14+ anos",   icon: "🏀", tag: "member", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Dribles e cestas no esporte das quadras." },
  { name: "Natação",                  cat: "individual",age: "9+ anos",    icon: "🏊", tag: "member", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Competição na água para os melhores nadadores." },
  { name: "Tênis de Mesa",            cat: "individual",age: "9+ anos",    icon: "🏓", tag: "member", coord: "Lucas Santos", desc: "Reflexos rápidos e precisão na mesa." },
  { name: "Circuito Adulto",          cat: "corrida",   age: "14+ anos",   icon: "🏋️", tag: "member", sub: "Obstáculos", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Supere seus limites no circuito de obstáculos." },
  { name: "Circuito Kids",            cat: "corrida",   age: "09–13 anos", icon: "🏋️", tag: "member", sub: "Obstáculos", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Diversão e desafio adaptado para as crianças." },
  { name: "E-Sports FIFA",            cat: "esports",   age: "9+ anos",    icon: "🎮", tag: "member", coord: "Gustavo Felipe", desc: "Mostre suas habilidades nos gramados virtuais." },
  { name: "E-Sports CS",              cat: "esports",   age: "9+ anos",    icon: "🎮", tag: "member", sub: "Counter-Strike", coord: "Gustavo Felipe", desc: "Mira afiada e muita tática." },
  { name: "E-Sports LoL",             cat: "esports",   age: "9+ anos",    icon: "🎮", tag: "member", sub: "League of Legends", coord: "Gustavo Felipe", desc: "Destrua o Nexus e domine Summoner's Rift." },
  { name: "Treino Funcional",         cat: "individual",age: "Livre",      icon: "💪", tag: "member", sub: "Não competitivo", coord: "Jonatas Silveira (Jow) e Fran Missionário", desc: "Movimento e bem-estar para todas as idades." },
];

const catLabels: Record<string, string> = {
  corrida: "Corrida", coletivo: "Coletivo", esports: "E-Sports", individual: "Individual",
};

interface Modality {
  name: string;
  cat: string;
  age: string;
  icon: string;
  tag: string;
  sub?: string;
  coord: string;
  desc?: string;
}

function ModalityCard({ m }: { m: Modality }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={`mod-card-container mod-cat-${m.cat}`} onClick={() => setIsFlipped(f => !f)}>
      <div className={`mod-card-inner${isFlipped ? " flipped" : ""}`}>
        {/* Front */}
        <div className="mod-card mod-card-front">
          <div className="mod-card-lines"></div>
          <div className="mod-icon">{m.icon}</div>
          <div className="mod-cat">{catLabels[m.cat] || m.cat}</div>
          <div className="mod-name">{m.name}</div>
          {m.desc && <div className="mod-desc">{m.desc}</div>}
          <span className={`mod-tag ${m.tag}`}>{m.tag === "open" ? "Aberto" : "Membros IBB"}</span>
          <div className="mod-flip-hint">Regras & Coordenação ↻</div>
        </div>
        {/* Back */}
        <div className="mod-card mod-card-back">
          <div className="mod-icon mod-icon-back">{m.icon}</div>
          <div className="mod-back-title">{m.name}</div>
          <div className="mod-back-section">
            <span className="mod-back-label">Coordenador</span>
            <span className="mod-back-value">{m.coord}</span>
          </div>
          <div className="mod-back-section">
            <span className="mod-back-label">Público</span>
            <span className="mod-back-value">{m.age}</span>
          </div>
          {m.sub && (
            <div className="mod-back-section">
              <span className="mod-back-label">Especificações</span>
              <span className="mod-back-value">{m.sub}</span>
            </div>
          )}
          <span className={`mod-tag ${m.tag}`}>{m.tag === "open" ? "Aberto" : "Membros IBB"}</span>
          <div className="mod-flip-hint return">Voltar ↻</div>
        </div>
      </div>
    </div>
  );
}

interface ModalitiesSectionProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ModalitiesSection({ activeFilter, onFilterChange }: ModalitiesSectionProps) {
  const filtered = activeFilter === "all" ? modalities : modalities.filter(m => m.cat === activeFilter);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section id="modalidades">
      <div className="mod-header">
        <div>
          <div className="section-eyebrow reveal">Modalidades</div>
          <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 0 }}>O que você<br />vai disputar</h2>
        </div>
        <div className="mod-header-right">
          <div className="mod-filter reveal reveal-delay-2">
            {["all", "corrida", "coletivo", "esports", "individual"].map(f => (
              <button
                key={f}
                className={`mod-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => onFilterChange(f)}
              >
                {f === "all" ? "Todas" : f === "coletivo" ? "Coletivos" : f === "individual" ? "Individual" : f === "esports" ? "E-Sports" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="slider-nav-btns">
            <button className="slider-nav-btn" onClick={() => scroll("left")} aria-label="Anterior">
              <ChevronLeft size={20} />
            </button>
            <button className="slider-nav-btn" onClick={() => scroll("right")} aria-label="Próximo">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mod-grid" ref={scrollRef}>
        {filtered.map((m, i) => (
          <ModalityCard key={i} m={m} />
        ))}
      </div>
    </section>
  );
}

export { modalities };
