// ─── Task 1.1: Shared utilities ───────────────────────────────────────────────

export function normalizeDecimal(raw: string): string {
  let s = raw.replace(/,/g, ".");
  if (s.startsWith(".")) s = "0" + s;
  return s;
}

export function formatSalarioInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  if (num === 0) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ─── Task 1.2: Domain types ───────────────────────────────────────────────────

type TipoDesligamento =
  | "sem-justa-causa"
  | "pedido-demissao"
  | "justa-causa"
  | "acordo-mutuo";

export type RescisaoInput = {
  salario: number;
  tipoDesligamento: TipoDesligamento;
  anos: number;
  meses: number;
  diasTrabalhados: number;
  meses13: number;
  avisoPrevioCumprido: boolean;
};

export type RescisaoResult = {
  saldoSalario: number;
  feriasProporcionais: number;
  decimoProporcional: number;
  multaFgts: number | null;
  deducaoAvisoPrevio: number | null;
  totalEstimado: number;
  mesesTotais: number;
  mesesAquisitivos: number;
};

// ─── Task 1.2: calcRescisao ───────────────────────────────────────────────────

export function calcRescisao(input: RescisaoInput): RescisaoResult {
  const { salario, tipoDesligamento, anos, meses, diasTrabalhados, meses13, avisoPrevioCumprido } = input;

  const mesesTotais = anos * 12 + meses;
  const mesesAquisitivos = mesesTotais % 12;

  const saldoSalario = (salario / 30) * diasTrabalhados;
  const feriasProporcionais = mesesAquisitivos === 0
    ? 0
    : (salario / 12) * mesesAquisitivos * (4 / 3);
  const decimoProporcional = (salario / 12) * meses13;

  const baseFgts = salario * mesesTotais * 0.08;
  let multaFgts: number | null = null;
  if (tipoDesligamento === "sem-justa-causa") multaFgts = baseFgts * 0.40;
  else if (tipoDesligamento === "acordo-mutuo") multaFgts = baseFgts * 0.20;

  const deducaoAvisoPrevio: number | null =
    tipoDesligamento === "pedido-demissao" && !avisoPrevioCumprido
      ? salario * 1
      : null;

  const totalEstimado =
    saldoSalario +
    feriasProporcionais +
    decimoProporcional +
    (multaFgts ?? 0) -
    (deducaoAvisoPrevio ?? 0);

  return {
    saldoSalario,
    feriasProporcionais,
    decimoProporcional,
    multaFgts,
    deducaoAvisoPrevio,
    totalEstimado,
    mesesTotais,
    mesesAquisitivos,
  };
}

// ─── Task 1.3: FeriasInput / FeriasResult ─────────────────────────────────────

export type FeriasInput = {
  salario: number;
  mesesAquisitivos: number;
  solicitarAbono: boolean;
};

export type FeriasResult = {
  totalFerias: number;
  abonoPecuniario: number | null;
  feriasSemAbono: number | null;
};

export function calcFerias(input: FeriasInput): FeriasResult {
  const { salario, mesesAquisitivos, solicitarAbono } = input;
  const totalFerias = (salario / 12) * mesesAquisitivos * (4 / 3);
  if (solicitarAbono) {
    return {
      totalFerias,
      abonoPecuniario: totalFerias / 3,
      feriasSemAbono: totalFerias * (2 / 3),
    };
  }
  return { totalFerias, abonoPecuniario: null, feriasSemAbono: null };
}

// ─── Task 1.3: DecimoInput / DecimoResult ─────────────────────────────────────

export type DecimoInput = {
  salario: number;
  mesesTrabalhados: number;
};

export type DecimoResult = {
  valorDecimo: number;
};

export function calcDecimo(input: DecimoInput): DecimoResult {
  const { salario, mesesTrabalhados } = input;
  return { valorDecimo: (salario / 12) * mesesTrabalhados };
}

// ─── Task 1.4: buildNarrative* ────────────────────────────────────────────────

