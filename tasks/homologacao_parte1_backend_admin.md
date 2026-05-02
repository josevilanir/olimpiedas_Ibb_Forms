# Homologação Parte 1 — Backend + Admin Dashboard

> Leia `claude.md` na raiz antes de começar. Siga os princípios: simplicidade, impacto mínimo, sem gambiarras.
> Crie um `tasks/todo.md` com checkboxes antes de implementar. Marque itens conforme avança.

---

## 1. SEED — Faixas etárias e regras de membership

**Arquivo:** `backend/prisma/seed.ts`

### 1.1 Alterar faixas etárias (3 modalidades)

Localizar cada modalidade pelo `name` e alterar os campos `minAge`/`maxAge`:

| Modalidade | Campo | Valor Atual | Novo Valor |
|---|---|---|---|
| `Corrida Curta Pré Teens (tiros de 100m e 150m)` | `minAge` | `10` | `9` |
| `Corrida Curta Kids (tiros de 10m, 20m e 30m)` | `maxAge` | `9` | `8` |
| `Circuito Kids (corrida de obstáculos)` | `minAge` | `8` | `9` |

### 1.2 Corridas Curtas abertas para não membros (3 modalidades)

Alterar `requiresMembership` de `true` para `false`:

- `Corrida Curta Adulta (tiros de 100m, 150m e 200m)` — linha ~22
- `Corrida Curta Pré Teens (tiros de 100m e 150m)` — linha ~28
- `Corrida Curta Kids (tiros de 10m, 20m e 30m)` — linha ~34

### 1.3 Treino Funcional exclusivo membros

Alterar `requiresMembership` de `false` para `true`:

- `Treino Funcional (não é competição)` — linha ~133

### Verificação

Rodar `npx prisma db seed` localmente e confirmar que as modalidades foram atualizadas via `upsert`.

---

## 2. NOVA ROTA — Exportação Financeira (Excel)

### 2.1 Criar função no export service

**Arquivo:** `backend/src/services/export.service.ts`

Adicionar nova função `exportFinanceToExcel` **após** a função `exportParticipantsToExcel` existente. NÃO alterar a função existente.

```typescript
export async function exportFinanceToExcel(): Promise<ExcelJS.Buffer> {
  const participants = await prisma.participant.findMany({
    where: { paymentStatus: { not: "CANCELADO" } },
    orderBy: { fullName: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Olimpíadas IBB";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Controle Financeiro");

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A56DB" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } },
  };

  sheet.columns = [
    { header: "Nome completo", key: "fullName", width: 32 },
    { header: "Vínculo", key: "isMember", width: 14 },
    { header: "Idade", key: "age", width: 8 },
    { header: "Status Pagamento", key: "paymentStatus", width: 18 },
  ];

  sheet.getRow(1).eachCell((cell) => { Object.assign(cell, headerStyle); });
  sheet.getRow(1).height = 20;

  const FEE = 15.09;
  let confirmedCount = 0;

  for (const p of participants) {
    const age = calcAge(new Date(p.birthDate));
    const isExempt = age <= 8;

    sheet.addRow({
      fullName: p.fullName,
      isMember: p.isMember,
      age,
      paymentStatus: p.paymentStatus,
    });

    if (p.paymentStatus === "PAGO" && !isExempt) {
      confirmedCount++;
    }
  }

  // Zebra rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: rowNumber % 2 === 0 ? "FFF9FAFB" : "FFFFFFFF" },
      };
    });
  });

  // Linha em branco + resumo
  sheet.addRow({});
  const totalRevenue = (confirmedCount * FEE).toFixed(2);
  const summaryRow = sheet.addRow({
    fullName: `R$ ${FEE} × ${confirmedCount} pagamentos confirmados = R$ ${totalRevenue}`,
  });
  summaryRow.font = { bold: true, size: 12 };
  summaryRow.getCell(1).alignment = { horizontal: "left" };

  return workbook.xlsx.writeBuffer();
}
```

A função `calcAge` já existe nesse mesmo arquivo — reutilize-a.

### 2.2 Adicionar controller

**Arquivo:** `backend/src/controllers/admin.controller.ts`

Adicionar import da nova função na linha 9:
```diff
-import { exportParticipantsToExcel } from "../services/export.service";
+import { exportParticipantsToExcel, exportFinanceToExcel } from "../services/export.service";
```

