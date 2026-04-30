export type MembershipStatus = "SIM" | "NAO" | "GR";
export type Gender = "MASCULINO" | "FEMININO";
export type PaymentStatus = "PENDENTE" | "PAGO" | "CANCELADO";

export interface Modality {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
  maxSpots: number | null;
  requiresMembership: boolean;
  coordinatorName: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  participantId: string;
  modalityId: string;
  createdAt: string;
  modality: Modality;
}

export interface Participant {
  id: string;
  isForChild: boolean;
  isMember: MembershipStatus;
  birthDate: string;
  fullName: string;
  parentName: string | null;
  whatsapp: string;
  gender: Gender;
  healthIssues: string | null;
  termsAccepted: boolean;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  createdAt: string;
  subscriptions: Subscription[];
}

export interface RegistrationFormData {
  isForChild: boolean;
  isMember: MembershipStatus;
  birthDate: string;
  fullName: string;
  parentName?: string;
  whatsapp: string;
  gender: Gender | "";
  healthIssues?: string;
  termsAccepted: boolean;
  modalityIds: string[];
}

export interface Stats {
  totalParticipants: number;
  genderCount: { MASCULINO: number; FEMININO: number };
  memberCount: { SIM: number; NAO: number; GR: number };
  paymentCount: { PENDENTE: number; PAGO: number; CANCELADO: number };
  ageGroups: { "3-9": number; "10-13": number; "14-17": number; "18+": number };
  modalityStats: { id: string; name: string; count: number; maxSpots: number | null }[];
  revenue: { estimated: number; actual: number };
}
