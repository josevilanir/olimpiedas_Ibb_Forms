# Planejamento de Implementação - Fase 2

Este documento descreve as tarefas para a próxima fase de desenvolvimento do projeto Olimpíadas IBB.

## 1. Atualização do Comprovante de Inscrição (PDF)
**Objetivo:** Adicionar uma mensagem de suporte no PDF gerado.
- **Arquivo:** `frontend/src/utils/generatePdf.ts`
- **Ação:** No array `avisos` (ou em uma nova seção de rodapé), adicionar o texto: 
  > "DÚVIDAS FALE COM SAMUCA PELO WHATSAPP 84 99921-5999"
- **Detalhe:** Garantir que o texto esteja visível e formatado de acordo com o estilo do documento.

## 2. Cadastro e Exibição de Coordenadores
**Objetivo:** Vincular coordenadores às modalidades e exibi-los no site.

### 2.1. Backend (Dados)
- **Arquivo:** `backend/prisma/seed.ts`
- **Ação:** Atualizar o array `modalities` com os nomes dos coordenadores fornecidos.
- **Lista de Coordenadores:**
  - Treino Funcional: Jonatas Silveira (Jow)
  - Queimada: Jonatas Silveira (Jow)
  - Circuito Adulto: Fran Missionário
  - Circuito Kids: Fran Missionário
  - Basquete: Jonatas Silveira (Jow)
  - Natação: Jonatas Silveira (Jow)
  - Futsal: Jonatas Silveira (Jow)
  - Futsal Pré Teens: Jonatas Silveira (Jow)
  - Volei de Quadra: Daniel César
  - Tenis de Mesa: Lucas Santos
  - Corrida Longa 5km: Emicarlo Souza e Carlos Mora
  - Corrida Curta Adulta: Emicarlo Souza e Carlos Mora
  - Corrida Curta Pré Teens: Emicarlo Souza e Carlos Mora
  - Corrida Curta Kids: Emicarlo Souza e Carlos Mora
  - Caminhada: Emicarlo Souza e Carlos Mora
  - E-sports (FIFA, CS, LoL): Gustavo Felipe e Davi Severiano
- **Comando:** Executar `npm run seed` no diretório `backend` após a alteração.

### 2.2. Frontend (Landing Page)
- **Arquivo:** `frontend/src/pages/LandingPage.tsx`
- **Ação:** Na seção de modalidades (ou cards), exibir o nome do coordenador responsável por cada uma.

### 2.3. Frontend (Formulário de Inscrição)
- **Arquivo:** `frontend/src/pages/RegistrationPage.tsx`
- **Ação:** Ao selecionar uma modalidade, mostrar dinamicamente o nome do coordenador responsável.

## 3. Melhorias Estéticas e de UX

### 3.1. Tema da Landing Page
- **Arquivos:** `frontend/src/pages/LandingPage.tsx` e `LandingPage.css`
- **Ação:** Estender o tema visual (background e textura) do início da página para todas as outras seções.
- **Importante:** Garantir que o contraste e a legibilidade dos elementos não sejam prejudicados.

### 3.2. Tema da Área Administrativa
- **Arquivos:** `frontend/src/pages/AdminDashboard.tsx` e `AdminDashboard.module.css`
- **Ação:** Aplicar a identidade visual do projeto (cores, fontes, sombras) na área administrativa, mantendo a simplicidade e funcionalidade.

## 4. Dashboards Administrativos (Gráficos)
**Objetivo:** Tornar a visualização de dados mais dinâmica e profissional.
- **Tecnologia Sugerida:** Instalar e usar a biblioteca `recharts` ou similar.
- **Ações:**
  - Substituir as barras de progresso simples por gráficos de pizza (Pie Charts) para Gênero e Vínculo (Membro/Não Membro).
  - Criar um gráfico de barras interativo para inscritos por modalidade.
  - Adicionar tooltips e animações aos gráficos.

---
**Observação para o Agente:** Antes de iniciar, verifique se os serviços (backend e frontend) estão rodando e se o banco de dados está sincronizado com o Prisma.