Adicionar nova função **após** `exportExcel` (após linha 91):
```typescript
export async function exportFinance(_req: Request, res: Response) {
  try {
    const buffer = await exportFinanceToExcel();
    const filename = `financeiro_olimpiadas_ibb_${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer as ArrayBuffer));
  } catch (error) {
    console.error("[exportFinance]", error);
    res.status(500).json({ error: "Erro ao gerar planilha financeira." });
  }
}
```

### 2.3 Registrar rota

**Arquivo:** `backend/src/routes/admin.routes.ts`

Adicionar import de `exportFinance` na linha 2 e registrar rota na linha 17:
```diff
-import { login, getParticipants, removeParticipant, editParticipant, getByModality, exportExcel, stats } from "../controllers/admin.controller";
+import { login, getParticipants, removeParticipant, editParticipant, getByModality, exportExcel, exportFinance, stats } from "../controllers/admin.controller";
```
```diff
 router.get("/export", exportExcel);
+router.get("/export-finance", exportFinance);
```

---

## 3. ADMIN DASHBOARD — Ajustes no componente

**Arquivo:** `frontend/src/pages/AdminDashboard.tsx`

### 3.1 Ordenação de colunas na tabela de participantes

Adicionar estados de ordenação no topo do componente (após linha 59):

```typescript
type SortKey = "fullName" | "parentName" | "age" | "whatsapp" | "gender" | "isMember" | "paymentStatus" | "createdAt";
type SortDir = "asc" | "desc";
const [sortKey, setSortKey] = useState<SortKey | null>(null);
const [sortDir, setSortDir] = useState<SortDir>("asc");

function handleSort(key: SortKey) {
  if (sortKey === key) {
    setSortDir(d => d === "asc" ? "desc" : "asc");
  } else {
    setSortKey(key);
    setSortDir("asc");
  }
}

