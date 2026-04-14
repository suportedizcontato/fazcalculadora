import { describe, it, expect } from "vitest";
import {
  calcDemissaoSemJustaCausa,
  calcPedidoDemissao,
  calcAcordoMutuo,
} from "./simulador-demissao";
import type { SimuladorInput } from "./simulador-demissao";
import { simuladorSchema } from "./simulador-demissao.schemas";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Contrato de 12 meses completo (admissão 2023-01-01, demissão 2024-01-01 = 1 ano exato)
// anosCompletos = 1, diasAvisoPrevio = min(90, 30 + 1*3) = 33
const base12m: SimuladorInput = {
  salario: 3000,
  dataAdmissao: "2023-01-01",
  dataDemissao: "2024-01-01",
  diasTrabalhados: 1,
  feriasVencidas: 0,
  feriasProporcionaisMeses: 0,
  meses13: 1,
  saldoFgts: 5000,
  cumpriuAvisoPrevio: true,
};

// Contrato de 2 anos completo (para testar aviso proporcional máximo = 36 dias)
// anosCompletos = 2, diasAvisoPrevio = min(90, 30 + 2*3) = 36
const base24m: SimuladorInput = {
  ...base12m,
  dataAdmissao: "2022-01-01",
  dataDemissao: "2024-01-01",
};

// Contrato de 20 anos para testar teto de 90 dias
// anosCompletos = 20, diasAvisoPrevio = min(90, 30 + 20*3) = 90
const base20y: SimuladorInput = {
  ...base12m,
  dataAdmissao: "2004-01-01",
  dataDemissao: "2024-01-01",
};

// ─── Fórmulas auxiliares comuns ────────────────────────────────────────────────

describe("fórmulas comuns", () => {
  it("saldoSalario = (salario / 30) × diasTrabalhados", () => {
    const r = calcDemissaoSemJustaCausa({ ...base12m, diasTrabalhados: 15 });
    const saldo = r.verbas.find((v) => v.label === "Saldo de Salário");
    expect(saldo).toBeDefined();
    expect(saldo!.valor).toBeCloseTo((3000 / 30) * 15, 6);
  });

  it("decimo13 = (salario / 12) × meses13", () => {
    const r = calcDemissaoSemJustaCausa({ ...base12m, meses13: 6 });
    const decimo = r.verbas.find((v) => v.label === "13º Proporcional");
    expect(decimo).toBeDefined();
    expect(decimo!.valor).toBeCloseTo((3000 / 12) * 6, 6);
  });

  it("feriasVencidas inclui terço quando feriasVencidas > 0", () => {
    const r = calcDemissaoSemJustaCausa({ ...base12m, feriasVencidas: 30 });
    const ferVenc = r.verbas.find((v) => v.label === "Férias Vencidas + 1/3");
    expect(ferVenc).toBeDefined();
    // (salario / 30) × 30 × (4/3) = salario × 4/3
    expect(ferVenc!.valor).toBeCloseTo(3000 * (4 / 3), 6);
  });

  it("feriasVencidas = 0 quando feriasVencidas input = 0", () => {
    const r = calcDemissaoSemJustaCausa({ ...base12m, feriasVencidas: 0 });
    const ferVenc = r.verbas.find((v) => v.label === "Férias Vencidas + 1/3");
    expect(ferVenc).toBeDefined();
    expect(ferVenc!.valor).toBe(0);
  });

  it("feriasProporcionais = (salario / 12) × meses × (4/3)", () => {
    const r = calcDemissaoSemJustaCausa({ ...base12m, feriasProporcionaisMeses: 6 });
    const ferProp = r.verbas.find((v) => v.label === "Férias Proporcionais + 1/3");
    expect(ferProp).toBeDefined();
    expect(ferProp!.valor).toBeCloseTo((3000 / 12) * 6 * (4 / 3), 6);
  });

  it("diasAvisoPrevio = min(90, 30 + anosCompletos × 3) — 1 ano = 33 dias", () => {
    // aviso indenizado = (salario / 30) × diasAvisoPrevio
    const r = calcDemissaoSemJustaCausa(base12m); // 1 ano completo
    const aviso = r.verbas.find((v) => v.label === "Aviso Prévio Indenizado");
    expect(aviso).toBeDefined();
    const dias = Math.min(90, 30 + 1 * 3); // = 33
    expect(aviso!.valor).toBeCloseTo((3000 / 30) * dias, 6);
  });

  it("diasAvisoPrevio teto de 90 dias para contrato de 20 anos", () => {
    const r = calcDemissaoSemJustaCausa(base20y);
    const aviso = r.verbas.find((v) => v.label === "Aviso Prévio Indenizado");
    expect(aviso).toBeDefined();
    expect(aviso!.valor).toBeCloseTo((3000 / 30) * 90, 6);
  });
});

