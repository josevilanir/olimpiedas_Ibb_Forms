import type { Modality, View } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";
import logoImg from "../../assets/olimpiedas_logo-removebg-preview.png";

interface SidebarProps {
  view: View;
  selectedModality: Modality | null;
  adminName: string;
  isSidebarOpen: boolean;
  onViewChange: (view: View) => void;
  onStatsClick: () => void;
  onFinanceClick: () => void;
  onParticipantsClick: () => void;
  onLogout: () => void;
  onToggle: () => void;
  onCloseSidebar: () => void;
}

export function Sidebar({
  view, selectedModality, adminName, isSidebarOpen,
  onViewChange, onStatsClick, onFinanceClick, onParticipantsClick,
  onLogout, onToggle, onCloseSidebar,
}: SidebarProps) {
  return (
    <>
      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayActive : ""}`}
        onClick={onCloseSidebar}
      />
      <button
        className={styles.mobileToggle}
        onClick={onToggle}
        aria-label="Menu"
      >
        {isSidebarOpen ? "✕" : "☰"}
      </button>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ""}`}>
        <div className={styles.sidebarHeader}>
          <img src={logoImg} alt="Olimpíadas IBB" className={styles.sidebarLogo} />
          <div className={styles.sidebarHeaderText}>
            <p className={styles.sidebarSub}>Painel Admin</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${view === "modalities" ? styles.navBtnActive : ""}`}
            onClick={() => { onViewChange("modalities"); onCloseSidebar(); }}
          >
            Modalidades
          </button>
          <button
            className={`${styles.navBtn} ${view === "stats" ? styles.navBtnActive : ""}`}
            onClick={() => { onStatsClick(); onCloseSidebar(); }}
          >
            Estatísticas
          </button>
          <button
            className={`${styles.navBtn} ${view === "finance" ? styles.navBtnActive : ""}`}
            onClick={() => { onFinanceClick(); onCloseSidebar(); }}
          >
            Financeiro
          </button>
          {selectedModality && (
            <button
              className={`${styles.navBtn} ${view === "participants" ? styles.navBtnActive : ""}`}
              onClick={() => { onParticipantsClick(); onCloseSidebar(); }}
            >
              ↳ {selectedModality.name}
            </button>
          )}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.adminName}>{adminName}</p>
          <button className={styles.logoutBtn} onClick={onLogout}>Sair</button>
        </div>
      </aside>
    </>
  );
}
