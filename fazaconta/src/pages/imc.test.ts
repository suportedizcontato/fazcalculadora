import { describe, it, expect } from "vitest";
import { normalizeDecimal, pesoSchema, alturaSchema, getFirstErrorKey, calculateBMI, classifyBMI, IMC_DISCLAIMER, calculateMarkerPct } from "./imc";

describe("normalizeDecimal", () => {
  it("replaces comma with period as decimal separator", () => {
    expect(normalizeDecimal("70,5")).toBe("70.5");
  });

  it("prepends 0 when string starts with a period", () => {
    expect(normalizeDecimal(".75")).toBe("0.75");
  });

  it("prepends 0 when string starts with a comma", () => {
    expect(normalizeDecimal(",75")).toBe("0.75");
  });

  it("returns digits-only string unchanged", () => {
    expect(normalizeDecimal("70")).toBe("70");
  });

  it("returns empty string unchanged", () => {
    expect(normalizeDecimal("")).toBe("");
  });

  it("returns already-valid decimal string unchanged", () => {
    expect(normalizeDecimal("1.75")).toBe("1.75");
  });

  it("handles multiple commas by replacing all with periods", () => {
    // pathological input — replaces all, parseFloat will handle NaN downstream
    expect(normalizeDecimal("1,7,5")).toBe("1.7.5");
  });
});

describe("pesoSchema", () => {
  const parse = (v: string) => pesoSchema.safeParse(v);

  it("accepts a valid peso string", () => {
    expect(parse("70").success).toBe(true);
  });

  it("parsed value is a number", () => {
    const r = parse("70.5");
    expect(r.success && typeof r.data).toBe("number");
  });

  it("rejects empty string with required message", () => {
    const r = parse("  ");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/obrigatório/i);
  });

  it("rejects non-numeric string", () => {
    const r = parse("abc");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/número válido/i);
  });

  it("rejects zero", () => {
    const r = parse("0");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/maior.*zero|zero/i);
  });

  it("rejects negative value", () => {
    const r = parse("-10");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/maior.*zero|zero/i);
  });

  it("rejects peso above 500 kg", () => {
    const r = parse("501");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/implausível|improvável|inválido/i);
  });

  it("accepts 500 kg as upper boundary", () => {
    expect(parse("500").success).toBe(true);
  });

  it("rejects more than 2 decimal places", () => {
    const r = parse("70.123");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/decima|precisão/i);
  });

  it("accepts exactly 2 decimal places", () => {
    expect(parse("70.12").success).toBe(true);
  });

  it("accepts 1 decimal place", () => {
    expect(parse("70.5").success).toBe(true);
  });
});

describe("alturaSchema", () => {
  const parse = (v: string) => alturaSchema.safeParse(v);

  it("accepts a valid altura string", () => {
    expect(parse("1.75").success).toBe(true);
  });

  it("parsed value is a number", () => {
    const r = parse("1.75");
    expect(r.success && typeof r.data).toBe("number");
  });

  it("rejects empty string with required message", () => {
    const r = parse("  ");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/obrigatório/i);
  });

  it("rejects non-numeric string", () => {
    const r = parse("abc");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/número válido/i);
  });

  it("rejects zero", () => {
    const r = parse("0");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/maior.*zero|zero/i);
  });

  it("rejects negative value", () => {
    const r = parse("-1");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/maior.*zero|zero/i);
  });

  it("rejects altura above 3.0 m", () => {
    const r = parse("3.01");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/implausível|improvável|inválid/i);
  });

  it("accepts 3.0 m as upper boundary", () => {
    expect(parse("3").success).toBe(true);
  });

  it("rejects more than 2 decimal places", () => {
    const r = parse("1.753");
    expect(r.success).toBe(false);
    expect(!r.success && r.error.errors[0].message).toMatch(/decima|precisão/i);
  });

  it("accepts exactly 2 decimal places", () => {
    expect(parse("1.75").success).toBe(true);
  });

  it("accepts 1 decimal place", () => {
    expect(parse("1.8").success).toBe(true);
  });
});

