# Plano de Implementação: Melhorias Interface Admin

Este documento detalha as etapas para implementar o backlog de melhorias do painel administrativo das Olimpíadas IBB.

## 🏗️ Fase 1: Evolução do Banco de Dados & Backend

### 1.1 Atualização do Schema (Prisma)
- [ ] No arquivo `backend/prisma/schema.prisma`, adicione o campo `paymentStatus` ao model `Participant`.
  - Criar um enum `PaymentStatus` com os valores `PENDENTE` e `PAGO`.
- [ ] Adicione o campo `maxSpots` (Int, opcional) ao model `Modality`.
- [ ] Execute a migração: `npx prisma migrate dev --name add_payment_and_spots`.

### 1.2 Atualização de Serviços e Rotas
- [ ] Atualizar `updateParticipant` em `backend/src/services/admin.service.ts` para permitir a atualização de `paymentStatus`, `gender`, `isMember` e `birthDate`.
- [ ] Garantir que a troca de `modalityIds` via `updateParticipant` esteja funcionando corretamente (removendo inscrições antigas e criando novas).
- [ ] Atualizar o serviço de estatísticas (`stats.service.ts`) para incluir a contagem de vagas ocupadas vs. totais.

---

## 🎨 Fase 2: Frontend - Estrutura e Dados

### 2.1 Tipagem
- [ ] Atualizar `frontend/src/types/index.ts` para refletir os novos campos (`paymentStatus`, `maxSpots`).

### 2.2 Melhoria no Serviço de API
- [ ] Garantir que as funções `api.admin.updateParticipant` no frontend suportem o envio dos novos campos.

---

## 🖥️ Fase 3: Frontend - Funcionalidades da Tabela

### 3.1 Busca e Filtros
- [ ] Implementar uma barra de busca no topo da visão de participantes que filtre a lista localmente por nome.
- [ ] Adicionar lógica de "Alerta de Idade": exibir um ícone ⚠️ ao lado do nome se `calcAge(p.birthDate)` estiver fora do range da modalidade selecionada.

### 3.2 Edição Avançada (Modal)
- [ ] Expandir o modal de edição em `AdminDashboard.tsx` para incluir:
  - Select para **Sexo**.
  - Select para **Vínculo IBB** (SIM, GR, NAO).
  - Input para **Data de Nascimento** (type="date").
  - Seletor de **Modalidade** (Permitir trocar a modalidade do inscrito).

### 3.3 Ações Rápidas
- [ ] Adicionar um botão de toggle/check na linha do participante para confirmar o **Status de Pagamento** sem abrir o modal.

---

## 📊 Fase 4: Frontend - Dashboards e Gráficos

### 4.1 Filtros Dinâmicos
- [ ] Adicionar um seletor (dropdown) no dashboard principal: "Filtrar por Vínculo" (Todos, Membros, GR, Não Membros).
- [ ] Ao selecionar, os gráficos de "Gênero", "Faixas Etárias" e "Modalidades" devem refletir apenas os dados desse grupo.

### 4.2 Ajustes Recharts
- [ ] **Modality Chart:** Inverter o layout de horizontal para vertical (bars pointing up).
- [ ] **Pie Chart Overlap:** No gráfico de "Vínculo IBB", ajustar as propriedades `minAngle` ou mover as labels para fora do gráfico usando `labelLine` para evitar sobreposição de textos em fatias de 0% ou 100%.

---

## 🖨️ Fase 5: Modo de Impressão e UX

### 5.1 Lista de Chamada
- [ ] Criar um botão "Versão para Impressão" que abre uma nova aba ou aplica um CSS `@media print`.
- [ ] O layout de impressão deve ser uma tabela simples P&B: Nome, Vínculo, WhatsApp e um campo vazio para "Assinatura/Obs".

---

## ⚠️ Regras Cruciais (Baseadas no CLAUDE.md)
1. **Simplicidade**: Não instale bibliotecas novas sem necessidade. Use o que já temos (Recharts, Framer Motion).
2. **Prisma First**: Toda mudança de dado deve começar pelo schema e migração.
3. **Feedback Visual**: Garanta que o usuário veja um "Toast" ou mensagem de sucesso ao confirmar pagamentos ou trocar modalidades.
