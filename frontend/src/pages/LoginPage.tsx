import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/AuthContext";
import styles from "./LoginPage.module.css";
import logoImg from "../assets/olimpiedas_logo-removebg-preview.png";

export default function LoginPage() {
  const { login, error, loading, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className={styles.page}>
      <div className={styles.texture}></div>
      <div className={styles.orb}></div>
      
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src={logoImg} alt="Olimpíadas IBB" className={styles.logoImg} />
          </div>
          <p>Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>E-mail de acesso</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              required
              autoFocus
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Verificando..." : "Entrar no Painel →"}
          </button>
        </form>
      </div>
    </div>
  );
}
