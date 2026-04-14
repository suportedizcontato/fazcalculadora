import { describe, it, expect } from "vitest";
import { calcHorasExtras } from "./horas-extras";
import type { HorasExtrasInput } from "./horas-extras";
import { horasExtrasSchema, SALARIO_MINIMO_2025 } from "./horas-extras.schemas";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseInput: HorasExtrasInput = {
  salario: 3000,
  jornadaDiaria: 8,
  diasSemana: 5,
  horasExtrasUteis: 0,
  horasExtrasFeriado: 0,
  horasNoturnas: 0,
  horasExtrasNoturnas: 0,
  horasExtrasNoturnasFerias: 0,
};

// valorHoraNormal = 3000 / (8 × 5 × 4.333) = 3000 / 173.32
const valorHoraNormal = 3000 / (8 * 5 * 4.333);

// ─── SALARIO_MINIMO_2025 ───────────────────────────────────────────────────────

describe("SALARIO_MINIMO_2025", () => {
  it("vale 1518", () => {
    expect(SALARIO_MINIMO_2025).toBe(1518);
  });
});

// ─── calcHorasExtras: valorHoraNormal ────────────────────────────────────────

describe("calcHorasExtras — valorHoraNormal", () => {
  it("calcula valorHoraNormal = salario / (jornadaDiaria × diasSemana × 4.333)", () => {
    const r = calcHorasExtras(baseInput);
    expect(r.valorHoraNormal).toBeCloseTo(valorHoraNormal, 6);
  });

  it("jornada 6h/dia 6 dias altera valorHoraNormal proporcionalmente", () => {
    const input: HorasExtrasInput = { ...baseInput, jornadaDiaria: 6, diasSemana: 6 };
    const r = calcHorasExtras(input);
    const expected = 3000 / (6 * 6 * 4.333);
    expect(r.valorHoraNormal).toBeCloseTo(expected, 6);
  });
});

// ─── calcHorasExtras: tudo zerado ────────────────────────────────────────────

describe("calcHorasExtras — todos os campos em zero", () => {
  it("totalGeral = 0 quando todos os campos de horas são zero", () => {
    const r = calcHorasExtras(baseInput);
    expect(r.totalGeral).toBe(0);
    expect(r.subtotalHE50).toBe(0);
    expect(r.subtotalHE100).toBe(0);
    expect(r.subtotalAdicionalNoturno).toBe(0);
    expect(r.subtotalHENoturna50).toBe(0);
    expect(r.subtotalHENoturna100).toBe(0);
  });
});

// ─── calcHorasExtras: subtotalHE50 ───────────────────────────────────────────

describe("calcHorasExtras — HE 50% (dias úteis)", () => {
  it("subtotalHE50 = horasExtrasUteis × valorHoraNormal × 1.50", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasUteis: 10 };
    const r = calcHorasExtras(input);
    const expected = 10 * valorHoraNormal * 1.5;
    expect(r.subtotalHE50).toBeCloseTo(expected, 6);
  });

  it("subtotalHE50 é o único não-zero quando só horasExtrasUteis preenchido", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasUteis: 10 };
    const r = calcHorasExtras(input);
    expect(r.subtotalHE100).toBe(0);
    expect(r.subtotalAdicionalNoturno).toBe(0);
    expect(r.subtotalHENoturna50).toBe(0);
    expect(r.subtotalHENoturna100).toBe(0);
    expect(r.totalGeral).toBeCloseTo(r.subtotalHE50, 10);
  });
});

// ─── calcHorasExtras: subtotalHE100 ──────────────────────────────────────────

describe("calcHorasExtras — HE 100% (domingos/feriados)", () => {
  it("subtotalHE100 = horasExtrasFeriado × valorHoraNormal × 2.00", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasFeriado: 8 };
    const r = calcHorasExtras(input);
    const expected = 8 * valorHoraNormal * 2.0;
    expect(r.subtotalHE100).toBeCloseTo(expected, 6);
  });

  it("subtotalHE100 é o único não-zero quando só horasExtrasFeriado preenchido", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasFeriado: 8 };
    const r = calcHorasExtras(input);
    expect(r.subtotalHE50).toBe(0);
    expect(r.subtotalAdicionalNoturno).toBe(0);
    expect(r.subtotalHENoturna50).toBe(0);
    expect(r.subtotalHENoturna100).toBe(0);
    expect(r.totalGeral).toBeCloseTo(r.subtotalHE100, 10);
  });
});

// ─── calcHorasExtras: adicional noturno ──────────────────────────────────────

describe("calcHorasExtras — adicional noturno", () => {
  it("subtotalAdicionalNoturno = horasNoturnas × valorHoraNormal × 0.20", () => {
    const input: HorasExtrasInput = { ...baseInput, horasNoturnas: 20 };
    const r = calcHorasExtras(input);
    const expected = 20 * valorHoraNormal * 0.2;
    expect(r.subtotalAdicionalNoturno).toBeCloseTo(expected, 6);
  });

  it("subtotalAdicionalNoturno é o único não-zero quando só horasNoturnas preenchido", () => {
    const input: HorasExtrasInput = { ...baseInput, horasNoturnas: 20 };
    const r = calcHorasExtras(input);
    expect(r.subtotalHE50).toBe(0);
    expect(r.subtotalHE100).toBe(0);
    expect(r.subtotalHENoturna50).toBe(0);
    expect(r.subtotalHENoturna100).toBe(0);
    expect(r.totalGeral).toBeCloseTo(r.subtotalAdicionalNoturno, 10);
  });
});

