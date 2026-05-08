import logoImg from "../../assets/olimpiedas_logo-removebg-preview.png";

interface NavbarProps {
  scrolled: boolean;
  onGoToRegistration: () => void;
}

export function Navbar({ scrolled, onGoToRegistration }: NavbarProps) {
  return (
    <nav id="navbar" className={scrolled ? "scrolled" : ""}>
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <img src={logoImg} alt="Olimpíadas IBB" className="logo-img hide-on-mobile" />
        <h1 className="nav-title-mobile show-on-mobile">
          OLIMPÍADAS<br />
          <span className="accent">IBB 2026</span>
        </h1>
      </div>
      <div className="nav-links">
        <a href="#sobre">Sobre</a>
        <a href="#modalidades">Modalidades</a>
        <a href="#inscricao">Inscrição</a>
      </div>
      <button className="nav-cta" onClick={onGoToRegistration}>Inscreva-se</button>
    </nav>
  );
}
