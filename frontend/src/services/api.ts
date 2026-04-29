import type { Modality, Participant, PaymentStatus, RegistrationFormData } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
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
      fetch(`${BASE_URL}/admin/participants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
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
    getStats: (token: string, isMember?: "SIM" | "NAO" | "GR") => {
      const query = isMember ? `?isMember=${isMember}` : "";
      return request<{
        totalParticipants: number;
        genderCount: { MASCULINO: number; FEMININO: number };
        memberCount: { SIM: number; NAO: number; GR: number };
        ageGroups: { "3-9": number; "10-13": number; "14-17": number; "18+": number };
        modalityStats: { id: string; name: string; count: number; maxSpots: number | null }[];
      }>(`/admin/stats${query}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};