// ─── calcDemissaoSemJustaCausa ─────────────────────────────────────────────────

describe("calcDemissaoSemJustaCausa", () => {
  it("retorna cenario = 'sem-justa-causa'", () => {
    const r = calcDemissaoSemJustaCausa(base12m);
    expect(r.cenario).toBe("sem-justa-causa");
  });

  it("inclui multa FGTS de 40%", () => {
    const r = calcDemissaoSemJustaCausa(base12m);
    const multa = r.verbas.find((v) => v.label === "Multa FGTS (40%)");
    expect(multa).toBeDefined();
    expect(multa!.valor).toBeCloseTo(5000 * 0.4, 6);
  });

  it("multa FGTS = 0 quando saldoFgts = 0 (não informado)", () => {
    const r = calcDemissaoSemJustaCausa({ ...base12m, saldoFgts: 0 });
    const multa = r.verbas.find((v) => v.label === "Multa FGTS (40%)");
    expect(multa).toBeDefined();
    expect(multa!.valor).toBe(0);
  });

  it("inclui aviso prévio indenizado completo", () => {
    const r = calcDemissaoSemJustaCausa(base12m);
    const aviso = r.verbas.find((v) => v.label === "Aviso Prévio Indenizado");
    expect(aviso).toBeDefined();
    expect(aviso!.valor).toBeGreaterThan(0);
  });

  it("totalLiquido = soma de todas as verbas", () => {
    const r = calcDemissaoSemJustaCausa(base12m);
    const sum = r.verbas.reduce((acc, v) => acc + v.valor, 0);
    expect(r.totalLiquido).toBeCloseTo(sum, 10);
  });

  it("direitos: seguroDesemprego = true, saquesFgts = 'total'", () => {
    const r = calcDemissaoSemJustaCausa(base12m);
    expect(r.direitos.seguroDesemprego).toBe(true);
    expect(r.direitos.saquesFgts).toBe("total");
  });

  it("aviso proporcional correto para 2 anos (36 dias)", () => {
    const r = calcDemissaoSemJustaCausa(base24m);
    const aviso = r.verbas.find((v) => v.label === "Aviso Prévio Indenizado");
    const dias = Math.min(90, 30 + 2 * 3); // 36
    expect(aviso!.valor).toBeCloseTo((3000 / 30) * dias, 6);
  });
});

// ─── calcPedidoDemissao ────────────────────────────────────────────────────────

describe("calcPedidoDemissao", () => {
  it("retorna cenario = 'pedido-demissao'", () => {
    const r = calcPedidoDemissao(base12m);
    expect(r.cenario).toBe("pedido-demissao");
  });

  it("NÃO inclui multa FGTS (valor 0)", () => {
    const r = calcPedidoDemissao(base12m);
    const multa = r.verbas.find((v) => v.label.includes("Multa FGTS"));
    // Ou não existe, ou existe com valor 0
    if (multa) {
      expect(multa.valor).toBe(0);
    } else {
      expect(multa).toBeUndefined();
    }
  });

  it("NÃO inclui aviso prévio indenizado (valor 0 ou ausente) quando cumprido", () => {
    const r = calcPedidoDemissao({ ...base12m, cumpriuAvisoPrevio: true });
    const aviso = r.verbas.find((v) => v.label === "Aviso Prévio Indenizado");
    if (aviso) {
      expect(aviso.valor).toBe(0);
    } else {
      expect(aviso).toBeUndefined();
    }
  });

  it("desconto aviso prévio = salario quando NÃO cumpriu aviso", () => {
    const r = calcPedidoDemissao({ ...base12m, cumpriuAvisoPrevio: false });
    const desconto = r.verbas.find((v) => v.label === "Desconto Aviso Prévio");
    expect(desconto).toBeDefined();
    expect(desconto!.valor).toBeCloseTo(-3000, 6);
  });

  it("sem desconto de aviso quando cumpriu aviso", () => {
    const r = calcPedidoDemissao({ ...base12m, cumpriuAvisoPrevio: true });
    const desconto = r.verbas.find((v) => v.label === "Desconto Aviso Prévio");
    if (desconto) {
      expect(desconto.valor).toBe(0);
    } else {
      expect(desconto).toBeUndefined();
    }
  });

  it("totalLiquido = soma de todas as verbas", () => {
    const r = calcPedidoDemissao(base12m);
    const sum = r.verbas.reduce((acc, v) => acc + v.valor, 0);
    expect(r.totalLiquido).toBeCloseTo(sum, 10);
  });

  it("direitos: seguroDesemprego = false, saquesFgts = 'nao'", () => {
    const r = calcPedidoDemissao(base12m);
    expect(r.direitos.seguroDesemprego).toBe(false);
    expect(r.direitos.saquesFgts).toBe("nao");
  });
});

