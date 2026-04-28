import request from "supertest";
import app from "../app";

describe("POST /api/v1/participants", () => {
  it("rejects when terms not accepted", async () => {
    const res = await request(app).post("/api/v1/participants").send({
      isForChild: false,
      isMember: "SIM",
      birthDate: "1995-01-01",
      fullName: "João Teste",
      whatsapp: "11999999999",
      gender: "MASCULINO",
      termsAccepted: false,
      modalityIds: [],
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/termos/i);
  });

  it("rejects when no modality selected", async () => {
    const res = await request(app).post("/api/v1/participants").send({
      isForChild: false,
      isMember: "SIM",
      birthDate: "1995-01-01",
      fullName: "João Teste",
      whatsapp: "11999999999",
      gender: "MASCULINO",
      termsAccepted: true,
      modalityIds: [],
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/modalidade/i);
  });

  it("rejects invalid birth date", async () => {
    const res = await request(app).post("/api/v1/participants").send({
      isForChild: false,
      isMember: "SIM",
      birthDate: "not-a-date",
      fullName: "João Teste",
      whatsapp: "11999999999",
      gender: "MASCULINO",
      termsAccepted: true,
      modalityIds: ["some-id"],
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/data de nascimento/i);
  });

  it("rejects non-existent modality id", async () => {
    const res = await request(app).post("/api/v1/participants").send({
      isForChild: false,
      isMember: "SIM",
      birthDate: "1995-06-15",
      fullName: "João Teste",
      whatsapp: "11999999999",
      gender: "MASCULINO",
      termsAccepted: true,
      modalityIds: ["00000000-0000-0000-0000-000000000000"],
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/modalidade inválida/i);
  });
});

describe("POST /api/v1/admin/login", () => {
  it("rejects wrong credentials", async () => {
    const res = await request(app).post("/api/v1/admin/login").send({
      email: "wrong@ibb.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciais/i);
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/v1/admin/login").send({ email: "admin@ibb.com" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/admin/participants", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/v1/admin/participants");
    expect(res.status).toBe(401);
  });

  it("rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/admin/participants")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });
});