function sortIndicator(key: SortKey) {
  if (sortKey !== key) return " ↕";
  return sortDir === "asc" ? " ▲" : " ▼";
}
```

Criar função de ordenação que será reutilizada pela tela E pela impressão:

```typescript
function getSortedParticipants(list: Participant[]): Participant[] {
  if (!sortKey) return list;
  return [...list].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    if (sortKey === "age") {
      aVal = calcAge(a.birthDate);
      bVal = calcAge(b.birthDate);
    } else if (sortKey === "createdAt") {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    } else {
      aVal = (a[sortKey] ?? "").toString().toLowerCase();
      bVal = (b[sortKey] ?? "").toString().toLowerCase();
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
}
```

Alterar `filteredParticipants` (linha 288) para usar a ordenação:

```diff
-const filteredParticipants = participants.filter((p) => {
+const filteredParticipants = getSortedParticipants(participants.filter((p) => {
   const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase());
   const matchesPayment = paymentFilter === "ALL" || p.paymentStatus === paymentFilter;
   return matchesSearch && matchesPayment;
-});
+}));
```

Nos `<th>` da tabela (linhas 772-783), tornar clicáveis:

```tsx
<th onClick={() => handleSort("fullName")} style={{cursor:"pointer"}}>Nome{sortIndicator("fullName")}</th>
<th onClick={() => handleSort("parentName")} style={{cursor:"pointer"}}>Responsável{sortIndicator("parentName")}</th>
<th onClick={() => handleSort("age")} style={{cursor:"pointer"}}>Idade{sortIndicator("age")}</th>
<th>WhatsApp</th>
<th>Sexo</th>
<th onClick={() => handleSort("isMember")} style={{cursor:"pointer"}}>Membro{sortIndicator("isMember")}</th>
<th onClick={() => handleSort("paymentStatus")} style={{cursor:"pointer"}}>Pagamento{sortIndicator("paymentStatus")}</th>
<th>Inf. Saúde</th>
<th onClick={() => handleSort("createdAt")} style={{cursor:"pointer"}}>Inscrito em{sortIndicator("createdAt")}</th>
<th>Ações</th>
```

### 3.2 Print layout — coluna Idade + logo preta + respeitar ordenação

No bloco `printLayout` (linhas 862-887):

```tsx
<div className={styles.printLayout}>
  <div className={styles.printHeader}>
    <img src={logoImg} alt="IBB" className={styles.printLogo} />
    <div>
      <h2>Lista de Chamada — {selectedModality.name}</h2>
      <p className={styles.printDate}>Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
    </div>
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
      {filteredParticipants.map((p) => (
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
```

**Importante:** Usa `filteredParticipants` (que já inclui a ordenação) em vez de `participants`.

### 3.3 Estatísticas — remover Excel, adicionar Imprimir Gráficos

Na view `stats`, pageHeader (linhas 422-427):

```diff
 <div className={styles.pageHeader}>
   <h2>Estatísticas</h2>
-  <button className="btn btn-secondary" onClick={() => handleExport()}>
-    Exportar tudo (Excel)
-  </button>
+  <button className="btn btn-secondary" onClick={() => window.print()}>
+    🖨️ Imprimir Gráficos
+  </button>
 </div>
```

### 3.4 Financeiro — resumo informativo

Na view `finance`, após `loadingStats` e antes do `statsData &&` (linha ~685), adicionar bloco info:

```tsx
<div className={styles.financeInfo}>
  <p><strong>Valor por inscrição:</strong> R$ 15,09 (isento até 8 anos)</p>
  <p><strong>PIX (e-mail):</strong> eventosibbnatal@gmail.com</p>
</div>
```

### 3.5 Financeiro — botão exportar chama nova rota

Alterar o botão "Exportar Excel" da view finance (linha 678) para chamar a nova rota:

```tsx
<button className="btn btn-secondary" onClick={() => handleExportFinance()}>
  Exportar Excel
</button>
```

Adicionar a função `handleExportFinance` (próximo à `handleExport`):

```typescript
async function handleExportFinance() {
  const url = `${BASE_URL}/admin/export-finance`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      showFeedback("error", errorBody?.error ?? `Erro ${response.status}`);
      return;
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `financeiro_olimpiadas_ibb_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); document.body.removeChild(link); }, 1000);
  } catch {
    showFeedback("error", "Erro de rede ao exportar.");
  }
}
```

### 3.6 Renomear "Receita Realizada" → "Entradas Confirmadas"

Linha 701:
```diff
-<p className={styles.statLabel}>Receita Realizada</p>
+<p className={styles.statLabel}>Entradas Confirmadas</p>
```

---

## 4. ADMIN CSS

**Arquivo:** `frontend/src/pages/AdminDashboard.module.css`

### 4.1 Logo maior no sidebar (+30%)

Linha 38: `height: 200px` → `height: 260px`

### 4.2 Estilos para print (logo + gráficos)

Adicionar no final do arquivo (após os estilos existentes de `@media print`):

```css
/* Print header with logo */
.printHeader {
  display: none;
}

.printLogo {
  height: 60px;
  width: auto;
  filter: brightness(0); /* Logo preta */
}

/* Finance info box */
.financeInfo {
  background: #0f2133;
  border: 1px solid rgba(10,157,143,0.15);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-6);
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.financeInfo p {
  font-size: var(--font-size-sm);
  color: rgba(200,230,225,0.7);
}

.financeInfo strong {
  color: #0aad9f;
}

@media print {
  .printHeader {
    display: flex !important;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }
}
```

Também atualizar o `@media print` existente (linhas 832-877) para suportar impressão de gráficos quando na view stats. Adicionar dentro do bloco `@media print`:

```css
/* Quando imprimindo gráficos (stats view), mostrar o main */
.layout > main .chartSection {
  break-inside: avoid;
}
```

### 4.3 Cursor pointer nos th ordenáveis

Adicionar:
```css
.table th[style*="cursor"] {
  user-select: none;
}
.table th:hover {
  color: #0aad9f;
}
```

---

## 5. LOGIN PAGE — Logo maior (+30%)

**Arquivo:** `frontend/src/pages/LoginPage.module.css`

Linha 79: `height: 300px` → `height: 390px`

---

## Verificação Final (Backend + Admin)

1. `cd backend && npx tsc --noEmit` — sem erros de tipo
2. `npx prisma db seed` — seed roda sem erros
3. `cd frontend && npm run build` — build OK
4. Testar manualmente: Admin > Modalidades > Ver inscritos > clicar em "Nome" ordena A-Z, clicar de novo ordena Z-A
5. Testar "Imprimir Lista" — deve mostrar logo preta, coluna idade, e respeitar ordenação
6. Testar Estatísticas > "Imprimir Gráficos" — abre diálogo de impressão com gráficos
7. Testar Financeiro > resumo visível + "Exportar Excel" baixa planilha com nome/vínculo/idade/status + linha de total
8. "Entradas Confirmadas" aparece no card correto
