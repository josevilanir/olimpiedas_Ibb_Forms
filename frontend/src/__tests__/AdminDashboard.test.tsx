import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import AdminDashboard from '../pages/AdminDashboard';

vi.mock('../services/api', () => ({
  api: {
    modalities: {
      list: vi.fn().mockResolvedValue([
        { id: 'm1', name: 'Futsal', minAge: 14, maxAge: null, maxSpots: 40, requiresMembership: true, coordinatorName: 'Jow', createdAt: '2026-01-01' },
        { id: 'm2', name: 'Natação', minAge: 9, maxAge: null, maxSpots: null, requiresMembership: true, coordinatorName: 'Jow', createdAt: '2026-01-01' },
      ]),
    },
    participants: { register: vi.fn() },
    admin: {
      login: vi.fn(),
      getParticipants: vi.fn().mockResolvedValue([]),
      deleteParticipant: vi.fn(),
      updateParticipant: vi.fn(),
      getByModality: vi.fn().mockResolvedValue([]),
      getStats: vi.fn().mockResolvedValue({
        totalParticipants: 42,
        genderCount: { MASCULINO: 25, FEMININO: 17 },
        memberCount: { SIM: 20, NAO: 12, GR: 10 },
        paymentCount: { PENDENTE: 15, PAGO: 22, CANCELADO: 5 },
        ageGroups: { '3-9': 5, '10-13': 8, '14-17': 12, '18+': 17 },
        modalityStats: [
          { id: 'm1', name: 'Futsal', count: 30, maxSpots: 40 },
          { id: 'm2', name: 'Natação', count: 12, maxSpots: null },
        ],
        revenue: { estimated: 633.78, actual: 331.98 },
      }),
    },
  },
}));

vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
  return {
    ...actual,
    useAuthContext: () => ({
      token: 'fake-token', user: { id: '1', name: 'Admin Test', email: 'admin@test.com' },
      isAuthenticated: true, loading: false, error: null, login: vi.fn(), logout: vi.fn(),
    }),
  };
});

describe('AdminDashboard', () => {
  beforeEach(() => { renderWithProviders(<AdminDashboard />); });

  it('renders sidebar with nav buttons', () => {
    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
    expect(screen.getAllByText('Modalidades').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Estatísticas')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
  });

  it('renders admin name and logout', () => {
    expect(screen.getByText('Admin Test')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('renders export button', () => {
    expect(screen.getByText('Exportar todas (Excel)')).toBeInTheDocument();
  });

  it('renders modality search', () => {
    expect(screen.getByPlaceholderText('Buscar modalidade...')).toBeInTheDocument();
  });
});
