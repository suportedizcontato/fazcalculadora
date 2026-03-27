import { describe, it, expect } from "vitest";
import {
  normalizeDecimal,
  formatCurrency,
  calcRescisao,
  calcFerias,
  calcDecimo,
  buildNarrativeRescisao,
  buildNarrativeFerias,
  buildNarrativeDecimo,
} from "./rescisao";
import type { RescisaoInput, FeriasInput, DecimoInput } from "./rescisao";

// ─── Task 1.1: normalizeDecimal ───────────────────────────────────────────────

describe("normalizeDecimal", () => {
  it("substitui vírgula por ponto", () => {
    expect(normalizeDecimal("3,14")).toBe("3.14");
  });

  it("prefixa 0 quando a entrada começa com ponto", () => {
    expect(normalizeDecimal(".75")).toBe("0.75");
  });

  it("prefixa 0 quando a entrada começa com vírgula", () => {
    expect(normalizeDecimal(",75")).toBe("0.75");
  });

  it("mantém string já com ponto decimal inalterada", () => {
    expect(normalizeDecimal("1.75")).toBe("1.75");
  });

  it("mantém string inteira inalterada", () => {
    expect(normalizeDecimal("3500")).toBe("3500");
  });

  it("retorna string vazia inalterada", () => {
    expect(normalizeDecimal("")).toBe("");
  });

  it("substitui múltiplas vírgulas por pontos", () => {
    expect(normalizeDecimal("1,500,00")).toBe("1.500.00");
  });
});

// ─── Task 1.1: formatCurrency ─────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formata inteiro como BRL com centavos zerados", () => {
    expect(formatCurrency(1000)).toBe("R$\u00a01.000,00");
  });

  it("formata valor com centavos corretamente", () => {
    expect(formatCurrency(3500.5)).toBe("R$\u00a03.500,50");
  });

  it("formata zero como R$ 0,00", () => {
    expect(formatCurrency(0)).toBe("R$\u00a00,00");
  });

  it("formata valor fracionário pequeno", () => {
    expect(formatCurrency(0.01)).toBe("R$\u00a00,01");
  });

  it("retorna string", () => {
    expect(typeof formatCurrency(100)).toBe("string");
  });

  it("inclui o símbolo de real brasileiro", () => {
    expect(formatCurrency(100)).toMatch(/R\$/);
  });
});

// ─── Task 1.2: calcRescisao ───────────────────────────────────────────────────

