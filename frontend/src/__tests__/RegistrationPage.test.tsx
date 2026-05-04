import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import RegistrationPage from '../pages/RegistrationPage';

vi.mock('../hooks/useModalities', () => ({
  useModalities: () => ({
    modalities: [
      { id: 'mod-1', name: 'Corrida Longa 5km', minAge: null, maxAge: null, maxSpots: null, requiresMembership: false, coordinatorName: 'Emicarlo', createdAt: '2026-01-01' },
      { id: 'mod-2', name: 'Futsal', minAge: 14, maxAge: null, maxSpots: 40, requiresMembership: true, coordinatorName: 'Jow', createdAt: '2026-01-01' },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    modalities: { list: vi.fn().mockResolvedValue([]) },
    participants: {
      register: vi.fn().mockResolvedValue({
        id: 'p-1', fullName: 'João Silva', birthDate: '2000-05-04', whatsapp: '84999999999',
        gender: 'MASCULINO', isMember: 'SIM', isForChild: false, parentName: null,
        healthIssues: null, termsAccepted: true, paymentStatus: 'PENDENTE', paidAt: null,
        paymentMethod: null, createdAt: '2026-05-04',
        subscriptions: [{ id: 's-1', participantId: 'p-1', modalityId: 'mod-1', createdAt: '2026-05-04', modality: { id: 'mod-1', name: 'Corrida Longa 5km', minAge: null, maxAge: null, maxSpots: null, requiresMembership: false, coordinatorName: 'Emicarlo', createdAt: '2026-01-01' } }],
      }),
    },
    admin: { login: vi.fn() },
  },
}));

// Mock framer-motion to avoid animation delays in tests
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: any) => {
        const { custom, variants, initial, animate, exit, transition, whileHover, whileTap, layout, onHoverStart, onHoverEnd, ...rest } = props;
        return <div {...rest}>{children}</div>;
      },
      button: ({ children, ...props }: any) => {
        const { custom, variants, initial, animate, exit, transition, whileHover, whileTap, layout, onHoverStart, onHoverEnd, ...rest } = props;
        return <button {...rest}>{children}</button>;
      },
    },
  };
});

async function advanceDisclaimer() {
  const checkboxes = screen.getAllByRole('checkbox');
  const unchecked = checkboxes.find(c => !(c as HTMLInputElement).checked);
  if (unchecked) fireEvent.click(unchecked);

  const btns = screen.getAllByRole('button');
  const continueBtn = btns.find(b =>
    !b.hasAttribute('disabled') && (
      b.textContent?.includes('continuar') ||
      b.textContent?.includes('Vamos lá') ||
      b.textContent?.includes('Entendido')
    )
  );
  if (continueBtn) {
    await act(async () => { fireEvent.click(continueBtn); });
  }
}

describe('RegistrationPage', () => {
  beforeEach(() => { renderWithProviders(<RegistrationPage />); });

  it('renders the progress bar', () => {
    expect(screen.getByText(/Etapa 1 de 14/)).toBeInTheDocument();
  });

  it('renders the first disclaimer', () => {
    expect(screen.getByText(/Antes de começar/)).toBeInTheDocument();
  });

  it('has disabled continue until checkbox checked', () => {
    const btn = screen.getByText(/continuar/i);
    expect(btn).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(btn).not.toBeDisabled();
  });

  it('advances to second disclaimer', async () => {
    await advanceDisclaimer();
    expect(screen.getByText(/Sobre o valor da inscrição/i)).toBeInTheDocument();
  });

  it('advances through all 3 disclaimers to profile', async () => {
    await advanceDisclaimer(); // 1 → 2
    await advanceDisclaimer(); // 2 → 3
    await advanceDisclaimer(); // 3 → profile
    expect(screen.getByText(/Essa inscrição é para:/i)).toBeInTheDocument();
  });

  it('shows parent name step for child', async () => {
    await advanceDisclaimer();
    await advanceDisclaimer();
    await advanceDisclaimer();
    await act(async () => { fireEvent.click(screen.getByText('Para meu filho(a)')); });
    expect(screen.getByText('Nome do responsável')).toBeInTheDocument();
  });

  it('skips parent name for adult', async () => {
    await advanceDisclaimer();
    await advanceDisclaimer();
    await advanceDisclaimer();
    await act(async () => { fireEvent.click(screen.getByText('Para mim')); });
    expect(screen.getByText('Seu nome completo')).toBeInTheDocument();
  });

  it('shows back button after first step', async () => {
    await advanceDisclaimer();
    expect(screen.getByText('← Voltar')).toBeInTheDocument();
  });

  it('renders the page header', () => {
    expect(screen.getByText('Olimpíadas IBB')).toBeInTheDocument();
    expect(screen.getByText('Formulário de inscrição')).toBeInTheDocument();
  });
});