export function buildNarrativeRescisao(input: RescisaoInput, result: RescisaoResult): string {
  const { tipoDesligamento, diasTrabalhados, meses13, avisoPrevioCumprido } = input;
  const {
    saldoSalario,
    feriasProporcionais,
    decimoProporcional,
    multaFgts,
    deducaoAvisoPrevio,
    totalEstimado,
    mesesTotais,
    mesesAquisitivos,
  } = result;

  const tipoLabel: Record<string, string> = {
    "sem-justa-causa": "sem justa causa",
    "pedido-demissao": "por pedido de demissão",
    "justa-causa": "por justa causa",
    "acordo-mutuo": "por acordo mútuo",
  };

  const parts: string[] = [
    `Rescisão ${tipoLabel[tipoDesligamento]} com ${mesesTotais} ${mesesTotais === 1 ? "mês" : "meses"} de contrato.`,
    `Saldo de salário (${diasTrabalhados} dias): ${formatCurrency(saldoSalario)}.`,
    `Férias proporcionais (${mesesAquisitivos} ${mesesAquisitivos === 1 ? "mês" : "meses"} aquisitivos): ${formatCurrency(feriasProporcionais)}.`,
    `13º proporcional (${meses13} ${meses13 === 1 ? "mês" : "meses"}): ${formatCurrency(decimoProporcional)}.`,
  ];

  if (multaFgts !== null) {
    const pct = tipoDesligamento === "sem-justa-causa" ? "40%" : "20%";
    parts.push(`Multa FGTS (${pct}): ${formatCurrency(multaFgts)}.`);
  }

  if (deducaoAvisoPrevio !== null) {
    parts.push(`Dedução — aviso prévio não cumprido: ${formatCurrency(deducaoAvisoPrevio)}.`);
  }

  parts.push(`Total estimado: ${formatCurrency(totalEstimado)}.`);
  return parts.join(" ");
}

export function buildNarrativeFerias(input: FeriasInput, result: FeriasResult): string {
  const { mesesAquisitivos, solicitarAbono } = input;
  const { totalFerias, abonoPecuniario, feriasSemAbono } = result;

  const parts: string[] = [
    `Férias proporcionais a ${mesesAquisitivos} ${mesesAquisitivos === 1 ? "mês" : "meses"} aquisitivos: ${formatCurrency(totalFerias)}.`,
  ];

  if (solicitarAbono && abonoPecuniario !== null && feriasSemAbono !== null) {
    parts.push(`Com abono pecuniário: ${formatCurrency(abonoPecuniario)}.`);
    parts.push(`Férias restantes (2/3): ${formatCurrency(feriasSemAbono)}.`);
  }

  return parts.join(" ");
}

