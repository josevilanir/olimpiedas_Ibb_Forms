import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import LoginPage from '../pages/LoginPage';

// Mock the auth context
vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
  let mockLogin = vi.fn();
  let mockError: string | null = null;
  let mockLoading = false;
  let mockIsAuthenticated = false;

  return {
    ...actual,
    useAuthContext: () => ({
      token: mockIsAuthenticated ? 'fake-token' : null,
      user: mockIsAuthenticated ? { id: '1', name: 'Admin', email: 'admin@test.com' } : null,
      isAuthenticated: mockIsAuthenticated,
      loading: mockLoading,
      error: mockError,
      login: mockLogin,
      logout: vi.fn(),
    }),
    __setMockLogin: (fn: typeof mockLogin) => { mockLogin = fn; },
    __setMockError: (err: string | null) => { mockError = err; },
    __setMockLoading: (l: boolean) => { mockLoading = l; },
    __setMockIsAuthenticated: (a: boolean) => { mockIsAuthenticated = a; },
  };
});

const getAuthMock = async () => await import('../contexts/AuthContext') as any;

describe('LoginPage', () => {
  beforeEach(async () => {
    const mocks = await getAuthMock();
    mocks.__setMockError(null);
    mocks.__setMockLoading(false);
    mocks.__setMockIsAuthenticated(false);
    mocks.__setMockLogin(vi.fn());
  });

  it('renders the login form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Painel Administrativo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu-email@exemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Entrar no Painel →')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByAltText('Olimpíadas IBB')).toBeInTheDocument();
  });

  it('updates email and password fields', () => {
    renderWithProviders(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('seu-email@exemplo.com') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login on form submit', async () => {
    const mocks = await getAuthMock();
    const mockLogin = vi.fn();
    mocks.__setMockLogin(mockLogin);

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('seu-email@exemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByText('Entrar no Painel →');

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'secret');
    });
  });

  it('displays error message when auth fails', async () => {
    const mocks = await getAuthMock();
    mocks.__setMockError('Credenciais inválidas');
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
  });

  it('shows loading state on submit button', async () => {
    const mocks = await getAuthMock();
    mocks.__setMockLoading(true);
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Verificando...')).toBeInTheDocument();
    expect(screen.getByText('Verificando...').closest('button')).toBeDisabled();
  });
});
