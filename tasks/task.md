# Lista de Tarefas: Olimpíadas IBB

Este documento serve como guia de execução para o desenvolvimento do projeto Olimpíadas IBB. O agente executor deverá marcar as tarefas com `[x]` à medida que forem sendo concluídas e atualizar o arquivo com `[/]` nas tarefas em progresso.

Todas as implementações devem seguir rigorosamente as regras de negócios e a arquitetura descritas em `tasks/01_plano_de_implementacao.md` e nos arquivos de formulário base.

## Fase 1: Setup da Infraestrutura e Monorepo
- [x] Inicializar o diretório `/backend` com Node.js + TypeScript.
- [x] Instalar e configurar Express, Cors e Dotenv no `/backend`.
- [x] Inicializar o diretório `/frontend` com React + TypeScript (Vite).
- [x] Configurar a estilização (Vanilla CSS com variáveis/Design System) no `/frontend`.

## Fase 2: Banco de Dados e Prisma ORM (Backend)
- [x] Configurar o Prisma ORM no `/backend` (`npx prisma init`).
- [x] Criar o schema no banco de dados PostgreSQL (Tabelas: `User`, `Modality`, `Participant`, `Subscription`).
- [x] Implementar a constraint do campo `requires_membership` e `coordinator_name` na tabela `Modality`.
- [x] Adicionar o campo booleano `terms_accepted` na tabela `Participant`.
- [x] Gerar as migrações do Prisma (`npx prisma migrate dev`). — Migration `20260427234804_primeira_migration` aplicada no NeonDB.
- [x] Criar um script de "Seed" para pré-cadastrar as modalidades listadas no plano de implementação (incluindo as idades mínimas/máximas, status de exclusividade e coordenadores).

## Fase 3: Desenvolvimento da API (Backend)
- [x] **Modalidades:** Criar rota `GET /modalities` para listar todas as modalidades.
- [x] **Inscrições:** Criar rota `POST /participants` para receber o formulário (salvar dados em `Participant` e criar vínculos em `Subscription`).
- [x] **Autenticação Admin:** Criar rota `POST /admin/login` gerando token JWT.
- [x] **Dashboard Admin:** Criar rotas protegidas (JWT) para:
  - [x] `GET /admin/participants` (listar inscritos filtrados por modalidade).
  - [x] `DELETE /admin/participants/:id` (remover inscrição).
  - [x] `PUT /admin/participants/:id` (editar inscrição).
- [x] **Exportação Excel:** Criar rota para gerar e exportar a lista de participantes de uma modalidade específica para formato `.xlsx`.

## Fase 4: Frontend - Formulário Dinâmico (Participantes)
- [x] **Setup Inicial:** Criar layout base responsivo com design premium.
- [x] **Fluxo Inicial:** Tela de escolha de Perfil ("Para mim" ou "Para meu filho(a)").
- [x] **Formulário - Dados Pessoais:** Criar inputs para Nome, Data de Nascimento, WhatsApp, Sexo e Vínculo IBB.
- [x] **Lógica de Idade:** Implementar o cálculo automático da idade a partir da Data de Nascimento inserida.
- [x] **Formulário - Dados Médicos:** Inputs para Problemas de saúde e Contato de emergência.
- [x] **Exibição Inteligente de Modalidades:** 
  - [x] Consumir a API `GET /modalities`.
  - [x] Filtrar e ordenar a exibição priorizando aquelas que correspondem à idade calculada e ao Vínculo IBB selecionado.
  - [x] Mostrar o nome do Coordenador junto com o nome da modalidade.
- [x] **Validação Pop-up:** Criar o alerta impeditivo caso o usuário tente selecionar uma modalidade que fuja da sua faixa etária ou regra de membro.
- [x] **Disclaimers (Avisos):** Criar a seção progressiva de leitura de termos (Taxa, PIX, Camiseta) com o Checkbox obrigatório `terms_accepted`.
- [x] **Submissão:** Integrar com a rota `POST /participants` com feedback visual de carregamento.
- [x] **Sucesso e Comprovante:** 
  - [x] Tela de confirmação.
  - [x] Botão para gerar e baixar o **Comprovante de Inscrição em PDF**.

## Fase 5: Testes Automatizados (Critério de Bloqueio)
- [x] Configurar framework de testes (Jest) no Backend.
- [x] **Testes de Regras de Negócio:** 12 testes unitários para cálculo de idade e elegibilidade — 100% passando.
- [x] **Testes de Integração:** 8 testes de integração validando rotas e regras de negócio — 100% passando.
- [x] **VALIDE AQUI (REGRA DO AGENTE):** 20/20 testes passando (12 unitários + 8 integração). ✅

## Fase 6: Frontend - Dashboard Administrativo
- [x] **Login:** Tela de autenticação exclusiva para Admin, salvando token localmente.
- [x] **Dashboard Principal:** Interface listando todas as modalidades em formato de cards.
- [x] **Lista de Inscritos:** Ao clicar em uma modalidade, visualizar a tabela com todos os dados dos participantes.
- [x] **Ações de Edição/Remoção:** Botões e modals para permitir o Admin excluir ou corrigir erros na inscrição.
- [x] **Exportação:** Botão "Baixar Planilha Excel" na visualização da modalidade, chamando a API de exportação.

## Regras de Negócio Adicionais (27/04/2026)
- [x] Progressive reveal: cada pergunta aparece só após a anterior ser respondida
- [x] Exibição imediata e destacada da idade após digitar data de nascimento
- [x] "Li e entendi tudo" como checkbox em cada bloco de aviso
- [x] Checkboxes PIX em cascata: (1) taxa/PIX → (2) email eventosibbnatal@gmail.com → (3) só comprovante para Nanda → (4) camiseta
- [x] Modalidades agrupadas: elegíveis no topo / "não permitidas pela idade" / "somente para Membros IBB"
- [x] Texto do PIX dinâmico: não-membros veem "(84) 99647-9320" em vez do grupo WhatsApp
- [x] Admin: painel de estatísticas com gráficos (totais, faixas etárias, por modalidade, sexo, membro)
- [x] Exportação por modalidade com idade calculada (não mais data de nascimento)

## Fase 7: Revisão e Deploy
- [ ] **Homologação E2E:** Testar os formulários para casos práticos de preenchimento (simulação de fluxo de usuário).
- [x] **Deploy Banco:** NeonDB configurado e migration aplicada com sucesso.
- [ ] **Deploy Backend:** Configurar ambiente e deploy no Fly.io.
- [ ] **Deploy Frontend:** Configurar chamadas de API baseadas em variáveis de ambiente e deploy na Vercel.
