// ─── Domain types ─────────────────────────────────────────────────────────────

export type SimuladorInput = {
  salario: number;
  dataAdmissao: string;             // ISO date string "YYYY-MM-DD"
  dataDemissao: string;             // ISO date string "YYYY-MM-DD"
  diasTrabalhados: number;          // dias trabalhados no mês corrente
  feriasVencidas: number;           // dias de férias vencidas (0 = nenhuma)
  feriasProporcionaisMeses: number; // meses do período aquisitivo atual
  meses13: number;                  // meses trabalhados no ano corrente
  saldoFgts: number;                // saldo FGTS (R$); 0 = não informado
  cumpriuAvisoPrevio?: boolean;     // relevante para pedido de demissão
};

export type VerbaRescisoria = {
  label: string;
  valor: number;
  nota: string;
};

export type DireitosNaoMonetarios = {
  seguroDesemprego: boolean;
  saquesFgts: "total" | "parcial-80" | "nao";
  avisoPrevio: "sim" | "nao" | "parcial";
};

export type CenarioResult = {
  cenario: "sem-justa-causa" | "pedido-demissao" | "acordo-mutuo";
  verbas: VerbaRescisoria[];
  totalLiquido: number;
  direitos: DireitosNaoMonetarios;
  isMaiorValor?: boolean;
};

// ─── Cálculo de verbas comuns ─────────────────────────────────────────────────

function calcVerbasComunsBase(input: SimuladorInput): {
  anosCompletos: number;
  diasAvisoPrevio: number;
  saldoSalario: number;
  feriasVencidasValor: number;
  feriasProporcionaisValor: number;
  decimo13Valor: number;
  valorAvisoCheio: number;
} {
  const {
    salario,
    dataAdmissao,
    dataDemissao,
    diasTrabalhados,
    feriasVencidas,
    feriasProporcionaisMeses,
    meses13,
  } = input;

  // Calcular anos completos a partir das datas (usando UTC para evitar problemas de fuso)
  const admissao = new Date(dataAdmissao + "T00:00:00Z");
  const demissao = new Date(dataDemissao + "T00:00:00Z");

  let anosCompletos = demissao.getUTCFullYear() - admissao.getUTCFullYear();
  const mDiff = demissao.getUTCMonth() - admissao.getUTCMonth();
  const dDiff = demissao.getUTCDate() - admissao.getUTCDate();
  if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) {
    anosCompletos -= 1;
  }
  if (anosCompletos < 0) anosCompletos = 0;

  // Aviso prévio proporcional (Súmula 441 TST)
  const diasAvisoPrevio = Math.min(90, 30 + anosCompletos * 3);
  const valorAvisoCheio = (salario / 30) * diasAvisoPrevio;

  // Verbas comuns
  const saldoSalario = (salario / 30) * diasTrabalhados;
  const feriasVencidasValor =
    feriasVencidas > 0 ? (salario / 30) * feriasVencidas * (4 / 3) : 0;
  const feriasProporcionaisValor =
    feriasProporcionaisMeses > 0
      ? (salario / 12) * feriasProporcionaisMeses * (4 / 3)
      : 0;
  const decimo13Valor = (salario / 12) * meses13;

  return {
    anosCompletos,
    diasAvisoPrevio,
    saldoSalario,
    feriasVencidasValor,
    feriasProporcionaisValor,
    decimo13Valor,
    valorAvisoCheio,
  };
}

// ─── calcDemissaoSemJustaCausa ─────────────────────────────────────────────────

