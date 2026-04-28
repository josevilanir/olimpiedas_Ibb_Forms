# Plano de Implementação: Reformulação do Formulário de Inscrição

Este documento detalha as instruções para a reformulação da interface e experiência de usuário (UX) do formulário de inscrição das Olimpíadas IBB 2026. Siga os passos abaixo cuidadosamente.

**Arquivo principal a ser modificado:** `frontend/src/pages/RegistrationPage.tsx`
**Estilos:** `frontend/src/pages/RegistrationPage.module.css`

## 1. Dependências do Frontend
Primeiramente, instale as bibliotecas necessárias para animações e confetes no diretório `frontend`:
```bash
npm install framer-motion canvas-confetti
npm install -D @types/canvas-confetti
```

---

## 2. Disclaimers Iniciais (Termos de Aceite)
Adicione 3 novas etapas logo no início do fluxo do formulário (antes de "Quem vai participar?"). 
Estas etapas devem possuir um checkbox de confirmação e um botão para avançar (que só é ativado após o checkbox ser marcado).

Textos baseados nos requisitos oficiais:
1. **Etapa 1 (Individual):** "A inscrição e preenchimento deste formulário é individual. Isso significa que cada integrante da sua família deve fazer a inscrição individualmente."
2. **Etapa 2 (Valor):** "O valor da inscrição é por pessoa e não por modalidade. Isso significa que você poderá se inscrever em quantas modalidades desejar."
3. **Etapa 3 (Regras):** "Com exceção das modalidades CORRIDA e CAMINHADA, só poderão participar das demais modalidades quem for Membro IBB ou quem estiver frequentando algum GR (Grupos de Relacionamento) da IBB."

---

## 3. Layout One-by-One e Transições Suaves
Refatore o componente `RegistrationPage` para exibir apenas UMA etapa por vez, ocupando o centro da tela, em vez do comportamento atual de empilhar tudo verticalmente com scroll.

- Importe `motion` e `AnimatePresence` do `framer-motion`.
- Envolva o bloco central da pergunta com `<AnimatePresence mode="wait">`.
- Cada bloco de pergunta deve ser um `<motion.div>` com as propriedades de animação:
  - `initial={{ x: 300, opacity: 0 }}`
  - `animate={{ x: 0, opacity: 1 }}`
  - `exit={{ x: -300, opacity: 0 }}`
  - `transition={{ duration: 0.3 }}`

---

## 4. Microinterações nos Componentes
Torne a interface mais responsiva e fluida:
- Botões principais de "Avançar" e opções: Adicione efeitos `whileHover={{ scale: 1.05 }}` e `whileTap={{ scale: 0.95 }}` do Framer Motion.
- `ModalityCard`: Ao interagir (hover ou click), faça o componente escalar levemente ou ganhar um efeito de brilho suave (glow) nas bordas. 

---

## 5. Tematização Dinâmica por Modalidade
Adapte a cor de fundo ou tema da aplicação quando o usuário estiver escolhendo os esportes:
- Crie um estado `currentThemeColor` na aplicação.
- Mapeie algumas modalidades para cores específicas (ex: Natação -> tons de azul, Futsal -> tons de verde, Tênis de Mesa -> vermelho, etc.).
- Quando o usuário passar o mouse (hover) ou selecionar uma modalidade, transicione suavemente a cor de fundo do container principal para refletir a modalidade focada/selecionada. (Nota: Mantenha a cor de fundo sutil para não prejudicar o contraste do texto).

---

## 6. Gamificação: Barra de Progresso "Pista de Corrida"
Substitua indicadores estáticos por uma barra de progresso criativa:
- Crie uma barra fixada no topo ou no rodapé do formulário que se pareça com uma "pista".
- Use o cálculo `(stepAtual / totalSteps) * 100` para determinar o avanço.
- Use um ícone de corredor (🏃‍♂️) posicionado no eixo X com base na porcentagem calculada, avançando até uma "linha de chegada" na última etapa.

---

## 7. A Grande Finalização
Na tela de sucesso (após a submissão via API ser concluída e o componente de `registered` ser montado):
- Importe o `canvas-confetti`.
- Dispare a função de confetes no `useEffect` de montagem da tela de sucesso.
- Exiba a mensagem comemorativa solicitada: "Inscrição confirmada! Já pode começar a alongar!" junto às informações do PIX.

---

**Observações para o Agente Executor:**
Garanta que as refatorações em `RegistrationPage.tsx` não quebrem a lógica existente de campos opcionais, restrições de idade e o agrupamento condicional dos passos (ex: pular o nome dos pais se for inscrição de adulto). Ajuste o TypeScript onde necessário (novos steps no enum `S`, etc).

---

## 8. Deploy Efetivo
Após todas as implementações visuais e de fluxo terem sido validadadas localmente:
1. **Build do Frontend:** Execute o comando de build na pasta `frontend` para garantir que não existam erros de compilação ou de tipagem (TypeScript):
   ```bash
   npm run build
   ```
2. **Homologação:** Realize um teste final da build de produção para certificar-se de que as animações e transições funcionam conforme o esperado em um ambiente mimético de produção.
3. **Subida (Deploy):** Siga o pipeline padrão (Vercel, Netlify, Render ou servidor próprio) para fazer o deploy do frontend. Certifique-se de configurar corretamente as variáveis de ambiente em produção (ex: URL da API).
