import { useEffect, useRef } from "react";
import type { RegistrationFormData } from "../types";

const STORAGE_KEY = "olimpiadas_ibb_form";

interface PersistedState {
  form: RegistrationFormData;
  currentStep: number;
  paymentDisclaimerStep: number;
}

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function clearPersistedState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useFormPersistence(state: PersistedState) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 300);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state]);
}
