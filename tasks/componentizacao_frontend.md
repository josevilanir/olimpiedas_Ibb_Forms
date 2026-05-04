# Plano de Componentização do Frontend

## Contexto

As páginas do frontend estão monolíticas e precisam ser quebradas em componentes reutilizáveis. **Já existe uma suíte de testes** (39 testes, 4 arquivos) que serve como rede de segurança — rode `npm run test:run` após cada extração de componente para garantir zero regressão.

### Estado atual dos arquivos de página

| Arquivo | Linhas | Problema |
|---------|--------|----------|
| `src/pages/AdminDashboard.tsx` | 1152 | God component com sidebar, 4 views, 2 modais, gráficos, tabela, print layout |
| `src/pages/RegistrationPage.tsx` | 956 | Wizard de 14 steps em um único `renderStep()` switch/case |
| `src/pages/LandingPage.tsx` | 306 | Aceitável, mas tem 5 seções distintas que podem ser componentes |
| `src/pages/LoginPage.tsx` | 71 | ✅ Já está pequeno — não precisa componentizar |

### Testes existentes

```
src/__tests__/AdminDashboard.test.tsx   — 4 testes (sidebar, nav, export, search)
src/__tests__/RegistrationPage.test.tsx — 9 testes (wizard steps, navegação, disclaimers)
src/__tests__/LandingPage.test.tsx      — 20 testes (navbar, hero, sobre, modalidades, filtro, footer)
src/__tests__/LoginPage.test.tsx        — 6 testes (form, submit, erro, loading)
```

**Comando de verificação:** `npm run test:run`

---

## Regras Obrigatórias

1. **Rode `npm run test:run` após CADA componente extraído** — todos os 39 testes devem continuar passando.
2. **Opção B de CSS** — manter o CSS module da página como compartilhado entre os componentes. Ou seja, os componentes extraídos importam o mesmo `AdminDashboard.module.css`, `RegistrationPage.module.css`, ou `LandingPage.css` da página-mãe. NÃO crie CSS modules separados por componente.
3. **Props claras** — cada componente recebe via props apenas o que precisa. State e handlers ficam na page.
4. **Zero breaking changes** — o HTML renderizado, classes CSS e comportamento devem permanecer idênticos.
5. **Siga o `claude.md`** — leia as regras do projeto, especialmente a seção "Componentization" (item 1 das Best Practices).
6. **Não altere os testes** — os testes são a fonte de verdade. Se um teste quebra, o componente foi extraído incorretamente.

---

## Estrutura de pastas alvo

```
src/components/
├── ProtectedRoute.tsx              (já existe)
├── admin/
│   ├── Sidebar.tsx
│   ├── ModalityGrid.tsx
│   ├── ParticipantsTable.tsx
│   ├── StatsView.tsx
│   ├── FinanceView.tsx
│   ├── EditParticipantModal.tsx
│   ├── DeleteConfirmModal.tsx
│   ├── FeedbackToast.tsx
│   └── PrintLayout.tsx
├── registration/
│   ├── ProgressBar.tsx
│   ├── ModalityCard.tsx
│   ├── UnavailableModalityCard.tsx
│   ├── SuccessScreen.tsx
│   └── steps/
│       ├── DisclaimerStep.tsx
│       ├── ProfileStep.tsx
│       ├── TextInputStep.tsx
│       ├── DateInputStep.tsx
│       ├── GenderStep.tsx
│       ├── MemberStep.tsx
│       ├── HealthStep.tsx
│       ├── PaymentDisclaimerStep.tsx
│       ├── ModalitiesStep.tsx
│       └── TermsStep.tsx
└── landing/
    ├── Navbar.tsx
    ├── HeroSection.tsx
    ├── AboutSection.tsx
    ├── ModalitiesSection.tsx
    ├── RegistrationSteps.tsx
    └── Footer.tsx
```

---

## Tarefa 1 — AdminDashboard (prioridade alta)

O arquivo `AdminDashboard.tsx` tem 1152 linhas. O objetivo é reduzi-lo para ~150-200 linhas, mantendo apenas o state central e a orquestração de views.

### Ordem de extração (componentes folha primeiro)

#### 1.1 — `FeedbackToast` (linhas 417-421)

```tsx
// src/components/admin/FeedbackToast.tsx
interface FeedbackToastProps {
  feedback: { type: "success" | "error"; msg: string } | null;
}
```

- Extrair o `<div className={feedback...}>` que mostra mensagens de sucesso/erro.
- Importa `styles` de `../../pages/AdminDashboard.module.css`.

#### 1.2 — `DeleteConfirmModal` (linhas 1036-1047)

```tsx
interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}
```

- Modal simples com título, mensagem e dois botões.

#### 1.3 — `EditParticipantModal` (linhas 1049-1148)

