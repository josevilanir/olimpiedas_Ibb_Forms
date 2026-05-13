import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Gender, MembershipStatus, PaymentStatus } from "../generated/prisma/client";
import { AppError } from "../errors/AppError";
import { findUserByEmail, findUserById } from "../repositories/user.repository";
import {
  findParticipants,
  deleteParticipant,
  updateParticipant,
} from "../repositories/participant.repository";
import { findModalitiesWithParticipants } from "../repositories/modality.repository";

export async function loginAdmin(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError("INVALID_CREDENTIALS", 401, "Credenciais inválidas.");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError("INVALID_CREDENTIALS", 401, "Credenciais inválidas.");

  const token = jwt.sign({ adminId: user.id }, process.env.JWT_SECRET ?? "", { expiresIn: "8h" });
  return { token, admin: { id: user.id, name: user.name, email: user.email } };
}

export async function getAdminById(id: string) {
  const user = await findUserById(id);
  if (!user) throw new AppError("USER_NOT_FOUND", 404, "Usuário não encontrado.");
  return user;
}

export async function listParticipants(modalityId?: string) {
  return findParticipants(modalityId);
}

export async function deleteParticipantById(id: string) {
  return deleteParticipant(id);
}

export async function updateParticipantById(
  id: string,
  data: Partial<{
    fullName: string;
    parentName: string;
    whatsapp: string;
    gender: Gender;
    isMember: MembershipStatus;
    healthIssues: string;
    birthDate: string;
    paymentStatus: PaymentStatus;
    modalityIds: string[];
  }>
) {
  return updateParticipant(id, data);
}

export async function getParticipantsByModality() {
  return findModalitiesWithParticipants();
}
