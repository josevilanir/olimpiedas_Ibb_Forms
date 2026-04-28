import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import styles from "./App.module.css";

type AppView = "registration" | "admin-login" | "admin-dashboard";

export default function App() {
  const [view, setView] = useState<AppView>("registration");
  const { token, user, login, logout, error, loading, isAuthenticated } = useAuth();

  function handleLogin(email: string, password: string) {
    return login(email, password).then(() => {
      if (isAuthenticated || token) setView("admin-dashboard");
    });
  }

  // After login succeeds the state updates — catch it on next render
  if (view === "admin-login" && isAuthenticated) {
    setView("admin-dashboard");
  }

  if (view === "admin-dashboard" && isAuthenticated && user && token) {
    return (
      <AdminDashboard
        token={token}
        adminName={user.name}
        onLogout={() => { logout(); setView("registration"); }}
      />
    );
  }

  if (view === "admin-login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <div>
      <div className={styles.adminLink}>
        <button onClick={() => setView("admin-login")}>Acesso Admin</button>
      </div>
      <RegistrationPage />
    </div>
  );
}