```tsx
interface EditParticipantModalProps {
  editState: EditState;
  modalities: Modality[];
  saving: boolean;
  onEditStateChange: (updater: (prev: EditState | null) => EditState | null) => void;
  onSave: () => void;
  onCancel: () => void;
}
```

- Modal com formulário de edição (grid 2 colunas, checkboxes de modalidades).
- O type `EditState` deve ser exportado de `AdminDashboard.tsx` ou movido para `types/index.ts`.

#### 1.4 — `PrintLayout` (linhas 1000-1033)

```tsx
interface PrintLayoutProps {
  modality: Modality;
  participants: Participant[];
  calcAge: (birthDate: string) => number;
}
```

- Layout de impressão (hidden on screen, visible on print).
- Usa `logoImg` e `styles.printLayout`, `styles.printTable`, etc.

#### 1.5 — `Sidebar` (linhas 359-414)

```tsx
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
  onCloseSidebar: () => void;
}
```

- Inclui overlay mobile (linhas 361-364) e botão toggle (linhas 367-373).
- Logo, navegação, footer com nome do admin e botão de logout.

#### 1.6 — `ModalityGrid` (linhas 424-481)

```tsx
interface ModalityGridProps {
  modalities: Modality[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportAll: () => void;
  onExportModality: (id: string) => void;
  onViewParticipants: (modality: Modality) => void;
  loading: boolean;
}
```

- Header "Modalidades" + input de busca + botão exportar.
- Grid de cards com nome, faixa etária, vagas, coordenador, e botões de ação.
- Helper `ageLabel()` pode ser movido para `utils/` ou passado como prop.

#### 1.7 — `StatsView` (linhas 484-805)

Este é o maior bloco. Contém:
- Filter pills de membro (ALL, SIM, GR, NAO)
- Bar chart (modalidades ou faixas etárias) com drag-to-scroll
- Pie charts (gênero, vínculo, pagamento) com seletor de modo
- Print-only pies

```tsx
interface StatsViewProps {
  statsData: Stats | null;
  pieStatsData: Stats | null;
  loadingStats: boolean;
  loadingPieStats: boolean;
  memberFilter: MemberFilter;
  chartMode: ChartMode;
  pieMode: PieMode;
  activeBar: { id: string; name: string } | null;
  onMemberFilterChange: (f: MemberFilter) => void;
  onChartModeChange: (m: ChartMode) => void;
  onPieModeChange: (m: PieMode) => void;
  onBarClick: (entry: Record<string, unknown>) => void;
  onClearBarFilter: () => void;
}
```

- Toda a lógica de drag-to-scroll (`scrollRef`, `dragRef`, handlers de mouse) fica DENTRO deste componente (é lógica de UI, não de negócio).
- Os types `MemberFilter`, `ChartMode`, `PieMode` devem ser exportados (podem ir para `types/index.ts` ou serem definidos no componente).

#### 1.8 — `FinanceView` (linhas 807-847)

```tsx
interface FinanceViewProps {
  statsData: Stats | null;
  loadingStats: boolean;
  onExportFinance: () => void;
}
```

- Header "Controle Financeiro" + botão exportar.
- Info box PIX + 4 stat cards.

#### 1.9 — `ParticipantsTable` (linhas 851-997)

```tsx
interface ParticipantsTableProps {
  modality: Modality;
  participants: Participant[];
  loading: boolean;
  searchQuery: string;
  paymentFilter: PaymentFilter;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSearchChange: (q: string) => void;
  onPaymentFilterChange: (f: PaymentFilter) => void;
  onSort: (key: SortKey) => void;
  onBack: () => void;
  onPrint: () => void;
  onExport: (modalityId: string) => void;
  onEdit: (p: Participant) => void;
  onDelete: (id: string) => void;
  onUpdatePayment: (p: Participant, status: PaymentStatus) => void;
}
```

- Header com voltar, nome da modalidade, contagem.
- Barra de busca + filtros de pagamento.
- Tabela com sorting, colunas, ações.
- Lógica de sort (`getSortedParticipants`, `sortIndicator`, `handleSort`) pode ficar DENTRO deste componente.
- Helpers `calcAge`, `formatDate`, `isAgeOutOfRange` podem ser movidos para `utils/`.

### Resultado final do AdminDashboard.tsx

Após extrair tudo, o arquivo ficará assim:

```tsx
export default function AdminDashboard() {
  // State declarations
  // API calls (loadStats, loadParticipants, handleDelete, handleSaveEdit, etc.)
  // Render: <Sidebar /> + <main> com switch de view
  //   view === "modalities" → <ModalityGrid />
  //   view === "stats" → <StatsView />
  //   view === "finance" → <FinanceView />
  //   view === "participants" → <ParticipantsTable /> + <PrintLayout />
  // <FeedbackToast />
  // <DeleteConfirmModal /> (condicional)
  // <EditParticipantModal /> (condicional)
}
```