export function calcDemissaoSemJustaCausa(input: SimuladorInput): CenarioResult {
  const {
    saldoSalario,
    feriasVencidasValor,
    feriasProporcionaisValor,
    decimo13Valor,
    valorAvisoCheio,
    diasAvisoPrevio,
  } = calcVerbasComunsBase(input);

  const multaFgts = input.saldoFgts * 0.4;

  const verbas: VerbaRescisoria[] = [
    {
      label: "Saldo de Salário",
      valor: saldoSalario,
      nota: `(salário / 30) × ${input.diasTrabalhados} dias trabalhados`,
    },
    {
      label: "Aviso Prévio Indenizado",
      valor: valorAvisoCheio,
      nota: `${diasAvisoPrevio} dias — Súmula 441 TST`,
    },
    {
      label: "Férias Vencidas + 1/3",
      valor: feriasVencidasValor,
      nota: input.feriasVencidas > 0
        ? `${input.feriasVencidas} dias × (4/3)`
        : "Nenhuma férias vencida informada",
    },
    {
      label: "Férias Proporcionais + 1/3",
      valor: feriasProporcionaisValor,
      nota: `${input.feriasProporcionaisMeses} meses aquisitivos × (4/3)`,
    },
    {
      label: "13º Proporcional",
      valor: decimo13Valor,
      nota: `${input.meses13} meses no ano corrente`,
    },
    {
      label: "Multa FGTS (40%)",
      valor: multaFgts,
      nota: input.saldoFgts > 0
        ? `40% sobre saldo FGTS de R$ ${input.saldoFgts.toFixed(2).replace(".", ",")}`
        : "Saldo FGTS não informado — multa não calculada",
    },
  ];

  const totalLiquido = verbas.reduce((acc, v) => acc + v.valor, 0);

  return {
    cenario: "sem-justa-causa",
    verbas,
    totalLiquido,
    direitos: {
      seguroDesemprego: true,
      saquesFgts: "total",
      avisoPrevio: "sim",
    },
  };
}

// ─── calcPedidoDemissao ────────────────────────────────────────────────────────

export function calcPedidoDemissao(input: SimuladorInput): CenarioResult {
  const {
    saldoSalario,
    feriasVencidasValor,
    feriasProporcionaisValor,
    decimo13Valor,
  } = calcVerbasComunsBase(input);

  const cumpriu = input.cumpriuAvisoPrevio !== false;
  const descontoAviso = cumpriu ? null : input.salario;

  const verbas: VerbaRescisoria[] = [
    {
      label: "Saldo de Salário",
      valor: saldoSalario,
      nota: `(salário / 30) × ${input.diasTrabalhados} dias trabalhados`,
    },
    {
      label: "Férias Vencidas + 1/3",
      valor: feriasVencidasValor,
      nota: input.feriasVencidas > 0
        ? `${input.feriasVencidas} dias × (4/3)`
        : "Nenhuma férias vencida informada",
    },
    {
      label: "Férias Proporcionais + 1/3",
      valor: feriasProporcionaisValor,
      nota: `${input.feriasProporcionaisMeses} meses aquisitivos × (4/3)`,
    },
    {
      label: "13º Proporcional",
      valor: decimo13Valor,
      nota: `${input.meses13} meses no ano corrente`,
    },
  ];

  if (descontoAviso !== null) {
    verbas.push({
      label: "Desconto Aviso Prévio",
      valor: -descontoAviso,
      nota: "Desconto de 1 salário por aviso prévio não cumprido (CLT Art. 487 §2º)",
    });
  }

  const totalLiquido = verbas.reduce((acc, v) => acc + v.valor, 0);

  return {
    cenario: "pedido-demissao",
    verbas,
    totalLiquido,
    direitos: {
      seguroDesemprego: false,
      saquesFgts: "nao",
      avisoPrevio: cumpriu ? "sim" : "nao",
    },
  };
}

// ─── calcAcordoMutuo ──────────────────────────────────────────────────────────

export function calcAcordoMutuo(input: SimuladorInput): CenarioResult {
  const {
    saldoSalario,
    feriasVencidasValor,
    feriasProporcionaisValor,
    decimo13Valor,
    valorAvisoCheio,
    diasAvisoPrevio,
  } = calcVerbasComunsBase(input);

  const aviso50 = valorAvisoCheio * 0.5;
  const multaFgts20 = input.saldoFgts * 0.2;

  const verbas: VerbaRescisoria[] = [
    {
      label: "Saldo de Salário",
      valor: saldoSalario,
      nota: `(salário / 30) × ${input.diasTrabalhados} dias trabalhados`,
    },
    {
      label: "Aviso Prévio (50%)",
      valor: aviso50,
      nota: `50% de ${diasAvisoPrevio} dias — CLT Art. 484-A`,
    },
    {
      label: "Férias Vencidas + 1/3",
      valor: feriasVencidasValor,
      nota: input.feriasVencidas > 0
        ? `${input.feriasVencidas} dias × (4/3)`
        : "Nenhuma férias vencida informada",
    },
    {
      label: "Férias Proporcionais + 1/3",
      valor: feriasProporcionaisValor,
      nota: `${input.feriasProporcionaisMeses} meses aquisitivos × (4/3)`,
    },
    {
      label: "13º Proporcional",
      valor: decimo13Valor,
      nota: `${input.meses13} meses no ano corrente`,
    },
    {
      label: "Multa FGTS (20%)",
      valor: multaFgts20,
      nota: input.saldoFgts > 0
        ? `20% sobre saldo FGTS de R$ ${input.saldoFgts.toFixed(2).replace(".", ",")}`
        : "Saldo FGTS não informado — multa não calculada",
    },
  ];

  const totalLiquido = verbas.reduce((acc, v) => acc + v.valor, 0);

  return {
    cenario: "acordo-mutuo",
    verbas,
    totalLiquido,
    direitos: {
      seguroDesemprego: false,
      saquesFgts: "parcial-80",
      avisoPrevio: "parcial",
    },
  };
}

