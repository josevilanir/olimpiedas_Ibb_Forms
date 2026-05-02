# Homologação Parte 2 — Landing Page + Registration + PDF

> Leia `claude.md` na raiz antes de começar. Siga os princípios: simplicidade, impacto mínimo, sem gambiarras.
> Use o `tasks/todo.md` com checkboxes. Marque itens conforme avança.

---

## 1. LANDING PAGE — Componente

**Arquivo:** `frontend/src/pages/LandingPage.tsx`

### 1.1 Atualizar dados hardcoded do array `modalities` (linhas 14-33)

Alterar os seguintes itens no array:

**Corrida Curta Adulta** (linha 17):
```diff
-{ name: 'Corrida Curta Adulta', cat: 'corrida', age: '14+ anos', icon: '⚡', tag: 'member', sub: '100m · 150m · 200m', coord: 'Emicarlo Souza e Carlos Mora' },
+{ name: 'Corrida Curta Adulta', cat: 'corrida', age: '14+ anos', icon: '⚡', tag: 'open', sub: '100m · 150m · 200m', coord: 'Emicarlo Souza e Carlos Mora' },
```

**Corrida Curta Pré-Teens** (linha 18):
```diff
-{ name: 'Corrida Curta Pré-Teens', cat: 'corrida', age: '10–13 anos', icon: '⚡', tag: 'member', sub: '100m · 150m', coord: 'Emicarlo Souza e Carlos Mora' },
+{ name: 'Corrida Curta Pré-Teens', cat: 'corrida', age: '09–13 anos', icon: '⚡', tag: 'open', sub: '100m · 150m', coord: 'Emicarlo Souza e Carlos Mora' },
```

**Corrida Curta Kids** (linha 19):
```diff
-{ name: 'Corrida Curta Kids', cat: 'kids', age: '3–9 anos', icon: '⚡', tag: 'member', sub: '10m · 20m · 30m', coord: 'Emicarlo Souza e Carlos Mora' },
+{ name: 'Corrida Curta Kids', cat: 'kids', age: '03–08 anos', icon: '⚡', tag: 'open', sub: '10m · 20m · 30m', coord: 'Emicarlo Souza e Carlos Mora' },
```

**Circuito Kids** (linha 28):
```diff
-{ name: 'Circuito Kids', cat: 'kids', age: '8–13 anos', icon: '🏋️', tag: 'member', sub: 'Obstáculos', coord: 'Fran Missionário' },
+{ name: 'Circuito Kids', cat: 'kids', age: '09–13 anos', icon: '🏋️', tag: 'member', sub: 'Obstáculos', coord: 'Fran Missionário' },
```

**Treino Funcional** (linha 32):
```diff
-{ name: 'Treino Funcional', cat: 'livre', age: 'Livre', icon: '💪', tag: 'open', sub: 'Não competitivo', coord: 'Jonatas Silveira (Jow)' },
+{ name: 'Treino Funcional', cat: 'livre', age: 'Livre', icon: '💪', tag: 'member', sub: 'Não competitivo', coord: 'Jonatas Silveira (Jow)' },
```

### 1.2 Valor R$15 → R$15,09 na seção SOBRE

Linha 174:
```diff
-<div className="stat"><div className="n">R$15</div><div className="l">Inscrição</div></div>
+<div className="stat"><div className="n">R$15,09</div><div className="l">Inscrição</div></div>
```

### 1.3 Frase final na seção SOBRE

Após linha 170 (segundo `<p>` da sobre-text), adicionar:
```tsx
<p className="reveal reveal-delay-3">Incentivando a realização de atividades físicas em ambientes seguros e saudáveis através da comunhão entre os irmãos.</p>
```

**Atenção:** O parágrafo que atualmente tem `reveal-delay-3` (sobre-stats, linha 171) deve passar a ser `reveal-delay-4`, e os stats `reveal-delay-5`.

### 1.4 Ticker mais pra cima — visível na hero

Mover o bloco `{/* TICKER */}` (linhas 145-152) para DENTRO da seção hero, logo antes do `</section>` de fechamento do hero (antes da linha 143). Envolver com posicionamento:

```tsx
{/* TICKER — dentro do hero para aparecer na tela inicial */}
<div className="ticker hero-ticker">
  <div className="ticker-track">
    {trackItems.map((item, i) => (
      <span key={i} className="ticker-item">{item}<span className="sep">✦</span></span>
    ))}
  </div>
</div>
```

### 1.5 Texto sobre Nanda no "Como Participar"

Linha 236 (step-desc do passo 3):
```diff
-<div className="step-desc">R$ 15,09 por pessoa. Crianças de até 8 anos não pagam.</div>
+<div className="step-desc">R$ 15,09 por pessoa. Crianças de até 8 anos não pagam.<br/>Enviar comprovante para Maria Fernanda (Nanda) para efetivar sua inscrição.</div>
```

Na `pix-box` (linha 254), após o texto "R$ 15,09 · isento até 8 anos":
```diff
 <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>R$ 15,09 · isento até 8 anos</div>
+<div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>Enviar comprovante para Maria Fernanda (Nanda) para efetivar sua inscrição.</div>
```

