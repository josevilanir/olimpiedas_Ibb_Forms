interface FooterProps {
  onGoToAdmin: () => void;
}

export function Footer({ onGoToAdmin }: FooterProps) {
  return (
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
        <span>© 2026 Olimpíadas IBB — Todos os direitos reservados</span>
        <a href="#" className="admin-link" onClick={(e) => { e.preventDefault(); onGoToAdmin(); }}>Acesso Admin</a>
      </div>
    </footer>
  );
}