// ─── calcAcordoMutuo ──────────────────────────────────────────────────────────

describe("calcAcordoMutuo", () => {
  it("retorna cenario = 'acordo-mutuo'", () => {
    const r = calcAcordoMutuo(base12m);
    expect(r.cenario).toBe("acordo-mutuo");
  });

  it("inclui multa FGTS de 20%", () => {
    const r = calcAcordoMutuo(base12m);
    const multa = r.verbas.find((v) => v.label === "Multa FGTS (20%)");
    expect(multa).toBeDefined();
    expect(multa!.valor).toBeCloseTo(5000 * 0.2, 6);
  });

  it("aviso prévio = 50% do aviso proporcional", () => {
    const r = calcAcordoMutuo(base12m);
    const aviso = r.verbas.find((v) => v.label === "Aviso Prévio (50%)");
    expect(aviso).toBeDefined();
    const dias = Math.min(90, 30 + 1 * 3); // 33
    const avisoCheio = (3000 / 30) * dias;
    expect(aviso!.valor).toBeCloseTo(avisoCheio * 0.5, 6);
  });

  it("totalLiquido = soma de todas as verbas", () => {
    const r = calcAcordoMutuo(base12m);
    const sum = r.verbas.reduce((acc, v) => acc + v.valor, 0);
    expect(r.totalLiquido).toBeCloseTo(sum, 10);
  });

  it("direitos: seguroDesemprego = false, saquesFgts = 'parcial-80'", () => {
    const r = calcAcordoMutuo(base12m);
    expect(r.direitos.seguroDesemprego).toBe(false);
    expect(r.direitos.saquesFgts).toBe("parcial-80");
  });

  it("multa FGTS = 0 quando saldoFgts = 0", () => {
    const r = calcAcordoMutuo({ ...base12m, saldoFgts: 0 });
    const multa = r.verbas.find((v) => v.label === "Multa FGTS (20%)");
    expect(multa).toBeDefined();
    expect(multa!.valor).toBe(0);
  });
});

// ─── simuladorSchema: validação Zod ──────────────────────────────────────────

describe("simuladorSchema — validação", () => {
  it("aceita dados válidos mínimos", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000",
      dataAdmissao: "2023-01-01",
      dataDemissao: "2024-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
      saldoFgts: "5000",
      cumpriuAvisoPrevio: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBeCloseTo(3000, 2);
      expect(result.data.saldoFgts).toBeCloseTo(5000, 2);
    }
  });

  it("saldoFgts default = 0 quando omitido", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000",
      dataAdmissao: "2023-01-01",
      dataDemissao: "2024-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.saldoFgts).toBe(0);
    }
  });

  it("cumpriuAvisoPrevio default = true quando omitido", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000",
      dataAdmissao: "2023-01-01",
      dataDemissao: "2024-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cumpriuAvisoPrevio).toBe(true);
    }
  });

  it("rejeita quando dataDemissao < dataAdmissao (refine)", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000",
      dataAdmissao: "2024-01-01",
      dataDemissao: "2023-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("dataDemissao");
    }
  });

  it("aceita dataDemissao = dataAdmissao (mesmo dia)", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000",
      dataAdmissao: "2023-06-01",
      dataDemissao: "2023-06-01",
      diasTrabalhados: 1,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 0,
      meses13: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita salário zero", () => {
    const result = simuladorSchema.safeParse({
      salario: "0",
      dataAdmissao: "2023-01-01",
      dataDemissao: "2024-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita data com formato inválido", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000",
      dataAdmissao: "01/01/2023",
      dataDemissao: "2024-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
    });
    expect(result.success).toBe(false);
  });

  it("aceita vírgula decimal no salário (normalizeDecimal)", () => {
    const result = simuladorSchema.safeParse({
      salario: "3000,50",
      dataAdmissao: "2023-01-01",
      dataDemissao: "2024-01-01",
      diasTrabalhados: 15,
      feriasVencidas: 0,
      feriasProporcionaisMeses: 6,
      meses13: 6,
      saldoFgts: "5000,00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBeCloseTo(3000.5, 2);
      expect(result.data.saldoFgts).toBeCloseTo(5000, 2);
    }
  });
});
