import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import './LandingPage.css';
import logoImg from '../assets/olimpiedas_logo-removebg-preview.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const onGoToRegistration = () => navigate('/inscricao');
  const onGoToAdmin = () => navigate('/admin/login');
  const [scrolled, setScrolled] = useState(false);
  const [countdown, setCountdown] = useState({ d: '--', h: '--', m: '--', s: '--' });
  const [activeFilter, setActiveFilter] = useState('all');

  const modalities = [
    { name: 'Corrida Longa 5km', cat: 'corrida', age: 'Livre', icon: '🏃', tag: 'open', coord: 'Emicarlo Souza e Carlos Mora' },
    { name: 'Caminhada 2,5km', cat: 'livre', age: 'Livre', icon: '🚶', tag: 'open', coord: 'Emicarlo Souza e Carlos Mora' },
    { name: 'Corrida Curta Adulta', cat: 'corrida', age: '14+ anos', icon: '⚡', tag: 'member', sub: '100m · 150m · 200m', coord: 'Emicarlo Souza e Carlos Mora' },
    { name: 'Corrida Curta Pré-Teens', cat: 'corrida', age: '10–13 anos', icon: '⚡', tag: 'member', sub: '100m · 150m', coord: 'Emicarlo Souza e Carlos Mora' },
    { name: 'Corrida Curta Kids', cat: 'kids', age: '3–9 anos', icon: '⚡', tag: 'member', sub: '10m · 20m · 30m', coord: 'Emicarlo Souza e Carlos Mora' },
    { name: 'Futsal', cat: 'coletivo', age: '14+ anos', icon: '⚽', tag: 'member', coord: 'Jonatas Silveira (Jow)' },
    { name: 'Futsal Pré-Teens', cat: 'coletivo', age: '10–13 anos', icon: '⚽', tag: 'member', coord: 'Jonatas Silveira (Jow)' },
    { name: 'Vôlei de Quadra', cat: 'coletivo', age: '14+ anos', icon: '🏐', tag: 'member', coord: 'Daniel César' },
    { name: 'Queimada', cat: 'coletivo', age: '11+ anos', icon: '🔥', tag: 'member', coord: 'Jonatas Silveira (Jow)' },
    { name: 'Basquete', cat: 'coletivo', age: '14+ anos', icon: '🏀', tag: 'member', coord: 'Jonatas Silveira (Jow)' },
    { name: 'Natação', cat: 'livre', age: '9+ anos', icon: '🏊', tag: 'member', coord: 'Jonatas Silveira (Jow)' },
    { name: 'Tênis de Mesa', cat: 'livre', age: '9+ anos', icon: '🏓', tag: 'member', coord: 'Lucas Santos' },
    { name: 'Circuito Adulto', cat: 'corrida', age: '14+ anos', icon: '🏋️', tag: 'member', sub: 'Obstáculos', coord: 'Fran Missionário' },
    { name: 'Circuito Kids', cat: 'kids', age: '8–13 anos', icon: '🏋️', tag: 'member', sub: 'Obstáculos', coord: 'Fran Missionário' },
    { name: 'E-Sports FIFA', cat: 'esports', age: '9+ anos', icon: '🎮', tag: 'member', coord: 'Gustavo Felipe e Davi Severiano' },
    { name: 'E-Sports CS', cat: 'esports', age: '9+ anos', icon: '🎮', tag: 'member', sub: 'Counter-Strike', coord: 'Gustavo Felipe e Davi Severiano' },
    { name: 'E-Sports LoL', cat: 'esports', age: '9+ anos', icon: '🎮', tag: 'member', sub: 'League of Legends', coord: 'Gustavo Felipe e Davi Severiano' },
    { name: 'Treino Funcional', cat: 'livre', age: 'Livre', icon: '💪', tag: 'open', sub: 'Não competitivo', coord: 'Jonatas Silveira (Jow)' },
  ];

  const catLabels: Record<string, string> = { corrida: 'Corrida', coletivo: 'Coletivo', esports: 'E-Sports', kids: 'Kids', livre: 'Livre' };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const EVENT_DATE = new Date(2026, 6, 4, 8, 0, 0);
    const updateCountdown = () => {
      const now = new Date();
      const diff = EVENT_DATE.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ d: '00', h: '00', m: '00', s: '00' });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({
        d: String(d).padStart(2, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0')
      });
    };

    updateCountdown();
    const cdInterval = setInterval(updateCountdown, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(cdInterval);
      observer.disconnect();
    };
  }, []);

  const filteredMods = activeFilter === 'all' ? modalities : modalities.filter(m => m.cat === activeFilter);
  const tickerItems = modalities.map(m => m.name);
  const trackItems = [...tickerItems, ...tickerItems];

  return (
    <div className="landing-page-container">
      {/* NAV */}
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logoImg} alt="Olimpíadas IBB" className="logo-img" />
        </div>
        <div className="nav-links">
          <a href="#sobre">Sobre</a>
          <a href="#modalidades">Modalidades</a>
          <a href="#inscricao">Inscrição</a>
        </div>
        <button className="nav-cta" onClick={onGoToRegistration}>Inscreva-se</button>
      </nav>

      {/* HERO */}
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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>

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
                <button className="btn-ghost" onClick={() => document.getElementById('modalidades')?.scrollIntoView({ behavior: 'smooth' })}>Ver modalidades</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {trackItems.map((item, i) => (
            <span key={i} className="ticker-item">{item}<span className="sep">✦</span></span>
          ))}
        </div>
      </div>

      {/* SOBRE */}
      <section id="sobre">
        <div className="sobre-grid">
          <div className="sobre-img-block reveal">
            <div className="sobre-img">
              <div className="img-placeholder">foto do evento<br />atletas / comunidade<br />IBB</div>
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
            <div className="sobre-stats reveal reveal-delay-4">
              <div className="stat"><div className="n">18</div><div className="l">Modalidades</div></div>
              <div className="stat"><div className="n">3+</div><div className="l">Anos de idade</div></div>
              <div className="stat"><div className="n">R$15</div><div className="l">Inscrição</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* MODALIDADES */}
      <section id="modalidades">
        <div className="mod-header">
          <div>
            <div className="section-eyebrow reveal">Modalidades</div>
            <h2 className="section-title reveal reveal-delay-1" style={{ marginBottom: 0 }}>O que você<br />vai disputar</h2>
          </div>
          <div className="mod-filter reveal reveal-delay-2">
            {['all', 'corrida', 'coletivo', 'esports', 'kids', 'livre'].map(f => (
              <button
                key={f}
                className={`mod-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === 'all' ? 'Todas' : f === 'coletivo' ? 'Coletivos' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mod-grid">
          {filteredMods.map((m, i) => (
            <div key={i} className="mod-card">
              <div className="mod-icon">{m.icon}</div>
              <div className="mod-cat">{catLabels[m.cat] || m.cat}</div>
              <div className="mod-name">{m.name}</div>
              {m.sub && <div className="mod-age" style={{ color: 'rgba(255,255,255,0.5)' }}>{m.sub}</div>}
              <div className="mod-age">{m.age}</div>
              <div className="mod-coord">Coord: {m.coord}</div>
              <span className={`mod-tag ${m.tag}`}>{m.tag === 'open' ? 'Aberto' : 'Membros IBB'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* INSCRIÇÃO */}
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
            <div className="step-desc">R$ 15,09 por pessoa. Crianças de até 8 anos não pagam.</div>
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
          <div style={{ textAlign: 'right' }}>
            <div className="pix-key">eventosibbnatal<span>@gmail.com</span></div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>R$ 15,09 · isento até 8 anos</div>
          </div>
          <button className="btn-primary" style={{ flexShrink: 0 }} onClick={onGoToRegistration}>Ir para o formulário →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              Olimpíadas IBB
              <div className="sub">Natal · RN</div>
            </div>
          </div>
          <div className="footer-contact">
            <a href="mailto:eventosibbnatal@gmail.com">eventosibbnatal@gmail.com</a>
            <a href="#">Igreja Batista Bereana</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Olimpíadas IBB — Todos os direitos reservados</span>
          <a href="#" className="admin-link" onClick={(e) => { e.preventDefault(); onGoToAdmin(); }}>Acesso Admin</a>
        </div>
      </footer>
    </div>
  );
}
