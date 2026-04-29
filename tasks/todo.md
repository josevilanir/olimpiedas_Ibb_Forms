# TODO — Limpeza de Modalidades Genéricas

Referência: `task/plano_Limpeza.md`

## Passos

- [x] **Passo 1** — Backup: verificar dados antes de tocar no banco
- [x] **Passo 2** — Criar script de verificação de dependências (inscrições vinculadas)
- [x] **Passo 3/4** — Criar script de limpeza (hard delete das 13 modalidades)
- [x] **Passo 5** — Rodar script, validar resultado, apresentar relatório

## Resultado

✅ **Concluído em 2026-04-29**

- 13 modalidades genéricas removidas
- 3 inscrições de teste removidas (cascade)
- Banco agora tem exatamente **18 modalidades**, batendo 100% com a lista do cliente
- Script: `backend/scripts/cleanup-modalidades.ts`