// ─── calcHorasExtras: HE noturna cumulativa (dias úteis) ─────────────────────

describe("calcHorasExtras — HE noturna cumulativa (dias úteis)", () => {
  it("subtotalHENoturna50 = horasExtrasNoturnas × valorHoraNormal × 1.50 × 1.20", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasNoturnas: 5 };
    const r = calcHorasExtras(input);
    const expected = 5 * valorHoraNormal * 1.5 * 1.2;
    expect(r.subtotalHENoturna50).toBeCloseTo(expected, 6);
  });

  it("subtotalHENoturna50 é o único não-zero quando só horasExtrasNoturnas preenchido", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasNoturnas: 5 };
    const r = calcHorasExtras(input);
    expect(r.subtotalHE50).toBe(0);
    expect(r.subtotalHE100).toBe(0);
    expect(r.subtotalAdicionalNoturno).toBe(0);
    expect(r.subtotalHENoturna100).toBe(0);
    expect(r.totalGeral).toBeCloseTo(r.subtotalHENoturna50, 10);
  });
});

// ─── calcHorasExtras: HE noturna cumulativa (feriados) ───────────────────────

describe("calcHorasExtras — HE noturna cumulativa (feriados)", () => {
  it("subtotalHENoturna100 = horasExtrasNoturnasFerias × valorHoraNormal × 2.00 × 1.20", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasNoturnasFerias: 3 };
    const r = calcHorasExtras(input);
    const expected = 3 * valorHoraNormal * 2.0 * 1.2;
    expect(r.subtotalHENoturna100).toBeCloseTo(expected, 6);
  });

  it("subtotalHENoturna100 é o único não-zero quando só horasExtrasNoturnasFerias preenchido", () => {
    const input: HorasExtrasInput = { ...baseInput, horasExtrasNoturnasFerias: 3 };
    const r = calcHorasExtras(input);
    expect(r.subtotalHE50).toBe(0);
    expect(r.subtotalHE100).toBe(0);
    expect(r.subtotalAdicionalNoturno).toBe(0);
    expect(r.subtotalHENoturna50).toBe(0);
    expect(r.totalGeral).toBeCloseTo(r.subtotalHENoturna100, 10);
  });
});

// ─── calcHorasExtras: totalGeral ─────────────────────────────────────────────

describe("calcHorasExtras — totalGeral", () => {
  it("totalGeral = soma de todos os subtotais quando todos preenchidos", () => {
    const input: HorasExtrasInput = {
      salario: 3000,
      jornadaDiaria: 8,
      diasSemana: 5,
      horasExtrasUteis: 10,
      horasExtrasFeriado: 8,
      horasNoturnas: 20,
      horasExtrasNoturnas: 5,
      horasExtrasNoturnasFerias: 3,
    };
    const r = calcHorasExtras(input);
    const expected =
      r.subtotalHE50 +
      r.subtotalHE100 +
      r.subtotalAdicionalNoturno +
      r.subtotalHENoturna50 +
      r.subtotalHENoturna100;
    expect(r.totalGeral).toBeCloseTo(expected, 10);
  });

  it("totalGeral com valores conhecidos (salario 3000, HE 50% = 10h)", () => {
    // valorHoraNormal = 3000 / (8 * 5 * 4.333) ≈ 17.308
    // subtotalHE50 = 10 * 17.308 * 1.5 ≈ 259.62
    const input: HorasExtrasInput = { ...baseInput, horasExtrasUteis: 10 };
    const r = calcHorasExtras(input);
    const vhn = 3000 / (8 * 5 * 4.333);
    expect(r.totalGeral).toBeCloseTo(10 * vhn * 1.5, 6);
  });
});

// ─── horasExtrasSchema: validação Zod ────────────────────────────────────────

describe("horasExtrasSchema — validação", () => {
  it("aceita dados mínimos válidos (só salario; horas em default 0)", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasSemana: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.horasExtrasUteis).toBe(0);
      expect(result.data.horasExtrasFeriado).toBe(0);
    }
  });

  it("rejeita salário zero", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "0",
      jornadaDiaria: 8,
      diasSemana: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita salário negativo", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "-1000",
      jornadaDiaria: 8,
      diasSemana: 5,
    });
    expect(result.success).toBe(false);
  });

  it("aceita salário abaixo do mínimo (aviso é na UI, não no schema)", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "1000",
      jornadaDiaria: 8,
      diasSemana: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita horas negativas", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasSemana: 5,
      horasExtrasUteis: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita horas acima de 744 (limite por campo)", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasSemana: 5,
      horasExtrasUteis: 745,
    });
    expect(result.success).toBe(false);
  });

  it("aceita vírgula decimal no salário (normalizeDecimal)", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "3000,50",
      jornadaDiaria: 8,
      diasSemana: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBeCloseTo(3000.5, 2);
    }
  });

  it("rejeita jornadaDiaria menor que 1", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 0,
      diasSemana: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita diasSemana maior que 7", () => {
    const result = horasExtrasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasSemana: 8,
    });
    expect(result.success).toBe(false);
  });
});