describe("calculateBMI", () => {
  it("returns IMC rounded to 2 decimal places for typical values", () => {
    // 70 / (1.75 * 1.75) = 22.857142... → 22.86
    expect(calculateBMI(70, 1.75)).toBe(22.86);
  });

  it("returns a number type", () => {
    expect(typeof calculateBMI(80, 1.80)).toBe("number");
  });

  it("returns exactly 2 decimal places (no trailing zeros lost)", () => {
    // 90 / (1.80 * 1.80) = 27.777... → 27.78
    expect(calculateBMI(90, 1.8)).toBe(27.78);
  });

  it("handles edge case resulting in integer-like value", () => {
    // 50 / (1.00 * 1.00) = 50.00
    expect(calculateBMI(50, 1.0)).toBe(50);
  });

  it("boundary: 18.5 BMI classification range (50 / 1.644^2 ≈ 18.50)", () => {
    const imc = calculateBMI(50, 1.644);
    expect(imc).toBeGreaterThanOrEqual(18);
    expect(imc).toBeLessThan(19);
  });
});

describe("classifyBMI", () => {
  it("classifies BMI below 18.5 as Abaixo do peso with warning variant", () => {
    const result = classifyBMI(17);
    expect(result.label).toBe("Abaixo do peso");
    expect(result.variant).toBe("warning");
    expect(result.imc).toBe(17);
  });

  it("classifies BMI at 18.5 boundary as Peso normal with success variant", () => {
    const result = classifyBMI(18.5);
    expect(result.label).toBe("Peso normal");
    expect(result.variant).toBe("success");
  });

  it("classifies BMI 22 (mid normal range) as Peso normal", () => {
    const result = classifyBMI(22);
    expect(result.label).toBe("Peso normal");
    expect(result.variant).toBe("success");
  });

  it("classifies BMI at 24.9 as Peso normal", () => {
    const result = classifyBMI(24.9);
    expect(result.label).toBe("Peso normal");
    expect(result.variant).toBe("success");
  });

  it("classifies BMI at 25.0 as Sobrepeso with warning variant", () => {
    const result = classifyBMI(25.0);
    expect(result.label).toBe("Sobrepeso");
    expect(result.variant).toBe("warning");
  });

  it("classifies BMI 27 (mid sobrepeso) as Sobrepeso", () => {
    const result = classifyBMI(27);
    expect(result.label).toBe("Sobrepeso");
    expect(result.variant).toBe("warning");
  });

  it("classifies BMI at 29.9 as Sobrepeso", () => {
    const result = classifyBMI(29.9);
    expect(result.label).toBe("Sobrepeso");
    expect(result.variant).toBe("warning");
  });

  it("classifies BMI at 30.0 as Obesidade grau I with danger variant", () => {
    const result = classifyBMI(30.0);
    expect(result.label).toBe("Obesidade grau I");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI 32 (mid grau I) as Obesidade grau I", () => {
    const result = classifyBMI(32);
    expect(result.label).toBe("Obesidade grau I");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI at 34.9 as Obesidade grau I", () => {
    const result = classifyBMI(34.9);
    expect(result.label).toBe("Obesidade grau I");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI at 35.0 as Obesidade grau II with danger variant", () => {
    const result = classifyBMI(35.0);
    expect(result.label).toBe("Obesidade grau II");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI 37 (mid grau II) as Obesidade grau II", () => {
    const result = classifyBMI(37);
    expect(result.label).toBe("Obesidade grau II");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI at 39.9 as Obesidade grau II", () => {
    const result = classifyBMI(39.9);
    expect(result.label).toBe("Obesidade grau II");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI at 40.0 as Obesidade grau III with danger variant", () => {
    const result = classifyBMI(40.0);
    expect(result.label).toBe("Obesidade grau III");
    expect(result.variant).toBe("danger");
  });

  it("classifies BMI 45 (well above 40) as Obesidade grau III", () => {
    const result = classifyBMI(45);
    expect(result.label).toBe("Obesidade grau III");
    expect(result.variant).toBe("danger");
  });

  it("echoes the imc value back in the result", () => {
    const result = classifyBMI(22.86);
    expect(result.imc).toBe(22.86);
  });
});

