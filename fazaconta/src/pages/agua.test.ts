import { describe, it, expect } from "vitest";
import { normalizeDecimal, pesoAguaSchema, calculateWaterIntake } from "./agua";

describe("normalizeDecimal", () => {
  it("substitui vírgula por ponto", () => {
    expect(normalizeDecimal("70,5")).toBe("70.5");
  });

  it("prefixa '0' quando a string começa com '.'", () => {
    expect(normalizeDecimal(".5")).toBe("0.5");
  });

  it("mantém ponto já presente", () => {
    expect(normalizeDecimal("70.5")).toBe("70.5");
  });

  it("mantém string sem separador decimal", () => {
    expect(normalizeDecimal("70")).toBe("70");
  });
});

describe("pesoAguaSchema", () => {
  it("campo vazio → erro de obrigatoriedade", async () => {
    const result = await pesoAguaSchema.safeParseAsync("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe o peso corporal");
    }
  });

  it("string não numérica → erro de formato", async () => {
    const result = await pesoAguaSchema.safeParseAsync("abc");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Insira um número válido");
    }
  });

  it("19 → erro de intervalo", async () => {
    const result = await pesoAguaSchema.safeParseAsync("19");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Peso fora do intervalo permitido (20 kg a 300 kg)"
      );
    }
  });

  it("301 → erro de intervalo", async () => {
    const result = await pesoAguaSchema.safeParseAsync("301");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Peso fora do intervalo permitido (20 kg a 300 kg)"
      );
    }
  });

  it("'70,555' normalizado → erro de precisão", async () => {
    const normalized = normalizeDecimal("70,555");
    const result = await pesoAguaSchema.safeParseAsync(normalized);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Máximo de 2 casas decimais permitidas"
      );
    }
  });

  it("'70,5' normalizado → válido com valor 70.5", async () => {
    const normalized = normalizeDecimal("70,5");
    const result = await pesoAguaSchema.safeParseAsync(normalized);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(70.5);
    }
  });
});

describe("calculateWaterIntake", () => {
  it("70 kg → { ml: 2450, litros: 2.45, copos: 10 }", () => {
    expect(calculateWaterIntake(70)).toEqual({ ml: 2450, litros: 2.45, copos: 10 });
  });

  it("20 kg → { ml: 700, litros: 0.7, copos: 3 }", () => {
    expect(calculateWaterIntake(20)).toEqual({ ml: 700, litros: 0.7, copos: 3 });
  });

  it("300 kg → { ml: 10500, litros: 10.5, copos: 42 }", () => {
    expect(calculateWaterIntake(300)).toEqual({ ml: 10500, litros: 10.5, copos: 42 });
  });
});
