import { describe, it, expect } from "vitest";
import { normalizeDecimal, xícarasSchema, calculateCupConversion } from "./xicaras";

describe("normalizeDecimal", () => {
  it("substitui vírgula por ponto", () => {
    expect(normalizeDecimal("1,5")).toBe("1.5");
  });

  it("prefixa '0' quando a string começa com '.'", () => {
    expect(normalizeDecimal(".5")).toBe("0.5");
  });

  it("mantém ponto já presente", () => {
    expect(normalizeDecimal("2.5")).toBe("2.5");
  });

  it("mantém string sem separador decimal", () => {
    expect(normalizeDecimal("2")).toBe("2");
  });

  it("remove espaços periféricos", () => {
    expect(normalizeDecimal("  2,0  ")).toBe("2.0");
  });
});

describe("xícarasSchema", () => {
  it("campo vazio → erro obrigatório", async () => {
    const result = await xícarasSchema.safeParseAsync("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe a quantidade de xícaras.");
    }
  });

  it("só espaços → erro obrigatório", async () => {
    const result = await xícarasSchema.safeParseAsync("   ");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe a quantidade de xícaras.");
    }
  });

  it("string não numérica → erro de formato", async () => {
    const result = await xícarasSchema.safeParseAsync("abc");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe um número válido.");
    }
  });

  it("zero → erro menor que zero", async () => {
    const result = await xícarasSchema.safeParseAsync("0");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("O valor deve ser maior que zero.");
    }
  });

  it("negativo → erro menor que zero", async () => {
    const result = await xícarasSchema.safeParseAsync("-1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("O valor deve ser maior que zero.");
    }
  });

  it("acima do máximo (10000) → erro de máximo", async () => {
    const result = await xícarasSchema.safeParseAsync("10000");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "O valor excede o máximo permitido (9999 xícaras)."
      );
    }
  });

  it("exatamente 9999 → válido", async () => {
    const result = await xícarasSchema.safeParseAsync("9999");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(9999);
    }
  });

  it("mais de duas casas decimais → erro de precisão", async () => {
    const result = await xícarasSchema.safeParseAsync("1.123");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Use no máximo duas casas decimais.");
    }
  });

  it("fracionário válido 0.25 → válido", async () => {
    const result = await xícarasSchema.safeParseAsync("0.25");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(0.25);
    }
  });

  it("fracionário válido 0.5 → válido", async () => {
    const result = await xícarasSchema.safeParseAsync("0.5");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(0.5);
    }
  });

  it("valor inteiro 2 → válido com número 2", async () => {
    const result = await xícarasSchema.safeParseAsync("2");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(2);
    }
  });

  it("prioridade: vazio antes de não-numérico (campo vazio retorna erro de obrigatório)", async () => {
    const result = await xícarasSchema.safeParseAsync("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe a quantidade de xícaras.");
    }
  });
});

describe("calculateCupConversion", () => {
  it("1 xícara → 240 ml e 1.2 copos", () => {
    expect(calculateCupConversion(1)).toEqual({ ml: 240, copos: 1.2 });
  });

  it("0.25 xícara → 60 ml e 0.3 copos", () => {
    expect(calculateCupConversion(0.25)).toEqual({ ml: 60, copos: 0.3 });
  });

  it("0.3 xícara → 72 ml e 0.4 copos", () => {
    expect(calculateCupConversion(0.3)).toEqual({ ml: 72, copos: 0.4 });
  });

  it("2 xícaras → 480 ml e 2.4 copos", () => {
    expect(calculateCupConversion(2)).toEqual({ ml: 480, copos: 2.4 });
  });

  it("1.5 xícaras → 360 ml e 1.8 copos", () => {
    expect(calculateCupConversion(1.5)).toEqual({ ml: 360, copos: 1.8 });
  });
});