// ─── Imports ──────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase } from "lucide-react";
import { Link } from "wouter";
import { PageMeta } from "@/components/page-meta";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { simuladorSchema, type SimuladorFormData } from "./simulador-demissao.schemas";
import { formatCurrency } from "./rescisao";

// ─── JSON-LD FAQ data ─────────────────────────────────────────────────────────

const FAQ_SIMULADOR = [
  {
    question: "O que é demissão sem justa causa?",
    answer:
      "Demissão sem justa causa é quando o empregador decide encerrar o contrato sem que o empregado tenha cometido falta grave. O trabalhador tem direito a aviso prévio indenizado, multa de 40% sobre o FGTS, seguro-desemprego e demais verbas rescisórias.",
  },
  {
    question: "O que é pedido de demissão?",
    answer:
      "No pedido de demissão, é o próprio empregado quem encerra o contrato. Nesse caso, não há multa sobre o FGTS, não há direito ao seguro-desemprego e o empregado deve cumprir o aviso prévio (ou ter o valor descontado caso não o cumpra).",
  },
  {
    question: "O que é o acordo mútuo (Art. 484-A)?",
    answer:
      "Criado pela Reforma Trabalhista de 2017 (CLT Art. 484-A), o acordo mútuo permite que empregador e empregado encerrem o contrato de forma consensual. O trabalhador recebe metade do aviso prévio, multa de 20% sobre o FGTS e pode sacar 80% do saldo do FGTS, mas não tem direito ao seguro-desemprego.",
  },
  {
    question: "Como é calculado o aviso prévio proporcional?",
    answer:
      "Pela Súmula 441 do TST, o aviso prévio é de 30 dias, acrescido de 3 dias por ano de serviço prestado ao mesmo empregador, até o máximo de 90 dias.",
  },
  {
    question: "O saldo do FGTS afeta os cálculos?",
    answer:
      "Sim, nas demissões sem justa causa (40% de multa) e no acordo mútuo (20% de multa), o saldo do FGTS é utilizado para calcular a multa rescisória. Se não informar o saldo, a multa não será calculada.",
  },
];

// ─── ResultDetailBlock (local) ────────────────────────────────────────────────

interface DetailItem {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}

