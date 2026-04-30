# Plano de Implementação: Roteamento por URL (React Router)

## Contexto do Problema

O `App.tsx` atual controla toda a navegação via `useState<AppView>` — a URL permanece fixa em `http://localhost:5173/` independente da tela exibida (Landing, Formulário, Login Admin ou Dashboard Admin).

**Impacto:**
- Sem deep-link — impossível compartilhar URL direta para `/inscricao` ou `/admin`.
- Botão "voltar" do navegador não funciona.
- Sem histórico de navegação — UX inadequada para homologação/produção.

**Solução:** Introduzir `react-router` (v7) com rotas reais e contexto de autenticação global.

---

## Mapa de Rotas

| Rota            | Componente         | Acesso                                    |
| --------------- | ------------------ | ----------------------------------------- |
| `/`             | `LandingPage`      | Público                                   |
| `/inscricao`    | `RegistrationPage` | Público                                   |
| `/admin/login`  | `LoginPage`        | Público (redireciona se já autenticado)    |
| `/admin`        | `AdminDashboard`   | Protegido (requer JWT válido)              |

---

## Fase 1: Dependência

- [x] Instalar `react-router` no frontend (`npm install react-router`).

> A partir do React Router v7, o pacote unificado é `react-router` — não é necessário instalar `react-router-dom` separadamente.

---

## Fase 2: Contexto Global de Autenticação (Separação de Concerns)

> **Ref `claude.md` §8 — Frontend Authentication:** "Use Context API for global auth state. Custom hooks encapsulate the logic. The UI reacts automatically to the authenticated state. Private routes protect sensitive screens."

- [x] Criar `frontend/src/contexts/AuthContext.tsx`:
  - [x] Mover a lógica de `useAuth.ts` para um `AuthProvider`.
  - [x] Expor `token`, `user`, `login()`, `logout()`, `isAuthenticated`, `loading`, `error` via `useAuthContext()`.
  - [x] Manter persistência via `localStorage` (comportamento existente).
- [x] Avaliar se `hooks/useAuth.ts` pode ser removido após migração (provavelmente sim — o contexto absorve toda a lógica).

---

## Fase 3: Componente de Rota Protegida

- [x] Criar `frontend/src/components/ProtectedRoute.tsx`:
  - [x] Se `!isAuthenticated` → `<Navigate to="/admin/login" replace />`.
  - [x] Se autenticado → renderizar `<Outlet />`.

---

## Fase 4: Reestruturar `App.tsx` com `BrowserRouter`

- [x] Remover completamente o `useState<AppView>` e toda lógica condicional de renderização.
- [x] Envolver a aplicação com `<AuthProvider>` + `<BrowserRouter>`.
- [x] Definir as rotas:
  - [x] `/` → `<LandingPage />`
  - [x] `/inscricao` → `<RegistrationPage />`
  - [x] `/admin/login` → `<LoginPage />` (com redirect se já logado)
  - [x] `/admin` → `<AdminDashboard />` (dentro de `<ProtectedRoute />`)
  - [x] `*` → `<Navigate to="/" replace />`

---

## Fase 5: Adaptar Páginas (Eliminação de Prop-Drilling)

### 5.1 LandingPage.tsx

- [x] Remover props `onGoToRegistration` e `onGoToAdmin`.
- [x] Substituir callbacks por `<Link to="/inscricao">` e `<Link to="/admin/login">` (ou `useNavigate()`).

### 5.2 LoginPage.tsx

- [x] Remover props `onLogin`, `error`, `loading`.
- [x] Usar `useAuthContext()` para obter `login()`, `error`, `loading`.
- [x] Após login com sucesso, chamar `navigate("/admin")`.
- [x] Se já autenticado ao montar, redirecionar automaticamente para `/admin`.

### 5.3 AdminDashboard.tsx

- [x] Remover props `token`, `adminName`, `onLogout`.
- [x] Obter `token`, `user.name`, `logout()` do `useAuthContext()`.
- [x] No logout, chamar `logout()` seguido de `navigate("/")`.

### 5.4 RegistrationPage.tsx

- [x] Sem mudanças significativas (já é auto-contido, sem props).
- [x] Adicionar `<Link to="/">` opcional para "voltar ao início".

---

## Fase 6: Limpeza

- [x] Remover `App.module.css` (botão "Acesso Admin" flutuante não será mais necessário).
- [x] Remover interfaces de props obsoletas.
- [x] Verificar se `hooks/useAuth.ts` pode ser deletado.
- [x] Rodar `npm run build` para garantir zero erros TypeScript.

---

## Fase 7: Verificação (Critério de Aceite)

- [x] Deep-link funciona: acessar `http://localhost:5173/inscricao` abre o formulário diretamente.
- [x] Deep-link funciona: acessar `http://localhost:5173/admin/login` abre o login admin.
- [x] Rota protegida: acessar `http://localhost:5173/admin` sem token redireciona para `/admin/login`.
- [x] Após login, URL muda para `/admin`.
- [x] Botão "voltar" do navegador funciona corretamente em todas as transições.
- [x] Refresh da página mantém o estado de autenticação (token persistido no localStorage).
- [x] Logout redireciona para `/` ou `/admin/login`.
- [x] Rota inexistente (ex: `/abc`) redireciona para `/`.
- [x] `npm run build` passa sem erros.

---

## Estrutura Final de Arquivos

```
frontend/src/
  contexts/
    AuthContext.tsx          ← NOVO
  components/
    ProtectedRoute.tsx       ← NOVO
  pages/
    LandingPage.tsx          ← MODIFICADO (remove props, usa Link/navigate)
    LoginPage.tsx            ← MODIFICADO (usa AuthContext, navigate)
    AdminDashboard.tsx       ← MODIFICADO (usa AuthContext, navigate)
    RegistrationPage.tsx     ← MÍNIMO (opcional: link de voltar)
  hooks/
    useAuth.ts               ← REMOVIDO (absorvido pelo AuthContext)
    useAge.ts                (sem mudanças)
    useModalities.ts         (sem mudanças)
  App.tsx                    ← REESCRITO (BrowserRouter + Routes)
  App.module.css             ← REMOVIDO
  main.tsx                   (sem mudanças)
```

---

## Riscos e Dependências

| Aspecto            | Detalhe                                                              |
| ------------------ | -------------------------------------------------------------------- |
| Dependência nova   | `react-router` (~50KB gzipped)                                       |
| Breaking changes   | Zero no backend — alteração puramente frontend                        |
| Risco              | Baixo — lógica de negócio das páginas não muda, só a navegação        |
| Tempo estimado     | ~30 minutos de execução                                               |
