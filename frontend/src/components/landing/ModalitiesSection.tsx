const modalities = [
  { name: "Corrida Longa 5km",        cat: "corrida",   age: "Livre",      icon: "🏃", tag: "open",   coord: "Emicarlo Souza e Carlos Mora" },
  { name: "Caminhada 2,5km",          cat: "livre",     age: "Livre",      icon: "🚶", tag: "open",   coord: "Emicarlo Souza e Carlos Mora" },
  { name: "Corrida Curta Adulta",     cat: "corrida",   age: "14+ anos",   icon: "⚡", tag: "open",   sub: "100m · 150m · 200m", coord: "Emicarlo Souza e Carlos Mora" },
  { name: "Corrida Curta Pré-Teens",  cat: "corrida",   age: "09–13 anos", icon: "⚡", tag: "open",   sub: "100m · 150m", coord: "Emicarlo Souza e Carlos Mora" },
  { name: "Corrida Curta Kids",       cat: "kids",      age: "03–08 anos", icon: "⚡", tag: "open",   sub: "10m · 20m · 30m", coord: "Emicarlo Souza e Carlos Mora" },
  { name: "Futsal",                   cat: "coletivo",  age: "14+ anos",   icon: "⚽", tag: "member", coord: "Jonatas Silveira (Jow)" },
  { name: "Futsal Pré-Teens",         cat: "coletivo",  age: "10–13 anos", icon: "⚽", tag: "member", coord: "Jonatas Silveira (Jow)" },
  { name: "Vôlei de Quadra",          cat: "coletivo",  age: "14+ anos",   icon: "🏐", tag: "member", coord: "Daniel César" },
  { name: "Queimada",                 cat: "coletivo",  age: "11+ anos",   icon: "🔥", tag: "member", coord: "Jonatas Silveira (Jow)" },
  { name: "Basquete",                 cat: "coletivo",  age: "14+ anos",   icon: "🏀", tag: "member", coord: "Jonatas Silveira (Jow)" },
  { name: "Natação",                  cat: "livre",     age: "9+ anos",    icon: "🏊", tag: "member", coord: "Jonatas Silveira (Jow)" },
  { name: "Tênis de Mesa",            cat: "livre",     age: "9+ anos",    icon: "🏓", tag: "member", coord: "Lucas Santos" },
  { name: "Circuito Adulto",          cat: "corrida",   age: "14+ anos",   icon: "🏋️", tag: "member", sub: "Obstáculos", coord: "Fran Missionário" },
  { name: "Circuito Kids",            cat: "kids",      age: "09–13 anos", icon: "🏋️", tag: "member", sub: "Obstáculos", coord: "Fran Missionário" },
  { name: "E-Sports FIFA",            cat: "esports",   age: "9+ anos",    icon: "🎮", tag: "member", coord: "Gustavo Felipe e Davi Severiano" },
  { name: "E-Sports CS",              cat: "esports",   age: "9+ anos",    icon: "🎮", tag: "member", sub: "Counter-Strike", coord: "Gustavo Felipe e Davi Severiano" },
  { name: "E-Sports LoL",             cat: "esports",   age: "9+ anos",    icon: "🎮", tag: "member", sub: "League of Legends", coord: "Gustavo Felipe e Davi Severiano" },
  { name: "Treino Funcional",         cat: "livre",     age: "Livre",      icon: "💪", tag: "member", sub: "Não competitivo", coord: "Jonatas Silveira (Jow)" },
];

const catLabels: Record<string, string> = {
  corrida: "Corrida", coletivo: "Coletivo", esports: "E-Sports", kids: "Kids", livre: "Livre",
};

interface ModalitiesSectionProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ModalitiesSection({ activeFilter, onFilterChange }: ModalitiesSectionProps) {
  const filtered = activeFilter === "all" ? modalities : modalities.filter(m => m.cat === activeFilter);

  return (
    <section id="modalidades">
      <div className="mod-header">
        <div>
          <div className="section-eyebrow reveal">Modalidades</div>
          <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 0 }}>O que você<br />vai disputar</h2>
        </div>
        <div className="mod-filter reveal reveal-delay-2">
          {["all", "corrida", "coletivo", "esports", "kids", "livre"].map(f => (
            <button
              key={f}
              className={`mod-btn ${activeFilter === f ? "active" : ""}`}
              onClick={() => onFilterChange(f)}
            >
              {f === "all" ? "Todas" : f === "coletivo" ? "Coletivos" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mod-grid">
        {filtered.map((m, i) => (
          <div key={i} className="mod-card">
            <div className="mod-icon">{m.icon}</div>
            <div className="mod-cat">{catLabels[m.cat] || m.cat}</div>
            <div className="mod-name">{m.name}</div>
            {m.sub && <div className="mod-age" style={{ color: "rgba(255,255,255,0.5)" }}>{m.sub}</div>}
            <div className="mod-age">{m.age}</div>
            <div className="mod-coord">Coord: {m.coord}</div>
            <span className={`mod-tag ${m.tag}`}>{m.tag === "open" ? "Aberto" : "Membros IBB"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export { modalities };
