import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import LandingPage from '../pages/LandingPage';

describe('LandingPage', () => {
  beforeEach(() => { renderWithProviders(<LandingPage />); });

  // ── Navbar ──
  it('renders the navbar with logo', () => {
    expect(document.getElementById('navbar')).toBeInTheDocument();
    expect(screen.getByAltText('Olimpíadas IBB')).toBeInTheDocument();
  });

  it('renders nav links (Sobre, Modalidades, Inscrição)', () => {
    expect(screen.getByText('Sobre')).toBeInTheDocument();
    // "Modalidades" appears in nav AND section, so use getAllByText
    expect(screen.getAllByText('Modalidades').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Inscrição').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the CTA button in navbar', () => {
    expect(screen.getByText('Inscreva-se')).toBeInTheDocument();
  });

  // ── Hero ──
  it('renders the hero section', () => {
    expect(document.getElementById('hero')).toBeInTheDocument();
  });

  it('renders the hero title', () => {
    expect(screen.getByText('OLIMPÍADAS')).toBeInTheDocument();
    expect(screen.getByText('IBB')).toBeInTheDocument();
  });

  it('renders the hero eyebrow', () => {
    expect(screen.getByText('Igreja Batista Bereana · Natal/RN')).toBeInTheDocument();
  });

  it('renders the hero CTA buttons', () => {
    expect(screen.getByText('Quero participar →')).toBeInTheDocument();
    expect(screen.getByText('Ver modalidades')).toBeInTheDocument();
  });

  it('renders countdown units', () => {
    expect(screen.getByText('Dias')).toBeInTheDocument();
    expect(screen.getByText('Horas')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Seg')).toBeInTheDocument();
  });

  // ── Sobre ──
  it('renders the "Sobre" section', () => {
    expect(document.getElementById('sobre')).toBeInTheDocument();
    expect(screen.getByText('Sobre o Evento')).toBeInTheDocument();
  });

  it('renders stats (18, 3+, R$15,09)', () => {
    expect(screen.getAllByText('18').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('3+')).toBeInTheDocument();
    expect(screen.getByText('R$15,09')).toBeInTheDocument();
  });

  // ── Modalidades ──
  it('renders the "Modalidades" section', () => {
    expect(document.getElementById('modalidades')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getAllByText('Corrida').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Coletivos')).toBeInTheDocument();
    expect(screen.getAllByText('E-Sports').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kids').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Livre').length).toBeGreaterThanOrEqual(1);
  });

  it('renders modality cards', () => {
    // Use getAllByText because some names may appear in ticker too
    expect(screen.getAllByText('Futsal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Natação').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Basquete').length).toBeGreaterThanOrEqual(1);
  });

  it('filters modalities when clicking a category', () => {
    // "Kids" appears multiple times — get the filter button specifically
    const filterDiv = document.querySelector('.mod-filter');
    const kidsBtn = filterDiv!.querySelector('button:nth-child(5)') as HTMLButtonElement; // Kids is 5th filter
    fireEvent.click(kidsBtn);
    const modGrid = document.querySelector('.mod-grid');
    expect(modGrid).toBeInTheDocument();
    const cards = modGrid!.querySelectorAll('.mod-card');
    const cardNames = Array.from(cards).map(c => c.querySelector('.mod-name')?.textContent);
    expect(cardNames).not.toContain('Futsal');
    expect(cardNames).toContain('Corrida Curta Kids');
  });

  // ── Inscrição / Steps ──
  it('renders the "Inscrição" section', () => {
    expect(document.getElementById('inscricao')).toBeInTheDocument();
    expect(screen.getByText('Como participar')).toBeInTheDocument();
  });

  it('renders step cards', () => {
    expect(screen.getByText('Preencha o formulário')).toBeInTheDocument();
    expect(screen.getByText('Escolha modalidades')).toBeInTheDocument();
    expect(screen.getByText('Pague via PIX')).toBeInTheDocument();
    expect(screen.getByText('Receba o comprovante')).toBeInTheDocument();
  });

  it('renders PIX info box', () => {
    expect(screen.getByText('Ir para o formulário →')).toBeInTheDocument();
  });

  // ── Footer ──
  it('renders the footer', () => {
    expect(screen.getByText('Olimpíadas IBB')).toBeInTheDocument();
    expect(screen.getByText('© 2026 Olimpíadas IBB — Todos os direitos reservados')).toBeInTheDocument();
  });

  it('renders admin access link in footer', () => {
    expect(screen.getByText('Acesso Admin')).toBeInTheDocument();
  });

  // ── Ticker ──
  it('renders the ticker', () => {
    const tickerItems = document.querySelectorAll('.ticker-item');
    expect(tickerItems.length).toBeGreaterThan(0);
  });
});