describe("calcRescisao", () => {
  const base: RescisaoInput = {
    salario: 3000,
    tipoDesligamento: "sem-justa-causa",
    anos: 2,
    meses: 3,
    diasTrabalhados: 15,
    meses13: 3,
    avisoPrevioCumprido: true,
  };

  it("calcula saldoSalario como (salario/30)*diasTrabalhados", () => {
    const r = calcRescisao(base);
    expect(r.saldoSalario).toBeCloseTo((3000 / 30) * 15, 8);
  });

  it("calcula mesesTotais e mesesAquisitivos corretamente", () => {
    const r = calcRescisao(base); // 2*12+3 = 27 meses; 27%12 = 3
    expect(r.mesesTotais).toBe(27);
    expect(r.mesesAquisitivos).toBe(3);
  });

  it("calcula feriasProporcionais com fator 4/3 exato", () => {
    const r = calcRescisao(base);
    expect(r.feriasProporcionais).toBeCloseTo((3000 / 12) * 3 * (4 / 3), 8);
  });

  it("calcula decimoProporcional como (salario/12)*meses13", () => {
    const r = calcRescisao(base);
    expect(r.decimoProporcional).toBeCloseTo((3000 / 12) * 3, 8);
  });

  it("sem-justa-causa: multa FGTS = 40% de salario*mesesTotais*0.08", () => {
    const r = calcRescisao(base);
    const expected = 3000 * 27 * 0.08 * 0.40;
    expect(r.multaFgts).toBeCloseTo(expected, 8);
  });

  it("acordo-mutuo: multa FGTS = 20%", () => {
    const r = calcRescisao({ ...base, tipoDesligamento: "acordo-mutuo" });
    const expected = 3000 * 27 * 0.08 * 0.20;
    expect(r.multaFgts).toBeCloseTo(expected, 8);
  });

  it("justa-causa: multaFgts é null", () => {
    const r = calcRescisao({ ...base, tipoDesligamento: "justa-causa" });
    expect(r.multaFgts).toBeNull();
  });

  it("pedido-demissao com avisoPrevioCumprido: multaFgts e deducaoAvisoPrevio são null", () => {
    const r = calcRescisao({ ...base, tipoDesligamento: "pedido-demissao", avisoPrevioCumprido: true });
    expect(r.multaFgts).toBeNull();
    expect(r.deducaoAvisoPrevio).toBeNull();
  });

  it("pedido-demissao sem aviso prévio cumprido: dedução = salario", () => {
    const r = calcRescisao({ ...base, tipoDesligamento: "pedido-demissao", avisoPrevioCumprido: false });
    expect(r.deducaoAvisoPrevio).toBeCloseTo(3000, 8);
  });

  it("sem-justa-causa com avisoPrevioCumprido: deducaoAvisoPrevio é null", () => {
    const r = calcRescisao(base);
    expect(r.deducaoAvisoPrevio).toBeNull();
  });

  it("mesesAquisitivos === 0 (múltiplo exato de 12): feriasProporcionais = 0", () => {
    const r = calcRescisao({ ...base, anos: 2, meses: 0 }); // 24 % 12 = 0
    expect(r.mesesAquisitivos).toBe(0);
    expect(r.feriasProporcionais).toBe(0);
  });

  it("totalEstimado é soma aritmética correta: saldo + ferias + decimo + multa - deducao", () => {
    const r = calcRescisao(base);
    const expected =
      r.saldoSalario +
      r.feriasProporcionais +
      r.decimoProporcional +
      (r.multaFgts ?? 0) -
      (r.deducaoAvisoPrevio ?? 0);
    expect(r.totalEstimado).toBeCloseTo(expected, 8);
  });

  it("totalEstimado com pedido-demissao sem aviso prévio desconta a deducao", () => {
    const input: RescisaoInput = { ...base, tipoDesligamento: "pedido-demissao", avisoPrevioCumprido: false };
    const r = calcRescisao(input);
    const expected =
      r.saldoSalario +
      r.feriasProporcionais +
      r.decimoProporcional -
      (r.deducaoAvisoPrevio ?? 0);
    expect(r.totalEstimado).toBeCloseTo(expected, 8);
  });
});

// ─── Task 1.3: calcFerias ─────────────────────────────────────────────────────

describe("calcFerias", () => {
  it("totalFerias usa fator 4/3 exato", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: false };
    const r = calcFerias(input);
    expect(r.totalFerias).toBeCloseTo((3000 / 12) * 6 * (4 / 3), 8);
  });

  it("sem abono: abonoPecuniario e feriasSemAbono são null", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: false };
    const r = calcFerias(input);
    expect(r.abonoPecuniario).toBeNull();
    expect(r.feriasSemAbono).toBeNull();
  });

  it("com abono: abonoPecuniario = totalFerias/3", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: true };
    const r = calcFerias(input);
    expect(r.abonoPecuniario).toBeCloseTo(r.totalFerias / 3, 8);
  });

  it("com abono: feriasSemAbono = totalFerias*(2/3)", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: true };
    const r = calcFerias(input);
    expect(r.feriasSemAbono).toBeCloseTo(r.totalFerias * (2 / 3), 8);
  });

  it("mesesAquisitivos = 1 (limite inferior)", () => {
    const input: FeriasInput = { salario: 1200, mesesAquisitivos: 1, solicitarAbono: false };
    const r = calcFerias(input);
    expect(r.totalFerias).toBeCloseTo((1200 / 12) * 1 * (4 / 3), 8);
  });

  it("mesesAquisitivos = 12 (limite superior)", () => {
    const input: FeriasInput = { salario: 1200, mesesAquisitivos: 12, solicitarAbono: false };
    const r = calcFerias(input);
    expect(r.totalFerias).toBeCloseTo((1200 / 12) * 12 * (4 / 3), 8);
  });

  it("abonoPecuniario + feriasSemAbono = totalFerias quando há abono", () => {
    const input: FeriasInput = { salario: 3600, mesesAquisitivos: 9, solicitarAbono: true };
    const r = calcFerias(input);
    expect((r.abonoPecuniario ?? 0) + (r.feriasSemAbono ?? 0)).toBeCloseTo(r.totalFerias, 8);
  });
});

// ─── Task 1.3: calcDecimo ─────────────────────────────────────────────────────