describe("submit pipeline (calculateBMI + classifyBMI integration)", () => {
  it("produces Peso normal for 70 kg / 1.75 m (altura already in meters)", () => {
    const imc = calculateBMI(70, 1.75);
    const result = classifyBMI(imc);
    expect(imc).toBe(22.86);
    expect(result.label).toBe("Peso normal");
    expect(result.variant).toBe("success");
  });

  it("produces Sobrepeso for 80 kg / 1.70 m", () => {
    const imc = calculateBMI(80, 1.70);
    const result = classifyBMI(imc);
    expect(result.label).toBe("Sobrepeso");
    expect(result.variant).toBe("warning");
  });

  it("does NOT divide altura by 100 — 1.75 m gives imc ~22.86, NOT ~8653", () => {
    // If the bug (alturaMetros = altura / 100) were present, result would be ~8653
    const imc = calculateBMI(70, 1.75);
    expect(imc).toBeLessThan(100);
  });

  it("imc value echoed back in BmiResult state matches calculateBMI output", () => {
    const imc = calculateBMI(90, 1.80);
    const result = classifyBMI(imc);
    expect(result.imc).toBe(imc);
  });
});

describe("IMC_DISCLAIMER", () => {
  it("is a non-empty string", () => {
    expect(typeof IMC_DISCLAIMER).toBe("string");
    expect(IMC_DISCLAIMER.length).toBeGreaterThan(0);
  });

  it("mentions BMI as a population-level indicator (pt-BR)", () => {
    expect(IMC_DISCLAIMER.toLowerCase()).toMatch(/indicador|estatístico|populacional/);
  });

  it("mentions that it does not replace medical evaluation (pt-BR)", () => {
    expect(IMC_DISCLAIMER.toLowerCase()).toMatch(/médic|avaliação/);
  });
});

describe("calculateMarkerPct", () => {
  it("returns 0 for imc at display range minimum (10)", () => {
    expect(calculateMarkerPct(10)).toBe(0);
  });

  it("returns 100 for imc at display range maximum (45)", () => {
    expect(calculateMarkerPct(45)).toBe(100);
  });

  it("clamps values below 10 to 0", () => {
    expect(calculateMarkerPct(5)).toBe(0);
    expect(calculateMarkerPct(0)).toBe(0);
  });

  it("clamps values above 45 to 100", () => {
    expect(calculateMarkerPct(50)).toBe(100);
    expect(calculateMarkerPct(100)).toBe(100);
  });

  it("places 18.5 (Abaixo do peso boundary) at correct position", () => {
    // (18.5 - 10) / 35 * 100 = 24.285...
    expect(calculateMarkerPct(18.5)).toBeCloseTo(24.29, 1);
  });

  it("places 25 (Sobrepeso boundary) at correct position", () => {
    // (25 - 10) / 35 * 100 = 42.857...
    expect(calculateMarkerPct(25)).toBeCloseTo(42.86, 1);
  });

  it("places 22.5 (mid normal range) between 0 and 100", () => {
    const pct = calculateMarkerPct(22.5);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });

  it("returns a number type", () => {
    expect(typeof calculateMarkerPct(22)).toBe("number");
  });
});

describe("getFirstErrorKey", () => {
  it("returns the first key when only peso has an error", () => {
    expect(getFirstErrorKey({ peso: { message: "Peso é obrigatório" } })).toBe("peso");
  });

  it("returns the first key when only altura has an error", () => {
    expect(getFirstErrorKey({ altura: { message: "Altura é obrigatório" } })).toBe("altura");
  });

  it("returns peso when both fields have errors (peso comes first)", () => {
    expect(getFirstErrorKey({ peso: { message: "erro" }, altura: { message: "erro" } })).toBe("peso");
  });

  it("returns undefined when errors object is empty", () => {
    expect(getFirstErrorKey({})).toBeUndefined();
  });
});
