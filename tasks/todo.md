# Homologação Parte 1 — Backend + Admin Dashboard

## 1. SEED
- [x] 1.1 Faixas etárias: Pré Teens minAge 10→9, Kids maxAge 9→8, Circuito Kids minAge 8→9
- [x] 1.2 requiresMembership false: Corrida Curta Adulta, Pré Teens, Kids
- [x] 1.3 Treino Funcional requiresMembership false→true

## 2. Export Service + Rotas
- [x] 2.1 exportFinanceToExcel em export.service.ts
- [x] 2.2 exportFinance controller em admin.controller.ts
- [x] 2.3 rota /export-finance em admin.routes.ts

## 3. AdminDashboard.tsx
- [x] 3.1 Sort states + handleSort + sortIndicator + getSortedParticipants
- [x] 3.2 filteredParticipants usa getSortedParticipants
- [x] 3.3 Cabeçalhos de tabela clicáveis
- [x] 3.4 handleExportFinance function
- [x] 3.5 printLayout com logo preta + coluna Idade + filteredParticipants
- [x] 3.6 Stats: trocar "Exportar tudo (Excel)" por "Imprimir Gráficos"
- [x] 3.7 Finance: financeInfo block (PIX + valor por inscrição)
- [x] 3.8 Finance: botão exportar chama handleExportFinance
- [x] 3.9 Renomear "Receita Realizada" → "Entradas Confirmadas"

## 4. AdminDashboard.module.css
- [x] 4.1 sidebarLogo height 200px → 260px
- [x] 4.2 Novos estilos: printHeader, printLogo, financeInfo, @media print
- [x] 4.3 Cursor pointer nos th ordenáveis + chartSection break-inside

## 5. LoginPage.module.css
- [x] 5.1 logoImg height 300px → 390px

## Verificação Final
- [x] npx tsc --noEmit no backend — OK
- [x] npm run build no frontend — OK (sem erros de tipo ou build)
