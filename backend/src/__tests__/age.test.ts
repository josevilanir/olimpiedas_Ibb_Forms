import { calculateAge, isEligibleForModality } from "../utils/age";

describe("calculateAge", () => {
  it("returns correct age for a birthday that already passed this year", () => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 20);
    birthDate.setMonth(birthDate.getMonth() - 1);
    expect(calculateAge(birthDate)).toBe(20);
  });

  it("returns correct age when birthday hasn't happened yet this year", () => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 20);
    birthDate.setMonth(birthDate.getMonth() + 1);
    expect(calculateAge(birthDate)).toBe(19);
  });

  it("returns 0 for a newborn today", () => {
    expect(calculateAge(new Date())).toBe(0);
  });
});

describe("isEligibleForModality", () => {
  it("allows access to open modality (Corrida) for non-member of any age", () => {
    expect(isEligibleForModality(25, false, null, null, false)).toBe(true);
  });

  it("blocks non-member from membership-required modality", () => {
    expect(isEligibleForModality(25, false, 14, null, true)).toBe(false);
  });

  it("blocks underage participant from adult modality", () => {
    expect(isEligibleForModality(10, true, 14, null, true)).toBe(false);
  });

  it("blocks overage participant from kids modality", () => {
    expect(isEligibleForModality(12, true, 3, 9, true)).toBe(false);
  });

  it("allows eligible member in age range", () => {
    expect(isEligibleForModality(16, true, 14, null, true)).toBe(true);
  });

  it("allows kids modality for participant at min age", () => {
    expect(isEligibleForModality(3, true, 3, 9, true)).toBe(true);
  });

  it("allows kids modality for participant at max age", () => {
    expect(isEligibleForModality(9, true, 3, 9, true)).toBe(true);
  });

  it("blocks non-member even within age range", () => {
    expect(isEligibleForModality(7, false, 3, 9, true)).toBe(false);
  });

  it("allows GR member (treated as member = true)", () => {
    expect(isEligibleForModality(20, true, 14, null, true)).toBe(true);
  });
});
