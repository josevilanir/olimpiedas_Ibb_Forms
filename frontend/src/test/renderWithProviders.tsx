import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '../contexts/AuthContext';
import type { ReactElement, ReactNode } from 'react';

/**
 * Wrapper with all providers needed by the app (Router + Auth).
 */
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthProvider>
  );
}

/**
 * Custom render that wraps the UI in all app providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { render };
