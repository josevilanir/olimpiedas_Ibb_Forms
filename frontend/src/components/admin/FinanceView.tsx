import type { Stats } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";

interface FinanceViewProps {
  statsData: Stats | null;
  loadingStats: boolean;
  onExportFinance: () => void;
}

export function FinanceView({ statsData, loadingStats, onExportFinance }: FinanceViewProps) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Controle Financeiro</h2>
        <button className="btn btn-secondary" onClick={onExportFinance}>
          Exportar Excel
        </button>
      </div>

      {loadingStats && <p className={styles.loading}>Carregando dados financeiros...</p>}

      <div className={styles.financeInfo}>
        <p><strong>Valor por inscrição:</strong> R$ 15,09 (isento até 8 anos)</p>
        <p><strong>PIX (e-mail):</strong> eventosibbnatal@gmail.com</p>
      </div>

      {statsData && (
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Inscritos (Ativos)</p>
            <p className={styles.statValue}>{statsData.totalParticipants}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Pagamentos Confirmados</p>
            <p className={styles.statValue}>{statsData.paymentCount.PAGO}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Receita Esperada</p>
            <p className={styles.statValue}>R$ {statsData.revenue.estimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Entradas Confirmadas</p>
            <p className={`${styles.statValue} ${styles.statValueSuccess}`}>R$ {statsData.revenue.actual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
    </div>
  );
}
