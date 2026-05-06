import type { Modality, Participant } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";
import logoImg from "../../assets/olimpiedas_logo-removebg-preview.png";
import logoIbb from "../../assets/logibb (1).png";
import { calcAge } from "../../utils/age";

interface PrintLayoutProps {
  modality: Modality;
  participants: Participant[];
}

export function PrintLayout({ modality, participants }: PrintLayoutProps) {
  return (
    <div className={styles.printLayout}>
      <div className={styles.printHeader}>
        <img src={logoImg} alt="Olimpíadas" className={styles.printLogo} />
        <div>
          <h2>Lista de Chamada — {modality.name}</h2>
          <p className={styles.printDate}>Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
        <img src={logoIbb} alt="IBB" className={styles.printLogoIbb} />
      </div>
      <table className={styles.printTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Idade</th>
            <th>Vínculo</th>
            <th>WhatsApp</th>
            <th>Assinatura / Obs</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td>{p.fullName}</td>
              <td>{calcAge(p.birthDate)} anos</td>
              <td>{p.isMember}</td>
              <td>{p.whatsapp}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
