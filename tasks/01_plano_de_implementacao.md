# Plano de Implementação: Olimpíadas IBB

Este documento descreve o plano inicial e o levantamento de requisitos para o sistema de gerenciamento das Olimpíadas da Igreja (Olimpíadas IBB). O objetivo é validar o entendimento do projeto e tomar decisões arquiteturais e de negócio antes de iniciarmos o desenvolvimento.

## Visão Geral

Uma plataforma web que permite:

1. **Participantes (Membros da Igreja):** Visualizar os eventos/modalidades disponíveis (pré-cadastrados no banco) e submeter o formulário de inscrição individual de forma dinâmica, sem necessidade de login.
2. **Administradores:** Acessar um dashboard seguro (via login) para visualizar todas as modalidades e conferir os detalhes dos inscritos para controle e consulta.

## Arquitetura Proposta (Tech Stack)

Conforme solicitado, a stack será dividida em:

- **Frontend:** React com TypeScript.
  - _Sugestão:_ Utilizar o **Vite** para inicialização rápida e excelente performance de desenvolvimento.
  - _Estilização:_ CSS Puro (Vanilla CSS) com variáveis e design system moderno para garantir uma interface premium e dinâmica, conforme as melhores práticas.
- **Backend:** Node.js.
  - _Sugestão:_ **Express.js** com TypeScript.
  - _ORM (Object-Relational Mapping):_ **Prisma ORM** pela excelente integração e tipagem estática com TypeScript.
- **Banco de Dados:** PostgreSQL.

_Estrutura de Pastas (Sugestão - Monorepo simples):_
No diretório do projeto, criaremos duas pastas principais: `/frontend` e `/backend`.

## Perguntas Abertas (Requisitos de Negócio)

Para modelarmos o banco de dados e as telas corretamente, precisamos definir algumas regras de negócio:

**1. Autenticação e Perfis:** [RESOLVIDO]

- **Participantes:** Nenhum login necessário. Preenchem o formulário que envia os dados diretamente para o banco.
- **Administrador:** Acesso via login para visualizar o dashboard com todas as modalidades e inscritos.
- **Eventos/Modalidades:** Serão pré-cadastrados diretamente no banco de dados (não haverá tela de criação de modalidades no MVP).

**2. Regras de Inscrição:** [RESOLVIDO]

- **Tipo:** As inscrições serão estritamente individuais.
- **Limites por Membro:** O participante pode se inscrever em mais de uma modalidade, desde que atenda aos limites de idade/critérios de cada uma.
- **Aprovação:** A inscrição é confirmada automaticamente no momento do envio. O Admin, no entanto, terá o poder de remover ou editar as inscrições pelo dashboard.
- **Vagas:** As modalidades não possuem limite máximo de vagas (sem lista de espera).

**3. Estrutura e Infraestrutura:** [RESOLVIDO]

- ✅ Monorepo (pastas `/frontend` e `/backend`).
- ✅ Prisma ORM para comunicação com PostgreSQL.

**4. Design e Identidade Visual:**

- Aguardando definição de logo e paleta de cores da IBB (podemos iniciar com um design moderno genérico e ajustar depois).

**5. Perguntas Estratégicas / Regras Definidas:** [RESOLVIDO]

- **Membresia e Modalidades Gerais:** "Corrida" e "Caminhada" são gerais (Livre para qualquer idade e abertas para NÃO membros). Todas as demais modalidades são exclusivas para Membros da IBB (ou membros de GR) e possuem restrições de idade.
- **Categorias e Limites de Idade:** Definidas através das modalidades (ex: Kids 3-9, Pré Teens 10-13, Adulto 14+, Livre).
- **Dados Médicos e Emergência:** O formulário coleta problemas de saúde e contato de emergência.
- **Taxa de Inscrição:** R$ 15,09 por pessoa (isento para crianças até 8 anos). Pagamento via PIX externo com envio de comprovante via WhatsApp.

**6. Campos e Validações do Formulário Dinâmico:** [RESOLVIDO]

