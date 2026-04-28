export type MembershipStatus = "SIM" | "NAO" | "GR";
export type Gender = "MASCULINO" | "FEMININO";

export interface Modality {
  id: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
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