---

## Tarefa 2 — RegistrationPage (prioridade média)

O arquivo `RegistrationPage.tsx` tem 956 linhas. O objetivo é reduzir para ~200 linhas.

### Componentes já inline que só precisam ser movidos

#### 2.1 — `ProgressBar` (linhas 96-110)

Já é uma function component declarada inline. Basta mover para `src/components/registration/ProgressBar.tsx`.

```tsx
interface ProgressBarProps { step: number; total: number; }
```

#### 2.2 — `ModalityCard` (linhas 113-147) + `UnavailableModalityCard` (linhas 149-194)

Já são function components declarados inline. Mover para arquivos separados.

- `ModalityCard` usa `motion.button` do framer-motion.
- `UnavailableModalityCard` usa `motion.div` + `AnimatePresence`.
- Ambos importam `styles` de `../../pages/RegistrationPage.module.css`.

#### 2.3 — `SuccessScreen` (linhas 861-916)

```tsx
interface SuccessScreenProps {
  participant: Participant;
  onDownloadPdf: () => void;
  onNewRegistration: () => void;
  onGoHome: () => void;
}
```

### Steps do wizard a extrair

O grande `renderStep()` (linhas 337-858) é um switch/case com 14 cases. Cada case deve se tornar um componente.

**Padrão geral de cada step:**

```tsx
interface StepProps {
  form: RegistrationFormData;
  onFieldChange: <K extends keyof RegistrationFormData>(key: K, value: RegistrationFormData[K]) => void;
  onNext: () => void;
  // Props específicas de cada step...
}
```

#### 2.4 — `DisclaimerStep` (cases 0, 1, 2)

Os 3 disclaimers têm estrutura idêntica: título, texto, checkbox, botão. Podem ser um único componente reutilizável:

```tsx
interface DisclaimerStepProps {
  title: string;
  content: React.ReactNode;
  checkboxLabel: string;
  buttonLabel: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onNext: () => void;
}
```

#### 2.5 — `ProfileStep` (case 3)

```tsx
interface ProfileStepProps {
  onSelectAdult: () => void;
  onSelectChild: () => void;
}
```

#### 2.6 — `TextInputStep` (cases 4, 5, 7)

Componente genérico para steps de input de texto (parentName, fullName, whatsapp):

```tsx
interface TextInputStepProps {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
  onNext: () => void;
  canProceed: boolean;
}
```

#### 2.7 — `DateInputStep` (case 6)

```tsx
interface DateInputStepProps {
  label: string;
  value: string;
  age: number | null;
  onChange: (value: string) => void;
  onNext: () => void;
}
```

#### 2.8 — `GenderStep` (case 8)

```tsx
interface GenderStepProps {
  label: string;
  onSelect: (gender: Gender) => void;
}
```

#### 2.9 — `MemberStep` (case 9)

```tsx
interface MemberStepProps {
  onSelect: (status: MembershipStatus) => void;
}
```

#### 2.10 — `HealthStep` (case 10)

```tsx
interface HealthStepProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSkip: () => void;
  onNext: () => void;
}
```

#### 2.11 — `PaymentDisclaimerStep` (case 11)

Este é um "step dentro de step" com 8 sub-telas. Pode ser um componente que gerencia seu próprio `paymentDisclaimerStep` interno:

```tsx
interface PaymentDisclaimerStepProps {
  subStep: number;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onNext: () => void;
}
```

- As constantes `PAYMENT_DISCLAIMER_TITLES` e `PAYMENT_DISCLAIMER_CHECKBOXES` ficam neste componente.

#### 2.12 — `ModalitiesStep` (case 12)

```tsx
interface ModalitiesStepProps {
  form: RegistrationFormData;
  age: number | null;
  availableMods: Modality[];
  unavailableMods: { modality: Modality; reasons: string[] }[];
  loadingModalities: boolean;
  modalitiesError: string | null;
  blockedModality: string | null;
  themeColor: string;
  onToggleModality: (modality: Modality) => void;
  onSetThemeColor: (color: string) => void;
  onDismissBlock: () => void;
  onNext: () => void;
}
```

#### 2.13 — `TermsStep` (case 13)

```tsx
interface TermsStepProps {
  isMember: MembershipStatus;
  termsStep: number;
  onTermsStepChange: (step: number) => void;
  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}
```

### Resultado final do RegistrationPage.tsx

```tsx
export default function RegistrationPage() {
  // State (form, currentStep, direction, etc.)
  // Helpers (goNext, goBack, setField)
  // Modality grouping (useMemo)
  // Confetti effect
  // if (registered) return <SuccessScreen />
  // return <ProgressBar /> + <AnimatePresence> + switch(currentStep) renderizando o step component
}
```

