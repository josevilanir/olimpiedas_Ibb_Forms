# Task — Fase 2

## Progresso

- [x] 1. PDF: adicionar mensagem de suporte ao comprovante
- [x] 2. Seed: atualizar nomes dos coordenadores
- [x] 3. Executar `npm run seed` — Seed completed successfully
- [x] 4. LandingPage: exibir coordenador nos cards de modalidade
- [x] 5. LandingPage CSS: background.png + texture.png aplicados diretamente em #sobre, #modalidades, #inscricao e footer via background-image multicamada com background-blend-mode + background-attachment: fixed (parallax)
- [x] 6. AdminDashboard: tema escuro com acento verde (#0aad9f)
- [x] 7. Instalar `recharts` + gráficos de pizza (gênero, vínculo) e barras (idades, modalidades)
- [x] 8. Testes: 20/20 passando — zero erros TypeScript

---

## Log de execução

### Concluído em 2026-04-28

#### Arquivos alterados
| Arquivo | O que mudou |
|---|---|
| `frontend/src/utils/generatePdf.ts` | Linha "DÚVIDAS? FALE COM SAMUCA PELO WHATSAPP: (84) 99921-5999" adicionada aos avisos |
| `backend/prisma/seed.ts` | coordinatorName atualizado para todos 18 modalidades |
| `frontend/src/pages/LandingPage.tsx` | Campo `coord` adicionado a cada modalidade; exibido no card com `.mod-coord` |
| `frontend/src/pages/LandingPage.css` | Pseudo-elemento `::before` com textura global; gradientes radiais nas seções #sobre e #inscricao; estilo `.mod-coord` |
| `frontend/src/pages/AdminDashboard.module.css` | Tema escuro (#0d1b2a, #0f2133) com acento verde (#0aad9f), badges, tabela, modais e stat cards repaginados |
| `frontend/src/pages/AdminDashboard.tsx` | Importação do recharts; seção Stats substituída por PieCharts (gênero, vínculo) + BarCharts (faixas etárias, modalidades) |
