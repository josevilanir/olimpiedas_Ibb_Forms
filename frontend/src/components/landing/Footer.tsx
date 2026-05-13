interface FooterProps {
  onGoToAdmin: () => void;
}

export function Footer({ onGoToAdmin }: FooterProps) {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-logo">
            Olimpíadas IBB 2026
            <div className="sub">Natal · RN</div>
          </div>
        </div>
        <div className="footer-contact">
          <a href="mailto:eventosibbnatal@gmail.com">eventosibbnatal@gmail.com</a>
          <a href="#">Igreja Batista Bereana</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-info">
          <span>© 2026 Olimpíadas IBB — Todos os direitos reservados</span>
          <div className="dev-attribution">
            Desenvolvido por <a href="https://vilaniros.vercel.app/" target="_blank" rel="noopener noreferrer">Jose Vilanir</a>
            <div className="dev-contact">
              <a href="mailto:vilanirneto@hotmail.com">vilanirneto@hotmail.com</a>
              <span className="sep">•</span>
              <a href="tel:84999900999">84 99990-0999</a>
            </div>
          </div>
        </div>
        <a href="#" className="admin-link" onClick={(e) => { e.preventDefault(); onGoToAdmin(); }}>Acesso Admin</a>
      </div>
    </footer>
  );
}
