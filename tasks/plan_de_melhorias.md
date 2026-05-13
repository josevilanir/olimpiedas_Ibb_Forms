# Plano de Refinamento Final - Olimpíadas IBB

Este plano detalha os passos para finalizar o projeto com alta qualidade, seguindo as diretrizes do `claude.md` e os pedidos do cliente.

## 1. Ajustes Arquiteturais (Backend)

### 1.1. Implementação da Camada de Repositório
**O que está errado**: Atualmente, arquivos como `participant.service.ts` e `admin.service.ts` importam o `prisma` e executam queries diretamente (`findMany`, `create`, `update`).
**Regra do claude.md**: "Service: MUST contain all business logic. NEVER access the database directly. Repository: MUST handle all database access."
**Ação**:
- Criar `backend/src/repositories/participant.repository.ts`.
- Criar `backend/src/repositories/modality.repository.ts`.
- Mover todas as chamadas `prisma.model.xxx` para estes repositórios.

### 1.2. Validação com Zod
**O que está errado**: Os controladores recebem o `req.body` e passam para o serviço sem validar a estrutura, tipos e constraints antes de processar.
**Ação**:
- Instalar `zod` no backend.
- Criar schemas para `registerParticipant`, `loginAdmin`, etc.
- Validar os dados no Controller antes de chamar o Service.

### 1.3. Centralização de Erros
**O que está errado**: Uso excessivo de `try/catch` nos controladores com verificações manuais de strings (ex: `if (message === "TERMS_NOT_ACCEPTED")`).
**Ação**:
- Criar uma classe `AppError` que estende `Error` e aceita `statusCode`.
- Atualizar o `error.middleware.ts` para capturar `AppError` e retornar o status correto.

---

## 2. Melhorias de UX (Frontend)

### 2.1. Persistência do Formulário
**Problema**: O formulário de 14 passos perde os dados em caso de refresh ou fechamento acidental.
**Ação**:
- Criar um hook `useFormPersistence` ou adicionar lógica no `RegistrationPage.tsx` para salvar o estado no `localStorage`.
- Implementar limpeza do cache após submissão bem-sucedida.

---

## 3. Tarefas de Implementação

### Fase 1: Backend (Infra e Padrões)
- [x] Instalar `zod` e configurar tipos.
- [x] Implementar `ParticipantRepository`.
- [x] Implementar `ModalityRepository`.
- [x] Refatorar `ParticipantService` para usar os repositórios.
- [x] Refatorar `AdminService` para usar os repositórios.
- [x] Implementar `AppError` + centralizar tratamento no `errorMiddleware`.
- [x] Adicionar validação Zod no `ParticipantController`.
- [x] Simplificar `AdminController` usando `next(err)`.

### Fase 2: Frontend (UX)
- [x] Implementar `useFormPersistence` com salvamento automático no `localStorage`.
- [x] Garantir que o usuário volte ao passo exato onde parou.
- [x] Limpar cache após submissão bem-sucedida ou nova inscrição.

### Fase 3: Polimento Final
- [ ] Revisão de variáveis de ambiente.
- [ ] Teste de integração final (Register -> Admin Dashboard).