describe("calcDecimo", () => {
  it("valorDecimo = (salario/12)*mesesTrabalhados", () => {
    const input: DecimoInput = { salario: 3000, mesesTrabalhados: 6 };
    const r = calcDecimo(input);
    expect(r.valorDecimo).toBeCloseTo((3000 / 12) * 6, 8);
  });

  it("mesesTrabalhados = 1 (limite inferior)", () => {
    const input: DecimoInput = { salario: 2400, mesesTrabalhados: 1 };
    const r = calcDecimo(input);
    expect(r.valorDecimo).toBeCloseTo((2400 / 12) * 1, 8);
  });

  it("mesesTrabalhados = 12 (salário completo)", () => {
    const input: DecimoInput = { salario: 2400, mesesTrabalhados: 12 };
    const r = calcDecimo(input);
    expect(r.valorDecimo).toBeCloseTo(2400, 8);
  });
});

// ─── Task 1.4: buildNarrative* ────────────────────────────────────────────────

describe("buildNarrativeRescisao", () => {
  const baseInput: RescisaoInput = {
    salario: 3000,
    tipoDesligamento: "sem-justa-causa",
    anos: 2,
    meses: 3,
    diasTrabalhados: 15,
    meses13: 3,
    avisoPrevioCumprido: true,
  };

  it("retorna uma string não vazia", () => {
    const result = calcRescisao(baseInput);
    const narrative = buildNarrativeRescisao(baseInput, result);
    expect(typeof narrative).toBe("string");
    expect(narrative.length).toBeGreaterThan(0);
  });

  it("contém o totalEstimado formatado exatamente como formatCurrency", () => {
    const result = calcRescisao(baseInput);
    const narrative = buildNarrativeRescisao(baseInput, result);
    expect(narrative).toContain(formatCurrency(result.totalEstimado));
  });

  it("contém o saldoSalario formatado", () => {
    const result = calcRescisao(baseInput);
    const narrative = buildNarrativeRescisao(baseInput, result);
    expect(narrative).toContain(formatCurrency(result.saldoSalario));
  });

  it("contém multaFgts formatada quando aplicável", () => {
    const result = calcRescisao(baseInput); // sem-justa-causa → multa presente
    const narrative = buildNarrativeRescisao(baseInput, result);
    expect(narrative).toContain(formatCurrency(result.multaFgts!));
  });

  it("contém dedução de aviso prévio quando pedido-demissao sem aviso", () => {
    const input = { ...baseInput, tipoDesligamento: "pedido-demissao" as const, avisoPrevioCumprido: false };
    const result = calcRescisao(input);
    const narrative = buildNarrativeRescisao(input, result);
    expect(narrative).toContain(formatCurrency(result.deducaoAvisoPrevio!));
  });
});

describe("buildNarrativeFerias", () => {
  it("retorna string não vazia", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: false };
    const result = calcFerias(input);
    const narrative = buildNarrativeFerias(input, result);
    expect(typeof narrative).toBe("string");
    expect(narrative.length).toBeGreaterThan(0);
  });

  it("contém o totalFerias formatado", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: false };
    const result = calcFerias(input);
    const narrative = buildNarrativeFerias(input, result);
    expect(narrative).toContain(formatCurrency(result.totalFerias));
  });

  it("contém abonoPecuniario formatado quando solicitarAbono=true", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: true };
    const result = calcFerias(input);
    const narrative = buildNarrativeFerias(input, result);
    expect(narrative).toContain(formatCurrency(result.abonoPecuniario!));
  });

  it("contém feriasSemAbono formatado quando solicitarAbono=true", () => {
    const input: FeriasInput = { salario: 3000, mesesAquisitivos: 6, solicitarAbono: true };
    const result = calcFerias(input);
    const narrative = buildNarrativeFerias(input, result);
    expect(narrative).toContain(formatCurrency(result.feriasSemAbono!));
  });
});

describe("buildNarrativeDecimo", () => {
  it("retorna string não vazia", () => {
    const input: DecimoInput = { salario: 3000, mesesTrabalhados: 6 };
    const result = calcDecimo(input);
    const narrative = buildNarrativeDecimo(input, result);
    expect(typeof narrative).toBe("string");
    expect(narrative.length).toBeGreaterThan(0);
  });

  it("contém o valorDecimo formatado", () => {
    const input: DecimoInput = { salario: 3000, mesesTrabalhados: 6 };
    const result = calcDecimo(input);
    const narrative = buildNarrativeDecimo(input, result);
    expect(narrative).toContain(formatCurrency(result.valorDecimo));
  });
});
