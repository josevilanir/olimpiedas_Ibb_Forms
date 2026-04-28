# 🏆 Olimpíadas IBB — Sistema de Inscrições

Plataforma web desenvolvida para gerenciar as inscrições das **Olimpíadas da Igreja Batista de Bonsucesso (IBB) — Natal/RN**. O sistema permite que participantes se inscrevam nas modalidades do evento e que administradores acompanhem, editem e exportem os dados dos inscritos.

---

## 🎯 Propósito

As Olimpíadas IBB reúnem membros e convidados da igreja em diversas modalidades esportivas e recreativas. Este sistema substitui planilhas e formulários manuais, oferecendo:

- Um formulário inteligente e guiado para os participantes
- Um painel administrativo seguro para a equipe organizadora
- Controle de elegibilidade por faixa etária e vínculo com a IBB
- Exportação de listas organizadas para os coordenadores de cada modalidade

---

## ✨ Funcionalidades

### Para participantes (público geral)
- Formulário com **revelação progressiva** — cada pergunta aparece somente após a anterior ser respondida
- **Cálculo de idade automático** ao informar a data de nascimento
- Modalidades exibidas em grupos: disponíveis, restritas por idade, restritas por membro
- Validação de elegibilidade em tempo real (idade + vínculo IBB)
- Avisos de pagamento com **checkboxes em cascata** para garantir a leitura
- Texto dinâmico para não-membros com o contato direto da responsável pelo PIX
- **Comprovante de inscrição em PDF** gerado no navegador

### Para administradores
- Tela de login protegida por JWT
- Dashboard com todas as modalidades e contagem de inscritos
- Visualização detalhada dos inscritos por modalidade
- Edição e remoção de inscrições
- **Painel de estatísticas** com gráficos: total de inscritos, faixas etárias, distribuição por sexo, membro IBB e modalidade
- **Exportação em Excel (.xlsx)** por modalidade ou geral, com nome, idade, sexo e WhatsApp

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Estilização** | Vanilla CSS (CSS Modules + Design System com variáveis) |
| **Backend** | Node.js + Express 5 + TypeScript |
| **ORM** | Prisma 7 + `@prisma/adapter-pg` |
| **Banco de dados** | PostgreSQL (NeonDB serverless) |
| **Autenticação** | JWT + bcryptjs |
| **PDF** | jsPDF |
| **Excel** | ExcelJS |
| **Testes** | Jest + ts-jest + Supertest |
| **Deploy (alvo)** | Vercel (frontend) · Fly.io (backend) · NeonDB (banco) |

---

## 🗂️ Estrutura do Projeto

```
Olimpiedas_Ibb/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos: User, Modality, Participant, Subscription
│   │   ├── seed.ts              # Pré-cadastro de modalidades e admin
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/         # Camada HTTP
│   │   ├── services/            # Regras de negócio
│   │   ├── routes/              # Definição de rotas
│   │   ├── middlewares/         # Auth JWT
│   │   ├── utils/age.ts         # Cálculo de idade e elegibilidade
│   │   └── lib/prisma.ts        # Instância singleton do Prisma
│   └── src/__tests__/           # Testes unitários e de integração
├── frontend/
│   └── src/
│       ├── pages/               # RegistrationPage, LoginPage, AdminDashboard
│       ├── hooks/               # useModalities, useAge, useAuth
│       ├── services/api.ts      # Chamadas à API tipadas
│       ├── types/               # Tipos compartilhados
│       └── utils/generatePdf.ts
└── tasks/                       # Plano de implementação e progresso
```

---

## 🚀 Rodando localmente

### Pré-requisitos
- Node.js 18+
- Conta no [NeonDB](https://neon.tech) com um banco PostgreSQL criado

### 1. Clone e configure o ambiente

```bash
# Backend
cd backend
cp .env.example .env
# Preencha DATABASE_URL com a connection string do NeonDB
```

```bash
# Frontend
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api/v1 (já é o padrão)
```

### 2. Instale as dependências

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Configure o banco de dados

```bash
cd backend

# Gera o cliente Prisma
npm run prisma:generate

# Aplica o schema no banco
npm run prisma:migrate

# Popula com as modalidades e o usuário admin
npm run prisma:seed
```

### 4. Suba os servidores

```bash
# Terminal 1 — Backend (porta 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend && npm run dev
```

Acesse `http://localhost:5173` para o formulário público.
O painel admin está disponível pelo botão "Acesso Admin" no rodapé.

**Credenciais admin padrão:**
- Email: `admin@ibb.com`
- Senha: `admin123`

---

## 🧪 Testes

```bash
cd backend && npm test
```

20 testes automatizados:
- **12 unitários** — cálculo de idade e elegibilidade por faixa etária e membresia
- **8 de integração** — rotas de inscrição, autenticação e proteção JWT

---

## 📋 Regras de Negócio

### Modalidades
| Categoria | Faixa etária | Restrição |
|---|---|---|
| Corrida / Caminhada | Livre | Aberta (não-membros permitidos) |
| Esportes coletivos | 14+ anos | Membros IBB/GR |
| Tênis de Mesa, Xadrez, Pebolim, etc. | 10+ anos | Membros IBB/GR |
| Modalidades Kids | 3–9 anos | Membros IBB/GR |

### Inscrições
- Individuais — sem limite de vagas por modalidade
- Confirmação automática no envio
- Pagamento via PIX para `eventosibbnatal@gmail.com`
- Taxa: **R$ 15,09 por pessoa** (isento até 8 anos)
- Administradores podem editar ou remover inscrições pelo painel

---

## 📦 Deploy

| Serviço | Plataforma | Comando de build |
|---|---|---|
| Frontend | Vercel | `npm run build` |
| Backend | Fly.io | `npm run build` → `node dist/server.js` |
| Banco | NeonDB | — (serverless, sem configuração adicional) |

Variáveis de ambiente necessárias em produção:

**Backend (Fly.io):**
```
DATABASE_URL=...
JWT_SECRET=...
PORT=3001
```

**Frontend (Vercel):**
```
VITE_API_URL=https://<seu-app>.fly.dev/api/v1
```