### 1.6 Footer 2025 → 2026

Linha 275:
```diff
-<span>© 2025 Olimpíadas IBB — Todos os direitos reservados</span>
+<span>© 2026 Olimpíadas IBB — Todos os direitos reservados</span>
```

### 1.7 Setas fading in/out para indicar scroll

Adicionar após o fechamento de `hero-content` (antes do `</section>` do hero):

```tsx
<div className="scroll-hint" onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}>
  <span className="scroll-chevron">❯</span>
  <span className="scroll-chevron">❯</span>
</div>
```

---

## 2. LANDING PAGE — CSS

**Arquivo:** `frontend/src/pages/LandingPage.css`

### 2.1 Logo maior (+30%)

Linha 42: `height: 200px` → `height: 260px`
Linha 46-47: ajustar margins para compensar: `margin-top: -40px; margin-bottom: -40px;`

No media query 900px (linha 596): `height: 120px` → `height: 156px`

### 2.2 Ticker dentro do hero

Adicionar após as regras existentes do ticker:

```css
.landing-page-container .hero-ticker {
  position: relative;
  z-index: 10;
  margin-top: auto;
  margin-bottom: -64px; /* Compensa o padding-bottom do hero */
}
```

### 2.3 Setas de scroll (fading in/out)

Adicionar no final do arquivo (antes dos media queries):

```css
/* ─── SCROLL HINT ─── */
.landing-page-container .scroll-hint {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) rotate(90deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
  cursor: pointer;
  animation: scrollFade 2s ease-in-out infinite;
}

.landing-page-container .scroll-chevron {
  font-size: 18px;
  color: rgba(255,255,255,0.4);
  line-height: 1;
}

.landing-page-container .scroll-chevron:last-child {
  opacity: 0.6;
  animation: scrollFade 2s ease-in-out infinite 0.3s;
}

@keyframes scrollFade {
  0%, 100% { opacity: 0.2; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(4px); }
}
```

---

## 3. REGISTRATION PAGE — Componente

**Arquivo:** `frontend/src/pages/RegistrationPage.tsx`

### 3.1 Bonequinho virado pra bandeira

Linha 101-103 — alterar o emoji runner no `ProgressBar`:
```diff
-<span className={styles.progressRunner} style={{ left: `calc(${pct}% - 14px)` }}>
-  🏃‍♂️
-</span>
+<span className={styles.progressRunner} style={{ left: `calc(${pct}% - 14px)`, display: 'inline-block', transform: 'translateY(-60%) scaleX(-1)' }}>
+  🏃‍♂️
+</span>
```

E remover o `transform: translateY(-60%)` do CSS `.progressRunner` (RegistrationPage.module.css linha 99) já que agora está inline. Ou melhor: mover o scaleX para o CSS:

**No CSS** (`RegistrationPage.module.css` linha 99):
```diff
-transform: translateY(-60%);
+transform: translateY(-60%) scaleX(-1);
```

### 3.2 Título etapa 4

Linha 340:
```diff
-<div className={styles.questionLabel}>Quem vai participar?</div>
+<div className={styles.questionLabel}>Essa inscrição é para:</div>
```

### 3.3 Reordenar sub-telas do PAYMENT_DISCLAIMER

Alterar o array `PAYMENT_DISCLAIMER_TITLES` (linhas 32-41):

```typescript
const PAYMENT_DISCLAIMER_TITLES = [
  "Valor por pessoa",           // era índice 2
  "Sobre o valor",              // era índice 0
  "Sobre a camisa",             // era índice 1
  "Crianças até 8 anos",        // era índice 3
  "A partir de 9 anos",         // mantém
  "Como pagar",                 // mantém
  "Escolha de modalidades",     // mantém
  "Número mínimo de inscritos", // mantém
] as const;
```

Alterar o array `PAYMENT_DISCLAIMER_CHECKBOXES` (linhas 43-52) — reordenar para combinar:

```typescript
const PAYMENT_DISCLAIMER_CHECKBOXES = [
  "Entendi — pago uma vez e escolho quantas modalidades quiser.",     // era índice 2
  "Entendi sobre o propósito do valor.",                               // era índice 0
  "Entendi que a camisa é vendida separadamente.",                     // era índice 1
  "Entendi a regra de isenção para crianças até 8 anos.",              // era índice 3
  "Entendi que a partir de 09 anos o valor é R$ 15,09.",               // mantém
  "Entendi como fazer o pagamento e enviar o comprovante para a Nanda.", // mantém
  "Entendi — vou escolher as modalidades no próximo passo.",           // mantém
  "Entendi sobre o número mínimo de inscrições por modalidade.",       // mantém
] as const;
```

Reordenar os blocos JSX condicionais `{paymentDisclaimerStep === N && (...)}` (linhas 537-593) na mesma ordem:

- `paymentDisclaimerStep === 0` → conteúdo do antigo step 2 (Valor por pessoa: "R$ 15,09 é por pessoa...")
- `paymentDisclaimerStep === 1` → conteúdo do antigo step 0 (Sobre o valor: "O valor é simbólico...")
- `paymentDisclaimerStep === 2` → conteúdo do antigo step 1 (Sobre a camisa)
- `paymentDisclaimerStep === 3` → conteúdo do antigo step 3 (Crianças até 8 anos)
- Steps 4-7 permanecem iguais.

