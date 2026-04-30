# 🔧 Plano de Correção — Olimpíadas IBB

Documento contendo a análise de causa-raiz e o plano de correção para os 5 bugs pendentes reportados.

---

## Bug 1 — Página Admin retorna 404 ao dar refresh / acessar link direto

### Diagnóstico

O frontend está hospedado na **Vercel** (conforme README) e utiliza **React Router** com `BrowserRouter` (client-side routing). Quando o usuário acessa diretamente uma URL como `/admin` ou `/admin/login`, o servidor da Vercel tenta servir um arquivo físico nesse caminho — que não existe — e retorna **404**.

**Causa-raiz:** Não existe nenhum arquivo de configuração de rewrite/redirect no projeto. A Vercel precisa de um `vercel.json` com regra de "catch-all" para redirecionar todas as rotas para `index.html`, deixando o React Router resolver o roteamento no lado do cliente.

**Evidência:** Não há `vercel.json`, `_redirects`, nem `netlify.toml` no projeto.

### Plano de Correção

#### [NEW] `frontend/vercel.json`
Criar o arquivo de configuração da Vercel na raiz do frontend com a regra de rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Isso faz com que **qualquer rota** que não corresponda a um arquivo estático seja servida pelo `index.html`, permitindo que o React Router assuma o roteamento no cliente.

> [!NOTE]
> Caso a Vercel esteja configurada com root directory como `/frontend`, o arquivo deve ficar em `frontend/vercel.json`. Se o root do projeto na Vercel for a raiz do repositório, o arquivo deve ir na raiz do repo. **Confirme com o administrador do deploy qual é o root directory configurado na Vercel.**

---

## Bug 2 — Tela branca no iOS (sem cores da identidade visual)

### Diagnóstico

O CSS da Landing Page utiliza `background-attachment: fixed` em **4 seções** (`#sobre`, `#modalidades`, `#inscricao`, `footer`), aplicado às camadas de `background.png`:

```css
/* Exemplo da seção #sobre (linha 278) */
background-attachment: scroll, scroll, scroll, fixed;

/* Exemplo da seção #modalidades (linha 344) */
background-attachment: scroll, scroll, fixed;
```

**Causa-raiz:** O Safari no iOS **não suporta `background-attachment: fixed`** em elementos que não são o `body`. Quando o Safari encontra esse valor, ele simplesmente ignora a renderização do background inteiro da camada, ou renderiza de forma muito errada, resultando em **tela branca / sem fundo visível**.

