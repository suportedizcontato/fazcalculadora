import { describe, it, expect } from "vitest";
import {
  calcBancoHoras,
} from "./banco-de-horas";
import type { BancoHorasInput } from "./banco-de-horas";
import { bancoDeHorasSchema } from "./banco-de-horas.schemas";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseInput: BancoHorasInput = {
  salario: 3000,
  jornadaDiaria: 8,
  diasPorSemana: 5,
  regime: "informal",
  semanas: [
    { periodo: "Semana 1", horasTrabalhadas: 45, horasDevidas: 40 },
  ],
};

// Valor hora normal = 3000 / (5 × 8 × 4.333) = 3000 / 173.32 ≈ 17.31
const valorHoraNormal = 3000 / (5 * 8 * 4.333);

// ─── calcBancoHoras: saldo ─────────────────────────────────────────────────────

describe("calcBancoHoras — saldo", () => {
  it("saldo zerado quando horas trabalhadas = horas devidas", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 40, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    expect(r.saldoHoras).toBe(0);
    expect(r.classificacao).toBe("zerado");
    expect(r.valorMonetario).toBeNull();
  });

  it("saldo positivo (crédito) quando trabalhadas > devidas", () => {
    const r = calcBancoHoras(baseInput); // +5h
    expect(r.saldoHoras).toBeCloseTo(5, 8);
    expect(r.classificacao).toBe("credito");
  });

  it("saldo negativo (débito) quando trabalhadas < devidas", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 35, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    expect(r.saldoHoras).toBeCloseTo(-5, 8);
    expect(r.classificacao).toBe("debito");
    expect(r.valorMonetario).toBeNull();
  });

  it("saldo acumulado com múltiplas semanas", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [
        { periodo: "S1", horasTrabalhadas: 45, horasDevidas: 40 }, // +5
        { periodo: "S2", horasTrabalhadas: 38, horasDevidas: 40 }, // -2
        { periodo: "S3", horasTrabalhadas: 42, horasDevidas: 40 }, // +2
      ],
    };
    const r = calcBancoHoras(input);
    expect(r.saldoHoras).toBeCloseTo(5, 8); // 5 - 2 + 2 = 5
  });
});

// ─── calcBancoHoras: valor monetário ─────────────────────────────────────────

describe("calcBancoHoras — valor monetário", () => {
  it("valorHoraNormal = salario / (diasPorSemana × jornadaDiaria × 4.333)", () => {
    const r = calcBancoHoras(baseInput);
    expect(r.valorHoraNormal).toBeCloseTo(valorHoraNormal, 6);
  });

  it("valorMonetario = saldo × valorHoraNormal × 1.50 quando saldo positivo", () => {
    const r = calcBancoHoras(baseInput); // saldo = 5h
    const expected = 5 * valorHoraNormal * 1.5;
    expect(r.valorMonetario).toBeCloseTo(expected, 6);
  });

  it("valorMonetario é null quando saldo negativo", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 30, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    expect(r.valorMonetario).toBeNull();
  });

  it("valorMonetario é null quando saldo zerado", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 40, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    expect(r.valorMonetario).toBeNull();
  });

  it("jornada diferente altera valorHoraNormal proporcionalmente", () => {
    const input: BancoHorasInput = { ...baseInput, jornadaDiaria: 6, diasPorSemana: 6 };
    const r = calcBancoHoras(input);
    const expected = 3000 / (6 * 6 * 4.333);
    expect(r.valorHoraNormal).toBeCloseTo(expected, 6);
  });
});

// ─── calcBancoHoras: saldoMinutos ─────────────────────────────────────────────

describe("calcBancoHoras — saldoMinutos", () => {
  it("saldoMinutos representa a parte fracionada do saldo em minutos", () => {
    // 5.5h = 5h 30min
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 45.5, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    expect(r.saldoHoras).toBeCloseTo(5.5, 8);
    expect(r.saldoMinutos).toBeCloseTo(30, 0);
  });

  it("saldoMinutos = 0 quando saldo é inteiro", () => {
    const r = calcBancoHoras(baseInput); // saldo = 5.0h exato
    expect(r.saldoMinutos).toBe(0);
  });
});

// ─── calcBancoHoras: tabelaSemanas ────────────────────────────────────────────

describe("calcBancoHoras — tabelaSemanas", () => {
  it("tabelaSemanas tem uma entrada por semana", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [
        { periodo: "S1", horasTrabalhadas: 45, horasDevidas: 40 },
        { periodo: "S2", horasTrabalhadas: 38, horasDevidas: 40 },
      ],
    };
    const r = calcBancoHoras(input);
    expect(r.tabelaSemanas).toHaveLength(2);
  });

  it("saldoParcial acumula corretamente semana a semana", () => {
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [
        { periodo: "S1", horasTrabalhadas: 45, horasDevidas: 40 }, // +5
        { periodo: "S2", horasTrabalhadas: 38, horasDevidas: 40 }, // -2 → acumulado 3
        { periodo: "S3", horasTrabalhadas: 44, horasDevidas: 40 }, // +4 → acumulado 7
      ],
    };
    const r = calcBancoHoras(input);
    expect(r.tabelaSemanas[0].saldoParcial).toBeCloseTo(5, 8);
    expect(r.tabelaSemanas[1].saldoParcial).toBeCloseTo(3, 8);
    expect(r.tabelaSemanas[2].saldoParcial).toBeCloseTo(7, 8);
  });

  it("preserva o campo periodo na tabela", () => {
    const r = calcBancoHoras(baseInput);
    expect(r.tabelaSemanas[0].periodo).toBe("Semana 1");
  });
});

