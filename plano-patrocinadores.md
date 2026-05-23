# Plano de Implementação: Seção de Patrocinadores (Sponsors)

Este documento orienta detalhadamente a implementação da nova seção de patrocinadores no site das **Olimpíadas IBB**. O plano foi elaborado seguindo as diretrizes do `claude.md`, as melhores práticas de otimização de frontend e a identidade visual do projeto.

---

## 1. Onde Anexar as Logos dos Patrocinadores?

Para aproveitar ao máximo o processo de build do Vite (otimização, minificação e cache inteligente), você deve anexar as logos na seguinte pasta do projeto:

📁 **Caminho Recomendado:** `frontend/src/assets/sponsors/`

> [!TIP]
> * Se a pasta `sponsors` não existir, crie-a dentro de `frontend/src/assets/`.
> * Recomenda-se salvar as logos em formato **SVG** (para escalabilidade ideal sem perda de qualidade) ou **PNG otimizado** (com fundo transparente).
> * Nomeie as imagens em letras minúsculas e sem caracteres especiais (ex: `logo-empresa-a.png`, `logo-empresa-b.svg`).

---

## 2. Arquivos a Serem Modificados/Criados

O desenvolvimento será dividido em 3 arquivos principais:

### 1. [NOVO COMPONENTE] `frontend/src/components/landing/SponsorsSection.tsx`
Este arquivo conterá a estrutura React da seção. Segue o template de código limpo e semântico:

```tsx
import { useEffect, useRef } from "react";
// Importações das logos dos patrocinadores (adicione os caminhos das suas logos aqui)
import logoPatrocinador1 from "../../assets/sponsors/logo-exemplo-1.png";
import logoPatrocinador2 from "../../assets/sponsors/logo-exemplo-2.png";
import logoPatrocinador3 from "../../assets/sponsors/logo-exemplo-3.png";

// Interface para estruturar os dados de cada patrocinador
interface Sponsor {
  name: string;
  logo: string;
  url?: string;
}

const sponsorsList: Sponsor[] = [
  { name: "Patrocinador 1", logo: logoPatrocinador1, url: "https://exemplo1.com" },
  { name: "Patrocinador 2", logo: logoPatrocinador2, url: "https://exemplo2.com" },
  { name: "Patrocinador 3", logo: logoPatrocinador3, url: "https://exemplo3.com" },
  // Adicione os demais patrocinadores seguindo o mesmo padrão
];

export function SponsorsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Configura o IntersectionObserver para animações de revelação suave na rolagem (padrão do projeto)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="patrocinadores" className="sponsors-section">
      <div className="section-eyebrow reveal">Parceiros</div>
      <h2 className="section-title reveal reveal-delay-1">
        Nossos<br />Patrocinadores
      </h2>
      <p className="sponsors-subtitle reveal reveal-delay-2">
        Agradecemos imensamente às marcas e empresas que acreditam no esporte, na integração e na nossa comunidade.
      </p>

      <div className="sponsors-grid reveal reveal-delay-3">
        {sponsorsList.map((sponsor, index) => {
          const cardContent = (
            <img
              src={sponsor.logo}
              alt={`Logo do patrocinador ${sponsor.name}`}
              loading="lazy"
              decoding="async"
              className="sponsor-logo"
            />
          );

          if (sponsor.url) {
            return (
              <a
                key={index}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-card"
                title={`Visitar site de ${sponsor.name}`}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <div key={index} className="sponsor-card" title={sponsor.name}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

---

### 2. [ESTILIZAÇÃO] `frontend/src/pages/LandingPage.css`
Adicione as seguintes classes CSS no final do arquivo `LandingPage.css` para aplicar o design premium com glassmorphism e efeitos de hover integrados ao tema do site:

```css
/* ─── SEÇÃO DE PATROCINADORES ─── */
.landing-page-container .sponsors-section {
  background-color: #03142e; /* Mantém a paleta de fundo escuro */
  background-image:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(10, 157, 143, 0.06) 0%, transparent 70%),
    linear-gradient(160deg, rgba(3, 14, 35, 0.95) 0%, rgba(2, 10, 28, 0.98) 100%),
    url('../assets/background.png');
  background-size: cover, cover, cover;
  background-position: center;
  padding: 100px 48px;
}

