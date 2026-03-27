import { describe, it, expect } from "vitest";
import {
  calcPorcentagemDe,
  calcQuePercentual,
  calcAumento,
  calcDesconto,
  calcVariacao,
  normalizeDecimal,
  formatBR,
  buildExplanation,
} from "./porcentagem";

// ─── Task 7.1: Unit tests for pure calc functions ─────────────────────────────

describe("calcPorcentagemDe", () => {
  it("calcula 10% de 200 = 20", () => {
    expect(calcPorcentagemDe(10, 200)).toBe(20);
  });

  it("calcula 50% de 80 = 40", () => {
    expect(calcPorcentagemDe(50, 80)).toBe(40);
  });

  it("calcula 0% de qualquer valor = 0", () => {
    expect(calcPorcentagemDe(0, 500)).toBe(0);
  });

  it("calcula 100% de 150 = 150", () => {
    expect(calcPorcentagemDe(100, 150)).toBe(150);
  });
});

describe("calcQuePercentual", () => {
  it("30 é 20% de 150", () => {
    expect(calcQuePercentual(30, 150)).toBe(20);
  });

  it("50 é 100% de 50", () => {
    expect(calcQuePercentual(50, 50)).toBe(100);
  });

  it("75 é 50% de 150", () => {
    expect(calcQuePercentual(75, 150)).toBe(50);
  });
});

describe("calcAumento", () => {
  it("100 com 15% de aumento: acrescimo=15, valorFinal=115", () => {
    expect(calcAumento(100, 15)).toEqual({ acrescimo: 15, valorFinal: 115 });
  });

  it("200 com 50% de aumento: acrescimo=100, valorFinal=300", () => {
    expect(calcAumento(200, 50)).toEqual({ acrescimo: 100, valorFinal: 300 });
  });

  it("0% de aumento retorna valorFinal igual ao original", () => {
    expect(calcAumento(100, 0)).toEqual({ acrescimo: 0, valorFinal: 100 });
  });
});

describe("calcDesconto", () => {
  it("250 com 20% de desconto: desconto=50, valorFinal=200", () => {
    expect(calcDesconto(250, 20)).toEqual({ desconto: 50, valorFinal: 200 });
  });

  it("100 com 100% de desconto: desconto=100, valorFinal=0", () => {
    expect(calcDesconto(100, 100)).toEqual({ desconto: 100, valorFinal: 0 });
  });

  it("0% de desconto retorna valorFinal igual ao original", () => {
    expect(calcDesconto(150, 0)).toEqual({ desconto: 0, valorFinal: 150 });
  });
});

describe("calcVariacao", () => {
  it("de 80 para 100 é variação de 25%", () => {
    expect(calcVariacao(80, 100)).toBe(25);
  });

  it("de 100 para 80 é variação de -20% (resultado negativo é válido)", () => {
    expect(calcVariacao(100, 80)).toBe(-20);
  });

  it("de 50 para 100 é variação de 100%", () => {
    expect(calcVariacao(50, 100)).toBe(100);
  });

  it("sem variação retorna 0%", () => {
    expect(calcVariacao(100, 100)).toBe(0);
  });
});

describe("normalizeDecimal", () => {
  it("converte vírgula em ponto", () => {
    expect(normalizeDecimal("3,14")).toBe("3.14");
  });

  it("mantém ponto como separador", () => {
    expect(normalizeDecimal("3.14")).toBe("3.14");
  });

  it("adiciona 0 antes de ponto inicial", () => {
    expect(normalizeDecimal(".5")).toBe("0.5");
  });

  it("mantém string numérica inteira sem alteração", () => {
    expect(normalizeDecimal("42")).toBe("42");
  });

  it("converte múltiplas vírgulas (separadores de milhar)", () => {
    expect(normalizeDecimal("1,500,75")).toBe("1.500.75");
  });
});

describe("formatBR", () => {
  it("formata 1500.75 como 1.500,75", () => {
    expect(formatBR(1500.75)).toBe("1.500,75");
  });

  it("formata 20 como 20,00", () => {
    expect(formatBR(20)).toBe("20,00");
  });

  it("formata 0.5 como 0,50", () => {
    expect(formatBR(0.5)).toBe("0,50");
  });

  it("formata 1000000 como 1.000.000,00", () => {
    expect(formatBR(1000000)).toBe("1.000.000,00");
  });
});

describe("buildExplanation — determinismo", () => {
  it("porcentagem-de: mesma entrada sempre gera mesma string", () => {
    const result1 = buildExplanation("porcentagem-de", { percentual: 10, valorBase: 200 }, 20);
    const result2 = buildExplanation("porcentagem-de", { percentual: 10, valorBase: 200 }, 20);
    expect(result1).toBe(result2);
    expect(result1).toBe("10,00% de 200,00 é igual a 20,00");
  });

  it("que-percentual: gera frase correta", () => {
    const r = buildExplanation("que-percentual", { valorParcial: 30, valorTotal: 150 }, 20);
    expect(r).toBe("30,00 é 20,00% de 150,00");
  });

  it("aumento: inclui acréscimo e valorFinal na frase", () => {
    const r = buildExplanation(
      "aumento",
      { valorOriginal: 100, percentualAumento: 15 },
      { acrescimo: 15, valorFinal: 115 }
    );
    expect(r).toBe("100,00 com 15,00% de aumento fica 115,00 (acréscimo de 15,00)");
  });

  it("desconto: inclui desconto e valorFinal na frase", () => {
    const r = buildExplanation(
      "desconto",
      { valorOriginal: 250, percentualDesconto: 20 },
      { desconto: 50, valorFinal: 200 }
    );
    expect(r).toBe("250,00 com 20,00% de desconto fica 200,00 (desconto de 50,00)");
  });

  it("variacao: gera frase correta para variação positiva", () => {
    const r = buildExplanation("variacao", { valorInicial: 80, valorFinal: 100 }, 25);
    expect(r).toBe("De 80,00 para 100,00, a variação é de 25,00%");
  });

  it("variacao: gera frase correta para variação negativa", () => {
    const r = buildExplanation("variacao", { valorInicial: 100, valorFinal: 80 }, -20);
    expect(r).toBe("De 100,00 para 80,00, a variação é de -20,00%");
  });
});
