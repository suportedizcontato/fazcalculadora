import { describe, it, expect } from "vitest";
import { rescisaoSchema, feriasSchema, decimoSchema } from "./rescisao.schemas";

// ─── Task 2.1: rescisaoSchema ─────────────────────────────────────────────────

describe("rescisaoSchema", () => {
  const valid = {
    salario: "3000",
    tipoDesligamento: "sem-justa-causa",
    anos: 2,
    meses: 3,
    diasTrabalhados: 15,
    meses13: 3,
    avisoPrevioCumprido: true,
  };

  it("aceita input válido e retorna tipos corretos", () => {
    const result = rescisaoSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBe(3000);
      expect(typeof result.data.salario).toBe("number");
      expect(result.data.tipoDesligamento).toBe("sem-justa-causa");
      expect(result.data.avisoPrevioCumprido).toBe(true);
    }
  });

  it("aceita vírgula como separador decimal no salário", () => {
    const result = rescisaoSchema.safeParse({ ...valid, salario: "3500,50" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.salario).toBeCloseTo(3500.50, 2);
  });

  it("aceita ponto como separador decimal no salário", () => {
    const result = rescisaoSchema.safeParse({ ...valid, salario: "3500.50" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.salario).toBeCloseTo(3500.50, 2);
  });

  it("rejeita salário zero", () => {
    const result = rescisaoSchema.safeParse({ ...valid, salario: "0" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário negativo", () => {
    const result = rescisaoSchema.safeParse({ ...valid, salario: "-100" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário vazio", () => {
    const result = rescisaoSchema.safeParse({ ...valid, salario: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário não numérico", () => {
    const result = rescisaoSchema.safeParse({ ...valid, salario: "abc" });
    expect(result.success).toBe(false);
  });

  it("aceita todos os quatro tiposDesligamento", () => {
    const tipos = ["sem-justa-causa", "pedido-demissao", "justa-causa", "acordo-mutuo"];
    for (const tipo of tipos) {
      const result = rescisaoSchema.safeParse({ ...valid, tipoDesligamento: tipo });
      expect(result.success).toBe(true);
    }
  });

  it("rejeita tipoDesligamento inválido", () => {
    const result = rescisaoSchema.safeParse({ ...valid, tipoDesligamento: "invalido" });
    expect(result.success).toBe(false);
  });

  it("aceita anos = 0", () => {
    const result = rescisaoSchema.safeParse({ ...valid, anos: 0 });
    expect(result.success).toBe(true);
  });

  it("rejeita anos negativos", () => {
    const result = rescisaoSchema.safeParse({ ...valid, anos: -1 });
    expect(result.success).toBe(false);
  });

  it("aceita meses = 0", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses: 0 });
    expect(result.success).toBe(true);
  });

  it("aceita meses = 11", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses: 11 });
    expect(result.success).toBe(true);
  });

  it("rejeita meses = 12", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses: 12 });
    expect(result.success).toBe(false);
  });

  it("rejeita meses negativos", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses: -1 });
    expect(result.success).toBe(false);
  });

  it("aceita diasTrabalhados = 1", () => {
    const result = rescisaoSchema.safeParse({ ...valid, diasTrabalhados: 1 });
    expect(result.success).toBe(true);
  });

  it("aceita diasTrabalhados = 31", () => {
    const result = rescisaoSchema.safeParse({ ...valid, diasTrabalhados: 31 });
    expect(result.success).toBe(true);
  });

  it("rejeita diasTrabalhados = 0", () => {
    const result = rescisaoSchema.safeParse({ ...valid, diasTrabalhados: 0 });
    expect(result.success).toBe(false);
  });

  it("rejeita diasTrabalhados = 32", () => {
    const result = rescisaoSchema.safeParse({ ...valid, diasTrabalhados: 32 });
    expect(result.success).toBe(false);
  });

  it("aceita meses13 = 1", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses13: 1 });
    expect(result.success).toBe(true);
  });

  it("aceita meses13 = 12", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses13: 12 });
    expect(result.success).toBe(true);
  });

  it("rejeita meses13 = 0", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses13: 0 });
    expect(result.success).toBe(false);
  });

  it("rejeita meses13 = 13", () => {
    const result = rescisaoSchema.safeParse({ ...valid, meses13: 13 });
    expect(result.success).toBe(false);
  });

  it("avisoPrevioCumprido tem default true", () => {
    const { avisoPrevioCumprido: _, ...withoutAviso } = valid;
    const result = rescisaoSchema.safeParse(withoutAviso);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.avisoPrevioCumprido).toBe(true);
  });
});

