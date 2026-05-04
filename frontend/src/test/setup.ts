import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// ── Mock static asset imports (images, etc.) ──
vi.mock('../assets/olimpiedas_logo-removebg-preview.png', () => ({ default: 'logo.png' }));
vi.mock('../assets/galery/20250531_154713.jpg', () => ({ default: 'galery1.jpg' }));
vi.mock('../assets/galery/20250601_092812.jpg', () => ({ default: 'galery2.jpg' }));
vi.mock('../assets/galery/DSC06671.jpeg', () => ({ default: 'galery3.jpg' }));
vi.mock('../assets/galery/IMG_7160.jpg', () => ({ default: 'galery4.jpg' }));
vi.mock('../assets/galery/IMG_7650.jpg', () => ({ default: 'galery5.jpg' }));

// ── Mock window.matchMedia ──
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mock IntersectionObserver ──
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// ── Mock window.print ──
Object.defineProperty(window, 'print', { writable: true, value: vi.fn() });

// ── Mock scrollIntoView ──
Element.prototype.scrollIntoView = vi.fn();

// ── Mock URL.createObjectURL / revokeObjectURL ──
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// ── Mock canvas-confetti ──
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// ── Mock generatePdf ──
vi.mock('../utils/generatePdf', () => ({
  generateComprovantePdf: vi.fn(),
}));
