# Plano de Limpeza de Modalidades

Este documento detalha o plano de ação para remover ou inativar as modalidades antigas e genéricas do banco de dados, garantindo que o sistema exiba apenas a lista final validada pelo cliente.

## 🎯 Objetivo
Garantir que apenas as 18 modalidades aprovadas estejam disponíveis, lidando com as 13 modalidades obsoletas ou genéricas sem causar erros no sistema.

### Modalidades a serem removidas/inativadas:
1. Corrida *(Genérica)*
2. Caminhada *(Genérica)*
3. Futebol Society (Masculino)
4. Futsal Feminino
5. Vôlei *(Genérica)*
6. Tênis de Mesa *(Versão com acento, duplicada)*
7. Xadrez
8. Pebolim (Totó)
9. Cabo de Guerra
10. Bíblia Quiz
11. Corrida de Saco (Kids)
12. Colher e Ovo (Kids)
13. Cabo de Guerra (Kids)

---

## 🛠️ Passos do Plano de Execução

### Passo 1: Backup de Segurança
**Sempre faça backup antes de manipular dados em massa!**
- Realizar um dump do banco de dados atual (garantia caso seja necessário restaurar os dados dessas modalidades ou inscrições vinculadas).

### Passo 2: Verificação de Dependências (Crucial)
Antes de excluir os registros, precisamos garantir que não existam inscrições atreladas a elas (Foreign Keys).
- **Ação:** Consultar o banco de dados (ex: tabela de `Inscricoes`) buscando por registros vinculados aos IDs destas modalidades indesejadas.
- **Se não houver inscritos:** A limpeza será direta e fácil.
- **Se houver inscritos:** Será necessário migrar essas inscrições (Ex: Mudar de "Corrida" genérica para a específica que o atleta deseja) antes de deletar a modalidade, ou o banco retornará erro de relacionamento.

### Passo 3: Estratégia de Limpeza
Devemos definir qual abordagem faz mais sentido para o sistema:
- **Soft Delete (Inativação):** Se a tabela tiver um campo como `ativo` (boolean), apenas mudamos para `false`. Isso mantém o histórico e previne falhas de integridade.
- **Hard Delete (Exclusão Física):** Usar o Prisma (ou SQL direto) para deletar a linha do banco definitivamente. *(Mais limpo, recomendado caso o sistema ainda não esteja em produção/uso massivo).*

### Passo 4: Execução do Script
- Criar um pequeno script local em TypeScript usando o Prisma (ex: `scripts/cleanup-modalidades.ts`) para rodar os comandos de exclusão e automatizar o processo.

### Passo 5: Validação e Testes
- Subir a aplicação no ambiente local.
- Navegar até os formulários de cadastro.
- Validar se o combo de opções lista rigorosamente as **18 modalidades corretas**.
- Realizar uma inscrição de teste para certificar-se de que a estrutura do banco não sofreu nenhuma quebra.

---

## 🚀 Como prosseguir
Para começarmos a executar este plano, basta me informar! Podemos iniciar pelo **Passo 2** criando um pequeno código que checa no banco se alguém já se cadastrou nas modalidades que vão ser removidas.