// ─── Task 2.2: feriasSchema ───────────────────────────────────────────────────

describe("feriasSchema", () => {
  const valid = {
    salario: "3000",
    mesesAquisitivos: 6,
    solicitarAbono: false,
  };

  it("aceita input válido", () => {
    const result = feriasSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBe(3000);
      expect(result.data.mesesAquisitivos).toBe(6);
      expect(result.data.solicitarAbono).toBe(false);
    }
  });

  it("aceita vírgula no salário", () => {
    const result = feriasSchema.safeParse({ ...valid, salario: "3500,99" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.salario).toBeCloseTo(3500.99, 2);
  });

  it("rejeita salário zero", () => {
    const result = feriasSchema.safeParse({ ...valid, salario: "0" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário negativo", () => {
    const result = feriasSchema.safeParse({ ...valid, salario: "-500" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário vazio", () => {
    const result = feriasSchema.safeParse({ ...valid, salario: "" });
    expect(result.success).toBe(false);
  });

  it("aceita mesesAquisitivos = 1", () => {
    const result = feriasSchema.safeParse({ ...valid, mesesAquisitivos: 1 });
    expect(result.success).toBe(true);
  });

  it("aceita mesesAquisitivos = 12", () => {
    const result = feriasSchema.safeParse({ ...valid, mesesAquisitivos: 12 });
    expect(result.success).toBe(true);
  });

  it("rejeita mesesAquisitivos = 0", () => {
    const result = feriasSchema.safeParse({ ...valid, mesesAquisitivos: 0 });
    expect(result.success).toBe(false);
  });

  it("rejeita mesesAquisitivos = 13", () => {
    const result = feriasSchema.safeParse({ ...valid, mesesAquisitivos: 13 });
    expect(result.success).toBe(false);
  });

  it("solicitarAbono tem default false", () => {
    const { solicitarAbono: _, ...withoutAbono } = valid;
    const result = feriasSchema.safeParse(withoutAbono);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.solicitarAbono).toBe(false);
  });
});

// ─── Task 2.2: decimoSchema ───────────────────────────────────────────────────

describe("decimoSchema", () => {
  const valid = {
    salario: "3000",
    mesesTrabalhados: 6,
  };

  it("aceita input válido", () => {
    const result = decimoSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBe(3000);
      expect(result.data.mesesTrabalhados).toBe(6);
    }
  });

  it("aceita vírgula no salário", () => {
    const result = decimoSchema.safeParse({ ...valid, salario: "2800,00" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.salario).toBeCloseTo(2800, 2);
  });

  it("rejeita salário zero", () => {
    const result = decimoSchema.safeParse({ ...valid, salario: "0" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário negativo", () => {
    const result = decimoSchema.safeParse({ ...valid, salario: "-1000" });
    expect(result.success).toBe(false);
  });

  it("rejeita salário vazio", () => {
    const result = decimoSchema.safeParse({ ...valid, salario: "" });
    expect(result.success).toBe(false);
  });

  it("aceita mesesTrabalhados = 1", () => {
    const result = decimoSchema.safeParse({ ...valid, mesesTrabalhados: 1 });
    expect(result.success).toBe(true);
  });

  it("aceita mesesTrabalhados = 12", () => {
    const result = decimoSchema.safeParse({ ...valid, mesesTrabalhados: 12 });
    expect(result.success).toBe(true);
  });

  it("rejeita mesesTrabalhados = 0", () => {
    const result = decimoSchema.safeParse({ ...valid, mesesTrabalhados: 0 });
    expect(result.success).toBe(false);
  });

  it("rejeita mesesTrabalhados = 13", () => {
    const result = decimoSchema.safeParse({ ...valid, mesesTrabalhados: 13 });
    expect(result.success).toBe(false);
  });
});