// ─── calcBancoHoras: alertas de prazo ─────────────────────────────────────────

describe("calcBancoHoras — alertas de prazo vencido", () => {
  it("sem dataInicio: nenhum alerta de prazo-vencido", () => {
    const r = calcBancoHoras(baseInput); // sem dataInicio
    const alertas = r.alertas.filter((a) => a.tipo === "prazo-vencido");
    expect(alertas).toHaveLength(0);
  });

  it("regime informal com dataInicio há 7 meses: alerta prazo-vencido", () => {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 7);
    const input: BancoHorasInput = {
      ...baseInput,
      regime: "informal",
      dataInicio: dataInicio.toISOString().slice(0, 10),
    };
    const r = calcBancoHoras(input);
    const alertas = r.alertas.filter((a) => a.tipo === "prazo-vencido");
    expect(alertas.length).toBeGreaterThan(0);
  });

  it("regime informal com dataInicio há 5 meses: sem alerta prazo-vencido", () => {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 5);
    const input: BancoHorasInput = {
      ...baseInput,
      regime: "informal",
      dataInicio: dataInicio.toISOString().slice(0, 10),
    };
    const r = calcBancoHoras(input);
    const alertas = r.alertas.filter((a) => a.tipo === "prazo-vencido");
    expect(alertas).toHaveLength(0);
  });

  it("regime formal com dataInicio há 13 meses: alerta prazo-vencido", () => {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 13);
    const input: BancoHorasInput = {
      ...baseInput,
      regime: "formal",
      dataInicio: dataInicio.toISOString().slice(0, 10),
    };
    const r = calcBancoHoras(input);
    const alertas = r.alertas.filter((a) => a.tipo === "prazo-vencido");
    expect(alertas.length).toBeGreaterThan(0);
  });

  it("regime formal com dataInicio há 11 meses: sem alerta prazo-vencido", () => {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 11);
    const input: BancoHorasInput = {
      ...baseInput,
      regime: "formal",
      dataInicio: dataInicio.toISOString().slice(0, 10),
    };
    const r = calcBancoHoras(input);
    const alertas = r.alertas.filter((a) => a.tipo === "prazo-vencido");
    expect(alertas).toHaveLength(0);
  });
});

// ─── calcBancoHoras: alerta limite diário ────────────────────────────────────

describe("calcBancoHoras — alerta limite-diario", () => {
  it("alerta limite-diario quando média diária de horas extras > 2h", () => {
    // 5 dias por semana, 8h por dia → devidas = 40h.
    // Se trabalhadas = 51h, extras = 11h em 5 dias = 2.2h/dia → alerta.
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 51, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    const alertas = r.alertas.filter((a) => a.tipo === "limite-diario");
    expect(alertas.length).toBeGreaterThan(0);
  });

  it("sem alerta limite-diario quando média diária de horas extras <= 2h", () => {
    // extras = 10h em 5 dias = 2h/dia → sem alerta (limite exato, não ultrapassado)
    const input: BancoHorasInput = {
      ...baseInput,
      semanas: [{ periodo: "S1", horasTrabalhadas: 50, horasDevidas: 40 }],
    };
    const r = calcBancoHoras(input);
    const alertas = r.alertas.filter((a) => a.tipo === "limite-diario");
    expect(alertas).toHaveLength(0);
  });
});

// ─── bancoDeHorasSchema: validação Zod ───────────────────────────────────────

describe("bancoDeHorasSchema — validação", () => {
  it("aceita dados válidos e produz saída tipada", () => {
    const data = {
      salario: "3000,00",
      jornadaDiaria: 8,
      diasPorSemana: 5,
      regime: "informal" as const,
      semanas: [{ periodo: "S1", horasTrabalhadas: 45, horasDevidas: 40 }],
    };
    const result = bancoDeHorasSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salario).toBeCloseTo(3000, 2);
    }
  });

  it("rejeita array de semanas vazio com mensagem em português", () => {
    const result = bancoDeHorasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasPorSemana: 5,
      regime: "informal" as const,
      semanas: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0].message;
      expect(msg).toMatch(/ao menos uma semana/i);
    }
  });

  it("rejeita array com mais de 52 semanas", () => {
    const semanas = Array.from({ length: 53 }, (_, i) => ({
      periodo: `S${i + 1}`,
      horasTrabalhadas: 40,
      horasDevidas: 40,
    }));
    const result = bancoDeHorasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasPorSemana: 5,
      regime: "informal" as const,
      semanas,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita salário zero", () => {
    const result = bancoDeHorasSchema.safeParse({
      salario: "0",
      jornadaDiaria: 8,
      diasPorSemana: 5,
      regime: "informal" as const,
      semanas: [{ periodo: "S1", horasTrabalhadas: 40, horasDevidas: 40 }],
    });
    expect(result.success).toBe(false);
  });

  it("aceita dataInicio como campo opcional (ausente)", () => {
    const result = bancoDeHorasSchema.safeParse({
      salario: "3000",
      jornadaDiaria: 8,
      diasPorSemana: 5,
      regime: "formal" as const,
      semanas: [{ periodo: "S1", horasTrabalhadas: 40, horasDevidas: 40 }],
    });
    expect(result.success).toBe(true);
  });
});