O formulário terá um fluxo dinâmico inteligente:
1. **Perfis (Adulto vs Filho):** A primeira pergunta divide o fluxo de coleta de dados.
2. **Cálculo de Idade:** Após preencher a Data de Nascimento, o sistema calcula a idade.
3. **Exibição Inteligente:** A lista de modalidades será ordenada, mostrando primeiro (no topo) aquelas em que o participante se enquadra (idade + vínculo IBB). Junto ao nome da modalidade, será exibido o **nome do Coordenador** responsável por ela.
4. **Validação (Pop-up):** Se o usuário tentar selecionar uma modalidade para a qual não tem a idade permitida (ou restrição de membro), um pop-up de aviso bloqueará a seleção.
5. **Aceite de Termos (Disclaimers):** Todos os avisos da igreja (sobre taxa de inscrição, envio de PIX, camiseta não inclusa, etc.) aparecerão de forma progressiva. O usuário deverá marcar uma **checkbox obrigatória** ("Estou ciente e desejo prosseguir") para provar que leu antes de conseguir finalizar a inscrição.

## User Review Required

> [!IMPORTANT]
> O Levantamento de Requisitos e o Plano de Implementação estão **concluídos**. Por favor, revise a estrutura proposta do Banco de Dados abaixo. Se estiver tudo de acordo, **autorize o início do desenvolvimento** para criarmos a lista de tarefas (`task.md`) e começarmos pelo Backend.

## Estrutura do Banco de Dados (Draft)

- **`User` (Admin):** `id`, `email`, `password`, `name`.
- **`Modality`:** `id`, `name`, `min_age`, `max_age`, `requires_membership` (boolean: Corrida/Caminhada = false, Restantes = true), `coordinator_name` (Nome do responsável físico da modalidade).
- **`Participant`:** 
  - `id`, `is_for_child` (boolean)
  - `is_member` (enum: SIM, NAO, GR)
  - `birth_date`
  - `full_name` (Nome do adulto ou da criança)
  - `parent_name` (Apenas se `is_for_child` = true)
  - `whatsapp` (Do adulto ou do responsável)
  - `gender` (Masculino, Feminino)
  - `health_issues` (Problemas e contato de emergência)
  - `terms_accepted` (boolean: Obrigatório para confirmar ciência dos avisos)
  - `created_at`
- **`Subscription`:** Tabela de relacionamento (N:N) entre `Participant` e `Modality`.

## Funcionalidades Iniciais (MVP)

### Para Participantes Comuns

- Tela pública de listagem de eventos/modalidades (dinâmicos, vindos do banco de dados).
- Formulário de inscrição individual (sem login).
- Tela de confirmação de inscrição bem elaborada (feedback visual de sucesso).
- **Geração de Comprovante em PDF:** Opção para o usuário gerar e baixar um comprovante em PDF assim que finalizar a inscrição.

### Para Administradores

- Tela de login protegida para Admins.
- Dashboard interno mostrando todas as modalidades disponíveis.
- Listagem e visualização de detalhes de todos os inscritos separados por modalidade.
- Capacidade de excluir ou editar as informações de uma inscrição existente.
- **Exportação para Excel/Planilha:** Funcionalidade para gerar e baixar um arquivo de planilha organizada com os dados dos inscritos de cada modalidade.

## Qualidade e Testes (Obrigatório)

O desenvolvimento deverá ser guiado por testes para garantir a segurança das regras de negócio:
- **Testes Unitários:** Para a lógica de cálculo de idade, priorização de modalidades e validações de campos.
- **Testes de Integração:** Para as rotas da API, garantindo que usuários que não preencham os requisitos sejam rejeitados.
- **Barreira de Execução:** O deploy e o prosseguimento das tarefas só ocorrerão se 100% dos testes forem aprovados com sucesso.

## Infraestrutura e Deploy (Decidido)

A stack de deploy definida para suportar a carga esperada (300 a 400 usuários) de forma performática e com custo otimizado (potencialmente zero) é:

- **Frontend:** Hospedado na **Vercel** (garante CDN global, build automatizado e alta performance para o React/Vite).
- **Backend:** Hospedado no **Fly.io** (ideal para rodar a API Node.js/Express próxima aos usuários, com excelente suporte à concorrência).
- **Banco de Dados:** Hospedado no **NeonDB** (PostgreSQL Serverless, que "dorme" quando ocioso para economizar recursos e tem integração nativa com o Prisma ORM).