---

## Tarefa 3 — LandingPage (prioridade baixa)

O arquivo `LandingPage.tsx` tem 306 linhas — aceitável, mas pode ser mais limpo.

#### 3.1 — `Navbar` (linhas 95-105)

```tsx
interface NavbarProps {
  scrolled: boolean;
  onGoToRegistration: () => void;
}
```

- Logo, links (Sobre, Modalidades, Inscrição), botão CTA.
- Importa `logoImg` e usa classes do `LandingPage.css`.

#### 3.2 — `HeroSection` (linhas 108-162)

```tsx
interface HeroSectionProps {
  countdown: { d: string; h: string; m: string; s: string };
  tickerItems: string[];
  onGoToRegistration: () => void;
}
```

- Background elements, eyebrow, título, countdown, CTAs, scroll hint, ticker.

#### 3.3 — `AboutSection` (linhas 165-201)

Sem props necessárias (conteúdo estático). Importa as imagens de galeria diretamente.

#### 3.4 — `ModalitiesSection` (linhas 204-236)

```tsx
interface ModalitiesSectionProps {
  modalities: typeof modalities; // o array hardcoded
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}
```

- Pode internalizar o array `modalities` e `catLabels` já que são estáticos.

#### 3.5 — `RegistrationSteps` (linhas 239-281)

```tsx
interface RegistrationStepsProps {
  onGoToRegistration: () => void;
}
```

- Steps 1-4 + PIX box.

#### 3.6 — `Footer` (linhas 285-302)

```tsx
interface FooterProps {
  onGoToAdmin: () => void;
}
```

### Resultado final do LandingPage.tsx

```tsx
export default function LandingPage() {
  // State (scrolled, countdown, activeFilter)
  // Effects (scroll, IntersectionObserver, countdown timer)
  // return:
  //   <Navbar />
  //   <HeroSection />
  //   <AboutSection />
  //   <ModalitiesSection />
  //   <RegistrationSteps />
  //   <Footer />
}
```

---

## Helpers a extrair para `src/utils/`

Durante a componentização, mover estas funções utilitárias que são duplicadas ou reusáveis:

```tsx
// src/utils/age.ts (já existe parcialmente em hooks/useAge.ts)
export function calcAge(birthDate: string): number { ... }
export function isAgeOutOfRange(birthDate: string, modality: Modality): boolean { ... }

// src/utils/format.ts
export function formatDate(dateStr: string): string { ... }
export function ageLabel(minAge: number | null, maxAge: number | null): string { ... }
```

- `calcAge` existe em `AdminDashboard.tsx` (linha 333) E em `hooks/useAge.ts` (`calculateAge`). Unificar.
- `ageLabel` existe em `AdminDashboard.tsx` (linha 322) E em `RegistrationPage.tsx` (linha 309). Unificar.
- `formatDate` existe em `AdminDashboard.tsx` (linha 329). Mover para utils.

---

## Checklist de execução

```
[x] Tarefa 1 — AdminDashboard (1152 → 303 linhas)
    [x] 1.1 FeedbackToast → testes passando
    [x] 1.2 DeleteConfirmModal → testes passando
    [x] 1.3 EditParticipantModal → testes passando
    [x] 1.4 PrintLayout → testes passando
    [x] 1.5 Sidebar → testes passando
    [x] 1.6 ModalityGrid → testes passando
    [x] 1.7 StatsView → testes passando
    [x] 1.8 FinanceView → testes passando
    [x] 1.9 ParticipantsTable → testes passando

[x] Tarefa 2 — RegistrationPage (956 → 377 linhas)
    [x] 2.1 ProgressBar → testes passando
    [x] 2.2 ModalityCard + UnavailableModalityCard → testes passando
    [x] 2.3 SuccessScreen → testes passando
    [x] 2.4-2.13 Steps do wizard (DisclaimerStep, ProfileStep, TextInputStep,
        DateInputStep, GenderStep, MemberStep, HealthStep, PaymentDisclaimerStep,
        ModalitiesStep, TermsStep) → testes passando

[x] Tarefa 3 — LandingPage (306 → 59 linhas)
    [x] 3.1 Navbar → testes passando
    [x] 3.2 HeroSection → testes passando
    [x] 3.3 AboutSection → testes passando
    [x] 3.4 ModalitiesSection → testes passando
    [x] 3.5 RegistrationSteps → testes passando
    [x] 3.6 Footer → testes passando

[x] Extrair helpers para utils/ (age.ts, format.ts) → testes passando
[x] Tipos admin adicionados a types/index.ts

[x] Verificação final: npm run test:run — 39/39 testes passando
[ ] Verificação visual no browser (npm run dev, navegar por todas as páginas)
```