.landing-page-container .sponsors-subtitle {
  color: rgba(255, 255, 255, 0.55);
  font-size: 17px;
  line-height: 1.75;
  margin-bottom: 56px;
  max-width: 600px;
}

.landing-page-container .sponsors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

/* Design Premium com Efeito Glassmorphism e Glow */
.landing-page-container .sponsor-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
}

/* Animações e Efeitos no Hover */
.landing-page-container .sponsor-card:hover {
  background: rgba(10, 157, 143, 0.05); /* Glow sutil usando o verde primário */
  border-color: var(--green); /* Destaque na borda */
  box-shadow: 0 12px 40px rgba(10, 157, 143, 0.15); /* Sombra difusa colorida */
  transform: translateY(-5px);
}

.landing-page-container .sponsor-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: grayscale(100%) opacity(50%); /* Efeito minimalista fosco padrão */
  transition: all 0.4s ease;
}

/* Quando o usuário passa o mouse, a logo ganha cor e contraste total */
.landing-page-container .sponsor-card:hover .sponsor-logo {
  filter: grayscale(0%) opacity(100%);
}

/* Responsividade para telas menores */
@media (max-width: 768px) {
  .landing-page-container .sponsors-section {
    padding: 80px 24px;
  }
  
  .landing-page-container .sponsors-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .landing-page-container .sponsor-card {
    height: 110px;
    padding: 18px;
  }
}

@media (max-width: 480px) {
  .landing-page-container .sponsors-grid {
    grid-template-columns: 1fr; /* Uma coluna em celulares muito pequenos */
  }
}
```

---

### 3. [PÁGINA PRINCIPAL] `frontend/src/pages/LandingPage.tsx`
Integre a seção na página principal importando o componente criado e posicionando-o logo antes do rodapé (`Footer`):

```diff
  import { ModalitiesSection, modalities } from "../components/landing/ModalitiesSection";
  import { RegistrationSteps } from "../components/landing/RegistrationSteps";
+ import { SponsorsSection } from "../components/landing/SponsorsSection";
  import { Footer } from "../components/landing/Footer";
```

```diff
        <AboutSection />
        <ModalitiesSection activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <RegistrationSteps onGoToRegistration={onGoToRegistration} />
+       <SponsorsSection />
        <Footer onGoToAdmin={onGoToAdmin} />
      </div>
```

---

## 3. Diretrizes de Performance e Padrões (Seguindo `claude.md`)

- **Componentização:** A seção foi isolada em um arquivo próprio (`SponsorsSection.tsx`), evitando inflar o arquivo principal da Landing Page.
- **Otimização de Imagens (CLS & LCP):**
  - O uso de `loading="lazy"` e `decoding="async"` garante que as imagens dos patrocinadores só sejam baixadas quando o usuário rolar a página até elas, economizando banda no carregamento inicial.
  - O tamanho fixo do `.sponsor-card` em CSS evita saltos de conteúdo na tela (*Cumulative Layout Shift*).
- **Semântica HTML:** Utiliza `<section>` estruturado com classes do design system e IDs apropriados para navegação ou âncoras futuras.
- **Integração de Estilos:** A estilização baseia-se nas variáveis do projeto (`var(--green)`, cores e padrões de blur já configurados).

---

## 4. Próximos Passos para o Claude Code:
1. Criar a pasta `frontend/src/assets/sponsors/` e colocar as logos fornecidas pelo usuário nela.
2. Criar o arquivo `frontend/src/components/landing/SponsorsSection.tsx` atualizando os nomes dos arquivos importados com os nomes reais das logos fornecidas.
3. Inserir a estilização no final de `frontend/src/pages/LandingPage.css`.
4. Importar e renderizar o componente em `frontend/src/pages/LandingPage.tsx`.
5. Executar `npm run build` no diretório `frontend` para homologação.