### 3.4 "acima" → "apresentado" (camisa)

Linha 545:
```diff
-<p>👕 A camisa será vendida à parte e <strong>não está inclusa</strong> no valor acima! Sendo este, somente o valor da <strong>INSCRIÇÃO</strong>.</p>
+<p>👕 A camisa será vendida à parte e <strong>não está inclusa</strong> no valor apresentado! Sendo este, somente o valor da <strong>INSCRIÇÃO</strong>.</p>
```

### 3.5 "acima" → "apresentado" (crianças)

Linha 557:
```diff
-<p>👶 Crianças até <strong>08 (oito) anos</strong> de idade não precisam pagar o valor acima para se inscrever
+<p>👶 Crianças até <strong>08 (oito) anos</strong> de idade não precisam pagar o valor apresentado para se inscrever
```

### 3.6 Novo título da aba de termos

Linha 730:
```diff
-<div className={styles.questionLabel}>Avisos importantes — leia com atenção</div>
+<div className={styles.questionLabel}>Antes de finalizar, precisamos frisar bastante as orientações abaixo — leia com atenção para que você não tenha problemas</div>
```

### 3.7 Botão "Baixar seu Ingresso PDF"

Linha 861:
```diff
-Baixar Comprovante PDF
+Baixar seu Ingresso PDF
```

### 3.8 Botão "Voltar para página inicial"

Na tela de sucesso (após o botão "Nova inscrição", dentro do `div` com flex, ~linha 874), adicionar:

```tsx
<motion.button
  className="btn btn-secondary"
  onClick={() => navigate('/')}
  {...microBtn}
>
  Voltar para página inicial
</motion.button>
```

Precisa do `useNavigate` que já está importado? Verificar — NÃO está importado no RegistrationPage. Adicionar:

Linha 1 ou 2:
```diff
+import { useNavigate } from "react-router";
```

E dentro do componente (após linha 163):
```typescript
const navigate = useNavigate();
```

### 3.9 Atualizar Disclaimer 3 (regras de participação)

Linha 321: atualizar para refletir que corridas curtas agora são abertas:
```diff
-<p>🏅 Com exceção das modalidades <strong>CORRIDA</strong> e <strong>CAMINHADA</strong>, para participar das demais você precisa ser:</p>
+<p>🏅 Com exceção das modalidades de <strong>CORRIDA</strong> (Longa e Curtas) e <strong>CAMINHADA</strong>, para participar das demais você precisa ser:</p>
```

---

## 4. PDF DO INGRESSO

**Arquivo:** `frontend/src/utils/generatePdf.ts`

### 4.1 Estilizar frase de dúvidas

Remover a linha de dúvidas do array `avisos` (linha 88) e renderizá-la separadamente com estilo:

```diff
 const avisos = [
   "• Taxa de inscrição: R$ 15,09 por pessoa (isento até 8 anos).",
   "• Pagamento via PIX. Envie o comprovante pelo WhatsApp ao coordenador.",
   "• A camiseta oficial não está inclusa na taxa.",
-  "• DÚVIDAS? FALE COM SAMUCA PELO WHATSAPP: (84) 99921-5999",
 ];
 for (const aviso of avisos) {
   doc.text(aviso, 20, y);
   y += 7;
 }
+
+// Frase de dúvidas estilizada (fundo azul claro, texto azul, centralizado)
+y = 260; // Posicionar mais perto do fim da página
+doc.setFillColor(240, 244, 255);
+doc.roundedRect(15, y - 8, 180, 16, 3, 3, "F");
+doc.setTextColor(...primaryColor);
+doc.setFont("helvetica", "bold");
+doc.setFontSize(9);
+doc.text("DÚVIDAS? FALE COM SAMUCA PELO WHATSAPP: (84) 99921-5999", 105, y, { align: "center" });
```

---

## Verificação Final (Landing + Forms + PDF)

1. `cd frontend && npm run build` — sem erros
2. Landing Page:
   - Logo ~30% maior no nav
   - Ticker visível sem rolar
   - Seção SOBRE: "R$15,09", frase final sobre comunhão
   - "Como Participar" passo 3: texto sobre Nanda
   - Setas de scroll animadas no hero
   - Footer: © 2026
   - Corrida Curta Adulta/Pré-Teens/Kids com tag "Aberto"
   - Treino Funcional com tag "Membros IBB"
   - Circuito Kids: 09–13 anos
3. Formulário:
   - Bonequinho correndo para a direita (em direção à bandeira)
   - Etapa 4: "Essa inscrição é para:"
   - Etapa 12: "Valor por pessoa" aparece primeiro
   - "apresentado" em vez de "acima" (camisa e crianças)
   - Termos: novo título longo
   - Sucesso: "Baixar seu Ingresso PDF" + "Voltar para página inicial"
4. PDF: frase de dúvidas em azul, centralizada, com fundo azul claro, próximo ao fim da página