export function buildNarrativeDecimo(input: DecimoInput, result: DecimoResult): string {
  const { mesesTrabalhados } = input;
  const { valorDecimo } = result;
  return `13º salário proporcional a ${mesesTrabalhados} ${mesesTrabalhados === 1 ? "mês" : "meses"}: ${formatCurrency(valorDecimo)}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Task 4.1: TrabalhistaPage — hub com Tabs ─────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { PageMeta } from "@/components/page-meta";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase } from "lucide-react";
import { Link } from "wouter";
import {
  rescisaoSchema,
  feriasSchema,
  decimoSchema,
} from "./rescisao.schemas";
import type {
  RescisaoFormData,
  FeriasFormData,
  DecimoFormData,
} from "./rescisao.schemas";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleKey = "rescisao" | "ferias" | "decimo";

type DetailItem = {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
};

type PageResult =
  | { module: "rescisao"; data: RescisaoResult; narrative: string }
  | { module: "ferias"; data: FeriasResult; narrative: string }
  | { module: "decimo"; data: DecimoResult; narrative: string }
  | null;

// ─── ResultDetailBlock ────────────────────────────────────────────────────────

interface ResultDetailBlockProps {
  items: DetailItem[];
  isVisible: boolean;
}

function ResultDetailBlock({ items, isVisible }: ResultDetailBlockProps) {
  if (!isVisible) return null;
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30 divide-y divide-border">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-start justify-between gap-4 px-4 py-3 ${item.highlight ? "bg-success/10 rounded-b-xl" : ""}`}
        >
          <div className="flex-1">
            <span className={`text-sm ${item.highlight ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              {item.label}
            </span>
            {item.note && (
              <p className="text-xs text-muted-foreground mt-0.5 italic">{item.note}</p>
            )}
          </div>
          <span className={`text-sm tabular-nums shrink-0 ${item.highlight ? "font-bold text-foreground" : "text-foreground"}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function makeIntHandlers(max: number) {
  const maxDigits = String(max).length;
  return {
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (["-", "+", "e", "E", "."].includes(e.key)) { e.preventDefault(); return; }
      const el = e.currentTarget;
      if (
        /^\d$/.test(e.key) &&
        el.value.length >= maxDigits &&
        el.selectionStart === el.selectionEnd
      ) e.preventDefault();
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TrabalhistaPage() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("rescisao");
  const [result, setResult] = useState<PageResult>(null);


  // ── Three independent form instances ──────────────────────────────────────

  const formRescisao = useForm<RescisaoFormData>({
    resolver: zodResolver(rescisaoSchema),
    defaultValues: {
      tipoDesligamento: "sem-justa-causa",
      avisoPrevioCumprido: true,
    },
  });

  const formFerias = useForm<FeriasFormData>({
    resolver: zodResolver(feriasSchema),
    defaultValues: {
      solicitarAbono: false,
    },
  });

  const formDecimo = useForm<DecimoFormData>({
    resolver: zodResolver(decimoSchema),
    defaultValues: {},
  });

  // ── Derived state for inline warnings (Rescisão module) ───────────────────

  const watchAnos = formRescisao.watch("anos");
  const watchMeses = formRescisao.watch("meses");
  const watchMeses13 = formRescisao.watch("meses13");

  const mesesTotaisWatch = (Number(watchAnos) || 0) * 12 + (Number(watchMeses) || 0);
  const showNotaFeriasZeradas = mesesTotaisWatch > 0 && mesesTotaisWatch % 12 === 0;
  const showAvisoMeses13 = (Number(watchMeses13) || 0) > Math.min(12, mesesTotaisWatch);

  // ── Reactive result reset when any field changes ──────────────────────────

  useEffect(() => {
    if (result !== null) setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(formRescisao.watch()),
    JSON.stringify(formFerias.watch()),
    JSON.stringify(formDecimo.watch()),
  ]);

  // ── Module change handler ─────────────────────────────────────────────────

  function handleModuleChange(newModule: string) {
    formRescisao.reset();
    formFerias.reset();
    formDecimo.reset();
    setResult(null);
    setActiveModule(newModule as ModuleKey);
  }

  // ── Submit handlers ───────────────────────────────────────────────────────

  function onSubmitRescisao(data: RescisaoFormData) {
    const calcResult = calcRescisao(data);
    const narrative = buildNarrativeRescisao(data, calcResult);
    setResult({ module: "rescisao", data: calcResult, narrative });
  }

  function onSubmitFerias(data: FeriasFormData) {
    const calcResult = calcFerias(data);
    const narrative = buildNarrativeFerias(data, calcResult);
    setResult({ module: "ferias", data: calcResult, narrative });
  }

  function onSubmitDecimo(data: DecimoFormData) {
    const calcResult = calcDecimo(data);
    const narrative = buildNarrativeDecimo(data, calcResult);
    setResult({ module: "decimo", data: calcResult, narrative });
  }

  function onError(errors: FieldErrors) {
    setResult(null);
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;
    if (activeModule === "rescisao") formRescisao.setFocus(firstKey as keyof RescisaoFormData);
    else if (activeModule === "ferias") formFerias.setFocus(firstKey as keyof FeriasFormData);
    else formDecimo.setFocus(firstKey as keyof DecimoFormData);
  }

  // ── Build detail items for ResultDetailBlock ──────────────────────────────

  function buildRescisaoItems(data: RescisaoResult): DetailItem[] {
    const items: DetailItem[] = [
      {
        label: "Saldo de salário",
        value: formatCurrency(data.saldoSalario),
      },
      {
        label: "Férias proporcionais",
        value: formatCurrency(data.feriasProporcionais),
        note: data.mesesAquisitivos === 0
          ? "Período aquisitivo corrente zerado. Férias vencidas de ciclos anteriores não são consideradas nesta estimativa."
          : undefined,
      },
      {
        label: "13º proporcional — parte da rescisão",
        value: formatCurrency(data.decimoProporcional),
      },
    ];

    if (data.multaFgts !== null) {
      items.push({
        label: "Multa FGTS",
        value: formatCurrency(data.multaFgts),
      });
    }

    if (data.deducaoAvisoPrevio !== null) {
      items.push({
        label: "Dedução — aviso prévio não cumprido",
        value: `- ${formatCurrency(data.deducaoAvisoPrevio)}`,
      });
    }

    items.push({
      label: "Total Estimado",
      value: formatCurrency(data.totalEstimado),
      highlight: true,
    });

    return items;
  }

  function buildFeriasItems(data: FeriasResult): DetailItem[] {
    const items: DetailItem[] = [
      {
        label: "Total de férias (com 1/3)",
        value: formatCurrency(data.totalFerias),
        highlight: data.abonoPecuniario === null,
      },
    ];

    if (data.abonoPecuniario !== null && data.feriasSemAbono !== null) {
      items[0].highlight = false;
      items.push(
        { label: "Abono pecuniário (1/3 das férias)", value: formatCurrency(data.abonoPecuniario) },
        { label: "Férias restantes (2/3)", value: formatCurrency(data.feriasSemAbono), highlight: true },
      );
    }

    return items;
  }

  function buildDecimoItems(data: DecimoResult): DetailItem[] {
    return [
      {
        label: "13º salário proporcional",
        value: formatCurrency(data.valorDecimo),
        highlight: true,
      },
    ];
  }

  // ── Computed result display values ────────────────────────────────────────

  const resultTitle = result?.module === "rescisao"
    ? "Total Estimado da Rescisão"
    : result?.module === "ferias"
    ? "Total de Férias"
    : "13º Salário Proporcional";

  const resultValue = result === null
    ? ""
    : result.module === "rescisao"
    ? formatCurrency(result.data.totalEstimado)
    : result.module === "ferias"
    ? formatCurrency(result.data.totalFerias)
    : formatCurrency(result.data.valorDecimo);

  const detailItems: DetailItem[] =
    result === null
      ? []
      : result.module === "rescisao"
      ? buildRescisaoItems(result.data)
      : result.module === "ferias"
      ? buildFeriasItems(result.data)
      : buildDecimoItems(result.data);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      <PageMeta
        title="Calculadora Trabalhista CLT | Rescisão, Férias e 13º | Fazaconta"
        description="Calcule rescisão, férias proporcionais e 13º salário pela CLT de forma rápida, gratuita e sem cadastro."
        faq={[
          {
            question: "Quais verbas entram na rescisão sem justa causa?",
            answer: "Na demissão sem justa causa o trabalhador tem direito a: saldo de salário, férias proporcionais com 1/3, 13º proporcional, aviso prévio (trabalhado ou indenizado) e multa de 40% sobre o saldo do FGTS.",
          },
          {
            question: "Qual a diferença entre demissão sem justa causa e acordo mútuo?",
            answer: "No acordo mútuo (CLT Art. 484-A, incluído pela Reforma Trabalhista de 2017), o aviso prévio é de 50% e a multa do FGTS é de 20%. O trabalhador não tem direito ao seguro-desemprego e pode sacar apenas 80% do FGTS.",
          },
          {
            question: "O que é a multa de 40% do FGTS?",
            answer: "É uma indenização paga pelo empregador ao trabalhador demitido sem justa causa, calculada sobre o saldo total depositado no FGTS durante o contrato. A empresa deposita diretamente na conta do FGTS do trabalhador.",
          },
          {
            question: "Férias proporcionais são sempre pagas na rescisão?",
            answer: "Sim, exceto em demissão por justa causa, onde o trabalhador perde as férias proporcionais. Férias vencidas (período aquisitivo completo) são pagas em qualquer modalidade de rescisão, inclusive por justa causa.",
          },
        ]}
      />
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Calculadora Trabalhista CLT
        </h1>
        <p className="text-lg text-muted-foreground">
          Estime rescisão, férias proporcionais e 13º salário de forma rápida e sem cadastro.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          <Tabs value={activeModule} onValueChange={handleModuleChange}>
            <TabsList className="w-full mb-6 h-auto flex-wrap">
              <TabsTrigger value="rescisao" data-cy="module-tab-rescisao" className="flex-1 text-xs sm:text-sm">
                Rescisão CLT
              </TabsTrigger>
              <TabsTrigger value="ferias" data-cy="module-tab-ferias" className="flex-1 text-xs sm:text-sm">
                Férias
              </TabsTrigger>
              <TabsTrigger value="decimo" data-cy="module-tab-decimo" className="flex-1 text-xs sm:text-sm">
                13º Salário
              </TabsTrigger>
            </TabsList>

            {/* ── Módulo Rescisão ── */}
            <TabsContent value="rescisao">
              <form
                onSubmit={formRescisao.handleSubmit(onSubmitRescisao, onError)}
                className="space-y-5"
              >
                {/* Salário */}
                <div className="space-y-2">
                  <Label htmlFor="r-salario" className="text-base font-semibold">
                    Salário Bruto (R$)
                  </Label>
                  <Input
                    id="r-salario"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 3.500,00"
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formRescisao.register("salario")}
                  />
                  {formRescisao.formState.errors.salario && (
                    <p role="alert" className="text-sm text-destructive">
                      {formRescisao.formState.errors.salario.message}
                    </p>
                  )}
                </div>

                {/* Tipo de desligamento */}
                <div className="space-y-2">
                  <Label htmlFor="r-tipo" className="text-base font-semibold">
                    Tipo de desligamento
                  </Label>
                  <Controller
                    control={formRescisao.control}
                    name="tipoDesligamento"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="r-tipo" className="h-14 text-base bg-muted/50">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sem-justa-causa">Demissão sem justa causa</SelectItem>
                          <SelectItem value="pedido-demissao">Pedido de demissão</SelectItem>
                          <SelectItem value="justa-causa">Demissão por justa causa</SelectItem>
                          <SelectItem value="acordo-mutuo">Acordo mútuo</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formRescisao.formState.errors.tipoDesligamento && (
                    <p role="alert" className="text-sm text-destructive">
                      {formRescisao.formState.errors.tipoDesligamento.message}
                    </p>
                  )}
                </div>

                {/* Anos e Meses de contrato */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="r-anos" className="text-base font-semibold">
                      Anos de contrato
                    </Label>
                    <Input
                      id="r-anos"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Ex: 2"
                      {...makeIntHandlers(100)}
                      className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                      {...formRescisao.register("anos")}
                    />
                    {formRescisao.formState.errors.anos && (
                      <p role="alert" className="text-sm text-destructive">
                        {formRescisao.formState.errors.anos.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-meses" className="text-base font-semibold">
                      Meses restantes (1–11)
                    </Label>
                    <Input
                      id="r-meses"
                      type="number"
                      min={0}
                      max={11}
                      placeholder="Ex: 3"
                      {...makeIntHandlers(11)}
                      className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                      {...formRescisao.register("meses")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio se o contrato tem anos completos.
                    </p>
                    {formRescisao.formState.errors.meses && (
                      <p role="alert" className="text-sm text-destructive">
                        {formRescisao.formState.errors.meses.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nota reativa: férias zeradas */}
                {showNotaFeriasZeradas && (
                  <p role="status" className="text-xs text-muted-foreground italic px-1">
                    Período aquisitivo corrente zerado. Férias vencidas de ciclos anteriores não são consideradas nesta estimativa.
                  </p>
                )}

                {/* Dias trabalhados no mês */}
                <div className="space-y-2">
                  <Label htmlFor="r-dias" className="text-base font-semibold">
                    Dias trabalhados no mês atual (1–31)
                  </Label>
                  <Input
                    id="r-dias"
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ex: 15"
                    {...makeIntHandlers(31)}
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formRescisao.register("diasTrabalhados")}
                  />
                  {formRescisao.formState.errors.diasTrabalhados && (
                    <p role="alert" className="text-sm text-destructive">
                      {formRescisao.formState.errors.diasTrabalhados.message}
                    </p>
                  )}
                </div>

                {/* Meses do 13º */}
                <div className="space-y-2">
                  <Label htmlFor="r-meses13" className="text-base font-semibold">
                    Meses do 13º (parte da rescisão)
                  </Label>
                  <Input
                    id="r-meses13"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="Ex: 3"
                    aria-label="13º proporcional — parte da rescisão"
                    {...makeIntHandlers(12)}
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formRescisao.register("meses13")}
                  />
                  <p className="text-xs text-muted-foreground">
                    A contagem de meses é de sua responsabilidade. Para simulação completa do 13º anual, use o módulo 13º Salário Proporcional.
                  </p>
                  {showAvisoMeses13 && (
                    <p role="status" className="text-xs text-warning-foreground bg-warning/10 border border-warning/20 rounded-md px-3 py-2">
                      Valor maior que o tempo de contrato informado. Verifique se está correto.
                    </p>
                  )}
                  {formRescisao.formState.errors.meses13 && (
                    <p role="alert" className="text-sm text-destructive">
                      {formRescisao.formState.errors.meses13.message}
                    </p>
                  )}
                </div>

                {/* Aviso prévio cumprido */}
                <Controller
                  control={formRescisao.control}
                  name="avisoPrevioCumprido"
                  render={({ field }) => (
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="r-aviso"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <div>
                        <Label htmlFor="r-aviso" className="text-sm font-medium cursor-pointer">
                          Aviso prévio cumprido
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Desmarque se houve pedido de demissão sem cumprir o aviso prévio (gera dedução).
                        </p>
                      </div>
                    </div>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Calcular Rescisão
                </Button>
              </form>
            </TabsContent>

            {/* ── Módulo Férias ── */}
            <TabsContent value="ferias">
              <form
                onSubmit={formFerias.handleSubmit(onSubmitFerias, onError)}
                className="space-y-5"
              >
                {/* Salário */}
                <div className="space-y-2">
                  <Label htmlFor="f-salario" className="text-base font-semibold">
                    Salário Bruto (R$)
                  </Label>
                  <Input
                    id="f-salario"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 3.500,00"
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formFerias.register("salario")}
                  />
                  {formFerias.formState.errors.salario && (
                    <p role="alert" className="text-sm text-destructive">
                      {formFerias.formState.errors.salario.message}
                    </p>
                  )}
                </div>

                {/* Meses aquisitivos */}
                <div className="space-y-2">
                  <Label htmlFor="f-meses" className="text-base font-semibold">
                    Meses aquisitivos (1–12)
                  </Label>
                  <Input
                    id="f-meses"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="Ex: 8"
                    {...makeIntHandlers(12)}
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formFerias.register("mesesAquisitivos")}
                  />
                  {formFerias.formState.errors.mesesAquisitivos && (
                    <p role="alert" className="text-sm text-destructive">
                      {formFerias.formState.errors.mesesAquisitivos.message}
                    </p>
                  )}
                </div>

                {/* Solicitar abono */}
                <Controller
                  control={formFerias.control}
                  name="solicitarAbono"
                  render={({ field }) => (
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="f-abono"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <div>
                        <Label htmlFor="f-abono" className="text-sm font-medium cursor-pointer">
                          Solicitar abono pecuniário (vender 1/3 das férias)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          O abono corresponde a 1/3 do total de férias; você recebe os 2/3 restantes como descanso.
                        </p>
                      </div>
                    </div>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Calcular Férias
                </Button>
              </form>
            </TabsContent>

            {/* ── Módulo 13º Salário ── */}
            <TabsContent value="decimo">
              <form
                onSubmit={formDecimo.handleSubmit(onSubmitDecimo, onError)}
                className="space-y-5"
              >
                {/* Salário */}
                <div className="space-y-2">
                  <Label htmlFor="d-salario" className="text-base font-semibold">
                    Salário Bruto (R$)
                  </Label>
                  <Input
                    id="d-salario"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 3.500,00"
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formDecimo.register("salario")}
                  />
                  {formDecimo.formState.errors.salario && (
                    <p role="alert" className="text-sm text-destructive">
                      {formDecimo.formState.errors.salario.message}
                    </p>
                  )}
                </div>

                {/* Meses trabalhados */}
                <div className="space-y-2">
                  <Label htmlFor="d-meses" className="text-base font-semibold">
                    Meses trabalhados no ano (1–12)
                  </Label>
                  <Input
                    id="d-meses"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="Ex: 8"
                    {...makeIntHandlers(12)}
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...formDecimo.register("mesesTrabalhados")}
                  />
                  {formDecimo.formState.errors.mesesTrabalhados && (
                    <p role="alert" className="text-sm text-destructive">
                      {formDecimo.formState.errors.mesesTrabalhados.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Calcular 13º Salário
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* ── Result area ── */}
          <div role="region" aria-live="polite" aria-label="Resultado do cálculo">
            <ResultBox
              isVisible={result !== null}
              title={resultTitle}
              value={resultValue}
              description={result?.narrative}
              variant="success"
            />
            {result !== null && (
              <ResultDetailBlock items={detailItems} isVisible={true} />
            )}
            {result !== null && result.module === "rescisao" && (
              <p className="text-xs text-muted-foreground mt-4 px-1">
                <strong>Aviso legal:</strong> Esta é uma estimativa simplificada. Não inclui descontos de INSS, IRRF, aviso prévio proporcional por tempo de casa, férias vencidas de ciclos anteriores, horas extras ou outros fatores individuais. Não substitui o cálculo oficial do RH ou assessoria jurídica trabalhista.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-right">
        Revisado pela equipe Fazaconta · Abril de 2026
      </p>

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
            <Link href="/simulador-demissao" className="text-primary hover:underline text-sm">
              Simulador de Cenários de Demissão
            </Link>
          </li>
        </ul>
      </section>

    </div>
  );
}
