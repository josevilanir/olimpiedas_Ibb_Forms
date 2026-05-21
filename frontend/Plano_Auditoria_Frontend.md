# Plano de Auditoria e Otimização do Frontend (Pré-Lançamento)

Este documento foi criado para orientar a execução detalhada de uma auditoria completa no projeto Frontend. O objetivo é remover o máximo de "peso" do código, otimizando elementos, removendo dependências não utilizadas e garantindo a melhor performance para o lançamento que ocorrerá em 2 dias.

## 1. Auditoria de Dependências e Imports
- [x] **Identificação de dependências não utilizadas:** `npx depcheck` apontou `date-fns` e `@testing-library/user-event` como não usadas — ambas removidas via `npm uninstall`.
- [x] **Limpeza de Imports:** `tsc` com `noUnusedLocals`/`noUnusedParameters` passou limpo. Encontrado e removido: `src/components/ui/button.tsx` (órfão completo, junto com a pasta `ui/`) e a função exportada `isEligible` em `src/hooks/useAge.ts` (sem consumidores).
- [x] **Atualização de pacotes:** `npm update` aplicou apenas releases minor/patch dentro dos ranges semver existentes (react, react-router, framer-motion, vite, vitest, lucide-react, @types/react, @vitejs/plugin-react). Nenhum major upgrade.

## 2. Remoção de Código Morto (Dead Code Elimination)
- [x] **Componentes Orfãos:** removido `components/ui/button.tsx` + pasta `ui/`. Removida fonte morta `src/assets/fonts/Owners_XWide.otf` (80 KB) e a pasta `fonts/`.
- [x] **Variáveis não utilizadas:** `tsc --noEmit` passa sem erros. `isEligible` exportada órfã removida.
- [x] **Console e Debug:** varredura encontrou apenas `console.error("[ErrorBoundary]", …)` em `ErrorBoundary.tsx` — legítimo (captura de runtime em produção). Nenhum `debugger`.

## 3. Otimização de Performance e Bundle
- [x] **Lazy Loading:** `AdminDashboard` e `LoginPage` agora carregam via `React.lazy()` + `Suspense` em `App.tsx`. O fallback é um loader mínimo (sem dependência externa). `jspdf` agora é carregado via `dynamic import` dentro do clique do botão "Baixar PDF" em `SuccessScreen.tsx`.
- [x] **Análise do Bundle:** `rollup-plugin-visualizer` adicionado em `vite.config.ts` com flag `ANALYZE=true` (rodar `ANALYZE=true npm run build` gera `dist/stats.html`). Code splitting funcionando: AdminDashboard ~400 kB (recharts incluso), generatePdf ~401 kB (jspdf+html2canvas), LoginPage ~1.8 kB — todos fora do bundle inicial.
- [x] **Otimização do framer-motion:** imports já nomeados (tree-shakeable). `HeroSection` e demais componentes usam `whileInView` + `viewport={{ amount: 0.1 }}` — só animam quando visíveis. Refactor para `LazyMotion` foi avaliado e descartado por risco vs. ganho marginal a 2 dias do lançamento.

## 4. Otimização de Assets (Imagens, CSS e Fontes)
- [x] **Imagens:** instalado `sharp` como devDep e criado `scripts/optimize-images.mjs`. Reduções no build:
  - `background.png`: 2.4 MB → 381 KB (-84%)
  - `kids.png`: 2.4 MB → 655 KB (-73%)
  - `texture.png`: 1.1 MB → 260 KB (-76%)
  - `hero-bg.png`: 288 KB → 55 KB (-81%)
  - `logibb.png`: 101 KB → 7.6 KB (-92%)
  - `olimpiedas_logo.png`: 48 KB → 6.2 KB (-87%)
  - `favicon.png`: 99 KB → 3.6 KB (-96%)
  - galeria (Corrida/Natacao/queimada/volei): -5 a -19%
  - **Total: ~5 MB economizados em assets**
- [x] **Estilos:** Tailwind não está em uso. CSS revisado por meio do build de produção (CSS final: ~76 KB gzip ~16 KB).
- [x] **Fontes:** removidas `Inter` e `Outfit` do `<link>` Google Fonts no `index.html` (carregadas mas nunca referenciadas em CSS). Removido weight italic `1,800` de Barlow Condensed (não usado). Mantidos: Barlow + Barlow Condensed com seus pesos efetivamente usados. Fonte `Owners_XWide.otf` (órfã, 80 KB) deletada.

## 5. Checklist Final de Lançamento
- [x] **Modo Estrito:** `npm run test:run` — 4 arquivos / 39 testes / 100% verde.
- [x] **Tipagem TypeScript:** `npm run build` (tsc + vite build) passa limpo, build em ~500 ms.
- [x] **Segurança e .env:** `.env` continha apenas `VITE_API_URL` (público por design). Reforçado o `.gitignore` do frontend para incluir `.env`, `.env.local`, `.env.*.local` (excluindo `.env.example`). Nenhum secret, token ou key hardcoded encontrado em `vite.config.ts` ou no client code.

---
## Resumo das Mudanças

**Arquivos modificados:**
- `package.json` (removidas `date-fns`, `@testing-library/user-event`; adicionadas `sharp`, `rollup-plugin-visualizer` em devDeps)
- `vite.config.ts` (bundle visualizer com flag ANALYZE)
- `src/App.tsx` (lazy loading + Suspense para Admin/Login)
- `src/components/registration/SuccessScreen.tsx` (dynamic import jspdf)
- `src/hooks/useAge.ts` (removida `isEligible` órfã)
- `index.html` (removidas fontes Inter, Outfit, italic 800)
- `.gitignore` (proteção .env)

**Arquivos removidos:**
- `src/components/ui/button.tsx` + pasta `ui/`
- `src/assets/fonts/Owners_XWide.otf` + pasta `fonts/`

**Arquivos novos:**
- `scripts/optimize-images.mjs`

**Assets:** ~5 MB economizados via recompressão in-place.
