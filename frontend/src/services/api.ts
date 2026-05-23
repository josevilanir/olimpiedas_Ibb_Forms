import type { Modality, Participant, PaymentStatus, RegistrationFormData, Stats } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Sem conexão com o servidor. Verifique sua internet e tente novamente.");
  }

  if (res.status === 401) {
    if (path === "/admin/login") {
      const body = await res.json() as { data?: T; error?: string };
      throw new Error(body.error ?? "Credenciais inválidas.");
    }
    onUnauthorized?.();
    throw new Error("Sessão expirada. Por favor, faça login novamente.");
  }

  if (res.status === 429) {
    throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  }

  const body = await res.json() as { data?: T; error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? "Erro desconhecido.");
  }
  return body.data as T;
}

export const api = {
  modalities: {
    list: () => request<Modality[]>("/modalities"),
  },
  participants: {
    register: (data: RegistrationFormData) =>
      request<Participant>("/participants", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  admin: {
    login: (email: string, password: string) =>
      request<{ token: string; admin: { id: string; name: string; email: string } }>(
        "/admin/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      ),
    getMe: (token: string) =>
      request<{ id: string; name: string; email: string }>("/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getParticipants: (token: string, modalityId?: string) => {
      const query = modalityId ? `?modalityId=${modalityId}` : "";
      return request<Participant[]>(`/admin/participants${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    deleteParticipant: (token: string, id: string) =>
      request<{ message: string }>(`/admin/participants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateParticipant: (
      token: string,
      id: string,
      data: Partial<RegistrationFormData & { paymentStatus: PaymentStatus }>
    ) =>
      request<Participant>(`/admin/participants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    getByModality: (token: string) =>
      request<unknown[]>("/admin/modalities/participants", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
    getStats: (token: string, isMember?: "SIM" | "NAO" | "GR", modalityId?: string) => {
      const params = new URLSearchParams();
      if (isMember) params.set("isMember", isMember);
      if (modalityId) params.set("modalityId", modalityId);
      const query = params.size ? `?${params}` : "";
      return request<Stats>(`/admin/stats${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};
