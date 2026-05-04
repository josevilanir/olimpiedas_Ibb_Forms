import { clsx, type ClassValue } from 'clsx';

/**
 * Utility to merge class names conditionally.
 * Note: tailwind-merge is not included as the project does not use Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