function ResultDetailBlock({ items, isVisible }: { items: DetailItem[]; isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/30 divide-y divide-border">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-start justify-between gap-4 px-4 py-3 ${item.highlight ? "bg-success/10 rounded-b-xl" : ""}`}
        >
          <div className="flex-1">
            <span
              className={`text-sm ${item.highlight ? "font-bold text-foreground" : "text-muted-foreground"}`}
            >
              {item.label}
            </span>
            {item.note && (
              <p className="text-xs text-muted-foreground mt-0.5 italic">{item.note}</p>
            )}
          </div>
          <span
            className={`text-sm tabular-nums shrink-0 ${item.highlight ? "font-bold text-foreground" : "text-foreground"}`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── FieldError helper ────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive text-xs mt-1">
      {message}
    </p>
  );
}

// ─── ScenarioCard ─────────────────────────────────────────────────────────────

const CENARIO_LABELS: Record<CenarioResult["cenario"], string> = {
  "sem-justa-causa": "Demissão sem Justa Causa",
  "pedido-demissao": "Pedido de Demissão",
  "acordo-mutuo": "Acordo Mútuo (Art. 484-A)",
};

function ScenarioCard({
  result,
  expanded,
  onToggle,
  fgtsZero,
}: {
  result: CenarioResult;
  expanded: boolean;
  onToggle: () => void;
  fgtsZero: boolean;
}) {
  const direitos = result.direitos;

  const detailItems: DetailItem[] = result.verbas.map((v) => ({
    label: v.label,
    value: v.valor < 0 ? `− ${formatCurrency(Math.abs(v.valor))}` : formatCurrency(v.valor),
    note: v.nota,
    highlight: false,
  }));
  detailItems.push({
    label: "Total líquido",
    value: formatCurrency(result.totalLiquido),
    highlight: true,
  });

  return (
    <div
      className={`rounded-2xl border-2 p-5 flex flex-col gap-3 ${
        result.isMaiorValor ? "border-success bg-success/5" : "border-border bg-card"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-base leading-snug">
          {CENARIO_LABELS[result.cenario]}
        </h3>
        {result.isMaiorValor && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-success text-success-foreground text-xs font-semibold px-2.5 py-0.5">
            Maior valor
          </span>
        )}
      </div>

      {/* Total em destaque */}
      <p className="text-2xl font-bold tabular-nums">{formatCurrency(result.totalLiquido)}</p>

      {/* Direitos não monetários */}
      <div className="text-xs space-y-1 text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Seguro-desemprego:</span>{" "}
          {direitos.seguroDesemprego ? "Sim" : "Não"}
        </p>
        <p>
          <span className="font-semibold text-foreground">Saque FGTS:</span>{" "}
          {direitos.saquesFgts === "total"
            ? "Total"
            : direitos.saquesFgts === "parcial-80"
            ? "80% do saldo"
            : "Não permitido (regra geral)"}
        </p>
        <p>
          <span className="font-semibold text-foreground">Aviso prévio:</span>{" "}
          {direitos.avisoPrevio === "sim"
            ? "Indenizado pelo empregador"
            : direitos.avisoPrevio === "parcial"
            ? "50% (acordo mútuo)"
            : "Empregado cumpre ou desconto"}
        </p>
      </div>

      {fgtsZero && (result.cenario === "sem-justa-causa" || result.cenario === "acordo-mutuo") && (
        <p role="alert" className="text-xs text-warning-foreground bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
          Saldo FGTS não informado — multa rescisória não incluída no cálculo.
        </p>
      )}

      {/* Toggle verbas */}
      <button
        type="button"
        onClick={onToggle}
        className="text-xs text-primary underline-offset-2 hover:underline text-left"
        aria-expanded={expanded}
      >
        {expanded ? "Ocultar detalhes" : "Ver verbas detalhadas"}
      </button>

      {expanded && <ResultDetailBlock items={detailItems} isVisible={true} />}
    </div>
  );
}

// ─── SimuladorDemissaoPage ────────────────────────────────────────────────────

export default function SimuladorDemissaoPage() {
  const [cenarios, setCenarios] = useState<CenarioResult[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SimuladorFormData>({
    resolver: zodResolver(simuladorSchema),
    defaultValues: {
      feriasVencidas: 0,
      feriasProporcionaisMeses: 0,
      // saldoFgts is a string in the raw form (Zod transforms it to number)
      saldoFgts: 0 as unknown as number,
      cumpriuAvisoPrevio: true,
    },
  });

  // Reset result on any field change
  const watchedValues = watch();
  useEffect(() => {
    if (cenarios !== null) {
      setCenarios(null);
      setExpanded({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  function onSubmit(data: SimuladorFormData) {
    const input: SimuladorInput = {
      salario: data.salario,
      dataAdmissao: data.dataAdmissao,
      dataDemissao: data.dataDemissao,
      diasTrabalhados: data.diasTrabalhados,
      feriasVencidas: data.feriasVencidas,
      feriasProporcionaisMeses: data.feriasProporcionaisMeses,
      meses13: data.meses13,
      saldoFgts: data.saldoFgts,
      cumpriuAvisoPrevio: data.cumpriuAvisoPrevio,
    };

    const r1 = calcDemissaoSemJustaCausa(input);
    const r2 = calcPedidoDemissao(input);
    const r3 = calcAcordoMutuo(input);

    const totais = [r1.totalLiquido, r2.totalLiquido, r3.totalLiquido];
    const maxTotal = Math.max(...totais);

    const results: CenarioResult[] = [r1, r2, r3].map((r) => ({
      ...r,
      isMaiorValor: r.totalLiquido === maxTotal,
    }));

    setCenarios(results);
  }

  const fgtsZero = cenarios !== null && cenarios[0] !== undefined && (() => {
    const saldoRaw = watch("saldoFgts");
    return parseFloat(String(saldoRaw ?? "0").replace(",", ".")) === 0;
  })();

  const diferenca =
    cenarios !== null
      ? Math.max(...cenarios.map((c) => c.totalLiquido)) -
        Math.min(...cenarios.map((c) => c.totalLiquido))
      : 0;

  return (
    <div>
      <PageMeta
        title="Simulador de Demissão CLT — Compare 3 Cenários | Fazaconta"
        description="Simule os três cenários de demissão (sem justa causa, pedido de demissão e acordo mútuo) e compare as verbas rescisórias gratuitamente."
        faq={FAQ_SIMULADOR}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Simulador de Demissão CLT
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Compare os três cenários de demissão — sem justa causa, pedido de demissão e acordo
            mútuo — e veja qual gera o maior valor líquido.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Salário */}
          <div>
            <Label htmlFor="salario">Salário bruto (R$)</Label>
            <Input
              id="salario"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 3.000,00"
              {...register("salario")}
              className="mt-1"
            />
            <FieldError message={errors.salario?.message} />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataAdmissao">Data de admissão</Label>
              <Input
                id="dataAdmissao"
                type="date"
                {...register("dataAdmissao")}
                className="mt-1"
              />
              <FieldError message={errors.dataAdmissao?.message} />
            </div>
            <div>
              <Label htmlFor="dataDemissao">Data de demissão</Label>
              <Input
                id="dataDemissao"
                type="date"
                {...register("dataDemissao")}
                className="mt-1"
              />
              <FieldError message={errors.dataDemissao?.message} />
            </div>
          </div>

          {/* Dias trabalhados no mês + 13º */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diasTrabalhados">Dias trabalhados no mês</Label>
              <Input
                id="diasTrabalhados"
                type="number"
                min={1}
                max={31}
                {...register("diasTrabalhados")}
                className="mt-1"
              />
              <FieldError message={errors.diasTrabalhados?.message} />
            </div>
            <div>
              <Label htmlFor="meses13">Meses do 13º no ano</Label>
              <Input
                id="meses13"
                type="number"
                min={1}
                max={12}
                {...register("meses13")}
                className="mt-1"
              />
              <FieldError message={errors.meses13?.message} />
            </div>
          </div>

          {/* Férias */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feriasVencidas">Dias de férias vencidas</Label>
              <Input
                id="feriasVencidas"
                type="number"
                min={0}
                max={30}
                defaultValue={0}
                {...register("feriasVencidas")}
                className="mt-1"
              />
              <FieldError message={errors.feriasVencidas?.message} />
            </div>
            <div>
              <Label htmlFor="feriasProporcionaisMeses">
                Meses no período aquisitivo atual
              </Label>
              <Input
                id="feriasProporcionaisMeses"
                type="number"
                min={0}
                max={11}
                defaultValue={0}
                {...register("feriasProporcionaisMeses")}
                className="mt-1"
              />
              <FieldError message={errors.feriasProporcionaisMeses?.message} />
            </div>
          </div>

          {/* Saldo FGTS */}
          <div>
            <Label htmlFor="saldoFgts">Saldo do FGTS (R$)</Label>
            <Input
              id="saldoFgts"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 5.000,00 (deixe 0 se não souber)"
              {...register("saldoFgts")}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usado para calcular a multa rescisória (40% ou 20%). Deixe 0 se não souber o valor.
            </p>
            <FieldError message={errors.saldoFgts?.message} />
          </div>

          {/* Aviso prévio */}
          <div className="flex items-center gap-3">
            <input
              id="cumpriuAvisoPrevio"
              type="checkbox"
              defaultChecked
              {...register("cumpriuAvisoPrevio")}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="cumpriuAvisoPrevio" className="cursor-pointer">
              Irá cumprir o aviso prévio{" "}
              <span className="text-muted-foreground font-normal">
                (desmarque para aplicar desconto no pedido de demissão)
              </span>
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Simular cenários
          </Button>
        </form>

        {/* Results */}
        <div aria-live="polite">
          {cenarios !== null && (
            <>
              <ResultBox
                title="Comparativo de cenários de demissão"
                value={`${cenarios.length} cenários calculados`}
                description="Veja abaixo os valores e direitos de cada cenário."
                variant="success"
                isVisible={true}
              />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {cenarios.map((c) => (
                  <ScenarioCard
                    key={c.cenario}
                    result={c}
                    expanded={!!expanded[c.cenario]}
                    onToggle={() =>
                      setExpanded((prev) => ({ ...prev, [c.cenario]: !prev[c.cenario] }))
                    }
                    fgtsZero={fgtsZero}
                  />
                ))}
              </div>

              {diferenca > 0 && (
                <p className="mt-4 text-sm text-center text-muted-foreground">
                  Diferença entre o cenário mais e o menos vantajoso:{" "}
                  <strong className="text-foreground">{formatCurrency(diferenca)}</strong>
                </p>
              )}

              <p className="mt-6 text-xs text-muted-foreground text-center">
                Valores calculados com base na CLT (Arts. 477–484-A) e na Súmula 441 do TST.
                Não inclui INSS, IRRF ou outros descontos. Consulte um especialista trabalhista
                para análise do seu caso.
              </p>
            </>
          )}
        </div>

        {/* Educational content */}
        <section className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-display font-bold mb-3">
              Tipos de demissão e seus direitos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A legislação trabalhista brasileira prevê três formas principais de encerramento do
              contrato de trabalho sem justa causa do empregado: a demissão pelo empregador (sem
              justa causa), o pedido de demissão pelo empregado e o acordo mútuo, criado pela
              Reforma Trabalhista de 2017 (CLT Art. 484-A).
            </p>
          </div>

          {/* Comparativo */}
          <div>
            <h2 className="text-xl font-display font-bold mb-3">Comparativo dos três cenários</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold">Verba / Direito</th>
                    <th className="text-center px-3 py-3 font-semibold">Sem justa causa</th>
                    <th className="text-center px-3 py-3 font-semibold">Pedido demissão</th>
                    <th className="text-center px-3 py-3 font-semibold">Acordo mútuo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Saldo de salário</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Aviso prévio indenizado</td>
                    <td className="px-3 py-3 text-center">✓ integral</td>
                    <td className="px-3 py-3 text-center">Empregado cumpre</td>
                    <td className="px-3 py-3 text-center">50%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Férias + 1/3</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">13º proporcional</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Multa FGTS</td>
                    <td className="px-3 py-3 text-center">40%</td>
                    <td className="px-3 py-3 text-center">—</td>
                    <td className="px-3 py-3 text-center">20%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Saque FGTS</td>
                    <td className="px-3 py-3 text-center">Total</td>
                    <td className="px-3 py-3 text-center">Não</td>
                    <td className="px-3 py-3 text-center">80%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Seguro-desemprego</td>
                    <td className="px-3 py-3 text-center">✓</td>
                    <td className="px-3 py-3 text-center">—</td>
                    <td className="px-3 py-3 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Acordo mútuo */}
          <div>
            <h2 className="text-xl font-display font-bold mb-3">
              Acordo mútuo — inovação da Reforma Trabalhista 2017
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              O Art. 484-A da CLT, inserido pela Reforma Trabalhista (Lei 13.467/2017), criou uma
              nova modalidade em que empregador e empregado podem encerrar o contrato de comum
              acordo. O trabalhador recebe metade do aviso prévio indenizado, multa de 20% sobre o
              saldo do FGTS e pode sacar 80% do saldo — mas não tem direito ao seguro-desemprego.
              É uma alternativa interessante quando ambas as partes desejam o encerramento.
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-display font-bold mb-4">Perguntas frequentes</h2>
            <div className="space-y-4">
              {FAQ_SIMULADOR.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="font-semibold mb-1">{faq.question}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Revisado em abril de 2026.
            </p>
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Outras calculadoras trabalhistas</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/banco-de-horas" className="text-primary hover:underline text-sm">
                Calculadora de Banco de Horas
              </Link>
            </li>
            <li>
              <Link href="/calculadora-horas-extras" className="text-primary hover:underline text-sm">
                Calculadora de Horas Extras e Adicional Noturno
              </Link>
            </li>
            <li>
              <Link href="/calculadora-trabalhista-clt" className="text-primary hover:underline text-sm">
                Calculadora Trabalhista CLT (rescisão, férias e 13º)
              </Link>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
}