Este é um [bug documentado e de longa data do WebKit](https://bugs.webkit.org/show_bug.cgi?id=219324). O Safari trata `fixed` como `scroll` em elementos comuns, e em alguns dispositivos/versões, a renderização falha completamente quando combinada com múltiplas camadas de background e `background-blend-mode`.

**Evidências:**
- `LandingPage.css` linhas 278, 344, 423, 487: todas usam `background-attachment: fixed`
- O bug é reportado exclusivamente em iOS, que usa WebKit/Safari como engine

### Plano de Correção

#### [MODIFY] `frontend/src/pages/LandingPage.css`

**Opção recomendada:** Trocar `background-attachment: fixed` por `scroll` em todas as seções. O efeito parallax que o `fixed` tenta criar não funciona no iOS e causa o bug visual.

Alterações necessárias em 4 blocos:

1. **Seção `#sobre`** (linha 278):
   ```diff
   -  background-attachment: scroll, scroll, scroll, fixed;
   +  background-attachment: scroll, scroll, scroll, scroll;
   ```

2. **Seção `#modalidades`** (linha 344):
   ```diff
   -  background-attachment: scroll, scroll, fixed;
   +  background-attachment: scroll, scroll, scroll;
   ```

3. **Seção `#inscricao`** (linha 423):
   ```diff
   -  background-attachment: scroll, scroll, scroll, fixed;
   +  background-attachment: scroll, scroll, scroll, scroll;
   ```

4. **Seção `footer`** (linha 487):
   ```diff
   -  background-attachment: scroll, scroll, fixed;
   +  background-attachment: scroll, scroll, scroll;
   ```

> [!IMPORTANT]
> Se o efeito parallax for desejável em desktop, uma alternativa mais sofisticada é usar uma pseudo-camada `::before` com `position: fixed` para simular o parallax, ou usar `@supports` para aplicar `fixed` apenas quando o navegador suporta de verdade. Porém, a solução mais segura e simples é remover o `fixed` completamente.

Adicionalmente, as imagens de fundo são pesadas:
- `background.png` = **2.3 MB**
- `texture.png` = **1 MB**

> [!TIP]
> Considerar converter essas imagens para **WebP** ou **AVIF** para reduzir o tamanho em ~60-80%. Isso melhora o tempo de carregamento em dispositivos iOS com conexões mais lentas e pode ajudar a evitar que o Safari descarte as camadas de background por consumo de memória excessivo.

---

## Bug 3 — Página não é responsiva da forma desejada

### Diagnóstico

O CSS da Landing Page possui apenas **1 breakpoint** (`max-width: 900px`), e a estratégia de responsividade é incompleta:

**Problemas identificados:**

1. **Hero:** Valores fixos de padding (`48px`) e margin-bottom (`160px` no título) não escalam em telas menores que 900px mas maiores que celulares pequenos (tablets como iPad Mini, etc.). No mobile (`≤900px`), o `margin-bottom` pula de `160px` para `360px` sem transição suave.

2. **Countdown:** Os `.cd-unit` têm `min-width: 80px` e `padding: 12px 20px` fixos. Em telas estreitas (<400px), os 4 blocos + separadores transbordam.

3. **Steps Grid:** No media query `≤900px`, muda de 4 colunas para 2, mas não vai para 1 coluna em telas muito pequenas (<480px).

4. **Sobre Stats:** Os `.stat` com `grid-template-columns: repeat(3, 1fr)` não têm breakpoint e ficam espremidos em telas pequenas.

5. **Footer:** Layout `space-between` fica espremido em mobile estreito.

6. **Nav CTA (botão "Inscreva-se"):** Visível em mobile mas sem espaço adequado.

7. **Pix Box:** Padding fixo de `40px 48px` não reduz em telas menores.

8. **Hero Bottom:** `flex-wrap: wrap` existe, mas o layout fica apertado em telas ~600-900px.

9. **Ticker:** Funciona, mas texto pode ficar cortado se a janela for muito estreita.

### Plano de Correção

#### [MODIFY] `frontend/src/pages/LandingPage.css`

Adicionar breakpoints intermediários e micro-ajustes para garantir responsividade completa. A ideia é **preservar os valores atuais** em desktop e criar escalas harmoniosas para telas menores.

**1. Breakpoint adicional `@media (max-width: 480px)`** — para celulares pequenos:

```css
@media (max-width: 480px) {
  /* Countdown compacto */
  .landing-page-container .cd-unit {
    min-width: 56px;
    padding: 8px 10px;
  }
  .landing-page-container .cd-num {
    font-size: 28px;
  }
  .landing-page-container .cd-sep {
    font-size: 22px;
  }

  /* Steps: 1 coluna em celulares */
  .landing-page-container .steps-grid {
    grid-template-columns: 1fr;
  }

  /* Stats: 1 coluna em celulares */
  .landing-page-container .sobre-stats {
    grid-template-columns: 1fr;
  }

  /* Hero title menor */
  .landing-page-container .hero-title {
    font-size: clamp(40px, 14vw, 56px);
    margin-bottom: 260px;
  }

  /* Section padding menor */
  .landing-page-container section {
    padding: 40px 16px;
  }

  /* Pix box responsivo */
  .landing-page-container .pix-box {
    flex-direction: column;
    text-align: center;
    padding: 20px 16px;
  }
  .landing-page-container .pix-box > div:nth-child(2) {
    text-align: center !important;
  }

  /* Modality grid: 1 coluna */
  .landing-page-container .mod-grid {
    grid-template-columns: 1fr;
  }

  /* Section titles menores */
  .landing-page-container .section-title {
    font-size: clamp(28px, 8vw, 40px);
  }

  /* Hero sub text */
  .landing-page-container .hero-sub {
    max-width: 100%;
  }

  /* Hero bottom empilhado */
  .landing-page-container .hero-bottom {
    flex-direction: column;
    align-items: flex-start;
  }

  /* Footer empilhado */
  .landing-page-container .footer-top {
    flex-direction: column;
    gap: 24px;
  }
  .landing-page-container .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
```

**2. Ajustes no breakpoint existente `@media (max-width: 900px)`** — adicionar regras faltantes:

```css
/* Dentro do @media (max-width: 900px) existente, adicionar: */

/* Sobre stats: 1 coluna em tablets */
.landing-page-container .sobre-stats {
  grid-template-columns: repeat(3, 1fr); /* Manter 3 colunas, mas com gap menor */
  gap: 1px;
}

/* Modality grid: adaptável */
.landing-page-container .mod-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* Hero bottom: empilhar */
.landing-page-container .hero-bottom {
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

/* Countdown centralizado */
.landing-page-container .countdown {
  align-self: flex-start;
}

/* Hero CTA group */
.landing-page-container .hero-cta-group {
  flex-wrap: wrap;
}

/* Buttons menores */
.landing-page-container .btn-primary,
.landing-page-container .btn-ghost {
  padding: 12px 24px;
  font-size: 14px;
}
```

> [!NOTE]
> O objetivo é manter os tamanhos atuais inalterados em desktop (>900px) e criar transições suaves para cada breakpoint menor. Os valores atuais de margens e tamanhos são tratados como referência máxima.

---

## Bug 4 — Rolagem do gráfico de barras não funciona no PC

### Diagnóstico

O gráfico de barras (por modalidades) usa a seguinte estrutura:

```tsx
// AdminDashboard.tsx, linha 411-452
<div className={styles.chartScrollWrapper}>            // ← Container com overflow-x: auto
  <div style={{ minWidth: Math.max(sortedData.length * 50, 400), cursor: "pointer" }}>  // ← Largura dinâmica
    <ResponsiveContainer width="100%" height={400}>    // ← Recharts responsive container
      <BarChart ... />
    </ResponsiveContainer>
  </div>
</div>
```

E o CSS:
```css
/* AdminDashboard.module.css, linha 871-879 */
.chartScrollWrapper {
  width: 100%;
  overflow-x: auto;
  padding-bottom: var(--space-4);
  -webkit-overflow-scrolling: touch;
}
```

**Causa-raiz:** O **`ResponsiveContainer` do Recharts** com `width="100%"` ignora a `minWidth` do pai e se redimensiona para caber no container visível. Isso faz com que o conteúdo interno nunca exceda a largura do `.chartScrollWrapper`, então **não há overflow e a scrollbar nunca aparece**.

O `ResponsiveContainer` escuta o `resize` do container pai e ajusta sua largura para `100%` da largura **visível**, não respeitando a `minWidth` do div intermediário. Isso efetivamente "colapsa" o gráfico para caber na tela, fazendo as barras ficarem extremamente finas em vez de permitir scroll horizontal.

### Plano de Correção

#### [MODIFY] `frontend/src/pages/AdminDashboard.tsx`

Substituir `ResponsiveContainer` por dimensões fixas calculadas quando o conteúdo precisa de scroll:

```diff
- <div style={{ minWidth: Math.max(sortedData.length * 50, 400), cursor: "pointer" }}>
-   <ResponsiveContainer width="100%" height={400}>
-     <BarChart ... />
-   </ResponsiveContainer>
- </div>
+ <div style={{ width: Math.max(sortedData.length * 50, 400), cursor: "pointer" }}>
+   <BarChart
+     width={Math.max(sortedData.length * 50, 400)}
+     height={400}
+     data={sortedData}
+     margin={{ top: 8, right: 24, bottom: 120, left: 0 }}
+   >
+     {/* ... conteúdo do gráfico mantido igual ... */}
+   </BarChart>
+ </div>
```

**Mudanças-chave:**
1. Trocar `minWidth` por `width` no div container — para que o div realmente ocupe a largura necessária
2. Remover `ResponsiveContainer` e usar `BarChart` diretamente com `width` e `height` explícitos
3. A largura é calculada como `sortedData.length * 50` (mínimo 400px), garantindo que com muitas barras o container fique largo e o scroll funcione

> [!TIP]
> O multiplicador `50` por barra pode ser ajustado para `60` ou `70` se as barras ficarem muito finas. Teste com o número real de modalidades (atualmente 18), o que resultaria em `18 * 50 = 900px` — suficiente para scroll em telas menores que 900px.

---

## Bug 5 — Botão "Exportar tudo (Excel)" retorna erro

### Diagnóstico

A função `handleExport` no `AdminDashboard.tsx` (linhas 167-185) é responsável por baixar o arquivo Excel. Analisando o código:

```tsx
function handleExport(modalityId?: string) {
  const query = modalityId ? `?modalityId=${modalityId}` : "";
  const url = `${BASE_URL}/admin/export${query}`;
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "");
  Object.assign(link.style, { display: "none" });
  document.body.appendChild(link);
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  fetch(url, { headers })
    .then((r) => r.blob())     // ← Problema 1: não checa r.ok
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      link.href = blobUrl;
      link.click();
      URL.revokeObjectURL(blobUrl); // ← Problema 2: revoga muito cedo
      document.body.removeChild(link);
    });
    // ← Problema 3: sem .catch()
}
```

**Causa-raiz — múltiplos problemas sobrepostos:**

1. **Sem verificação de `response.ok`** — Se o backend retornar um erro (401 token expirado, 500 erro interno), a resposta JSON de erro é convertida em blob e baixada como `.xlsx`. O resultado é um arquivo corrompido ou o navegador exibindo erro ao tentar abrir.

2. **`URL.revokeObjectURL()` chamado imediatamente após `link.click()`** — O navegador pode não ter iniciado o download quando a URL é revogada, causando falha no download.

3. **Sem `.catch()`** — Qualquer falha de rede (CORS, timeout, servidor offline) resulta em uma promise rejection não tratada, que aparece como erro no console sem feedback para o usuário.

4. **Atributo `download` vazio** — `link.setAttribute("download", "")` pode causar comportamentos inconsistentes entre navegadores. Alguns ignoram o download e tentam navegar para a URL.

**Verificação do backend:** O serviço `exportParticipantsToExcel` e a rota `GET /api/v1/admin/export` foram testados isoladamente e **funcionam corretamente** — o ExcelJS gera o buffer sem erros e o controller envia os headers corretos (`Content-Type` e `Content-Disposition`). O problema está exclusivamente no frontend.

### Plano de Correção

#### [MODIFY] `frontend/src/pages/AdminDashboard.tsx`

Reescrever a função `handleExport` com tratamento de erros robusto:

```tsx
async function handleExport(modalityId?: string) {
  const query = modalityId ? `?modalityId=${modalityId}` : "";
  const url = `${BASE_URL}/admin/export${query}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      // Tenta extrair mensagem de erro do JSON
      const errorBody = await response.json().catch(() => null);
      const msg = errorBody?.error ?? `Erro ${response.status}`;
      showFeedback("error", msg);
      return;
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `inscritos_olimpiadas_ibb_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();

    // Aguarda antes de revogar para garantir que o download iniciou
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 1000);
  } catch {
    showFeedback("error", "Erro de rede ao exportar. Verifique sua conexão.");
  }
}
```

**Mudanças-chave:**
1. Convertido para `async/await` para legibilidade
2. Verifica `response.ok` antes de converter para blob
3. Em caso de erro HTTP, extrai a mensagem e mostra feedback visual usando o `showFeedback` já existente
4. Adiciona um nome de arquivo explícito no atributo `download`
5. Usa `setTimeout` de 1s antes de revogar a URL do blob
6. Trata erros de rede com `try/catch`

> [!TIP]
> Se o erro persistir em produção mesmo após essas correções, verificar nos logs do Fly.io (`fly logs -a olimpiedas-ibb-backend`) se há erros `[exportExcel]` — pode haver um problema de conexão com o NeonDB no momento da query.

---

## Resumo das Alterações

| Bug | Arquivo(s) | Tipo | Complexidade |
|-----|-----------|------|-------------|
| 404 no Admin refresh | `frontend/vercel.json` | [NEW] | Baixa |
| Tela branca iOS | `frontend/src/pages/LandingPage.css` | [MODIFY] | Baixa |
| Responsividade | `frontend/src/pages/LandingPage.css` | [MODIFY] | Média |
| Scroll do gráfico | `frontend/src/pages/AdminDashboard.tsx` | [MODIFY] | Baixa |
| Export Excel com erro | `frontend/src/pages/AdminDashboard.tsx` | [MODIFY] | Baixa |

## Verificação

### Após implementação, validar:

1. **Bug 1:** Deploy na Vercel → acessar diretamente `https://<dominio>/admin` e `https://<dominio>/admin/login` → deve carregar corretamente.

2. **Bug 2:** Abrir a landing page no **Safari iOS** (ou no simulador do Xcode) → todas as seções devem ter background visível com as cores da identidade.

3. **Bug 3:** Redimensionar o navegador em incrementos de 1920px → 1200px → 900px → 768px → 480px → 375px → 320px. Em cada ponto:
   - Nenhum conteúdo deve transbordar horizontalmente
   - Textos devem ser legíveis
   - Botões devem ser clicáveis
   - Grids devem reconfigurar para menos colunas

4. **Bug 4:** Na página Admin > Estatísticas > gráfico "Por modalidade" → com mouse, deve ser possível rolar horizontalmente se as barras excederem a largura da tela. Testar também com trackpad (scroll horizontal) e com drag.

5. **Bug 5:** Na página Admin > clicar "Exportar todas (Excel)" → deve baixar um arquivo `.xlsx` válido. Testar também:
   - Com token expirado (fazer logout/login) — deve mostrar mensagem de erro amigável
   - Com backend offline — deve mostrar "Erro de rede"
   - Export individual por modalidade — deve funcionar igualmente
