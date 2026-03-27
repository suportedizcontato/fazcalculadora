import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { ResultBox, type ResultVariant } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, ArrowLeft } from "lucide-react";

// ─── Pure utility functions ───────────────────────────────────────────────────

export function normalizeDecimal(raw: string): string {
  const withPeriod = raw.replace(/,/g, ".");
  if (withPeriod.startsWith(".")) return "0" + withPeriod;
  return withPeriod;
}

export function formatBR(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Pure calc functions ──────────────────────────────────────────────────────

export function calcPorcentagemDe(percentual: number, valorBase: number): number {
  return (percentual / 100) * valorBase;
}

export function calcQuePercentual(valorParcial: number, valorTotal: number): number {
  return (valorParcial / valorTotal) * 100;
}

export function calcAumento(
  valorOriginal: number,
  percentual: number
): { acrescimo: number; valorFinal: number } {
  const acrescimo = (percentual / 100) * valorOriginal;
  return { acrescimo, valorFinal: valorOriginal + acrescimo };
}

export function calcDesconto(
  valorOriginal: number,
  percentual: number
): { desconto: number; valorFinal: number } {
  const desconto = (percentual / 100) * valorOriginal;
  return { desconto, valorFinal: valorOriginal - desconto };
}

export function calcVariacao(valorInicial: number, valorFinal: number): number {
  return ((valorFinal - valorInicial) / valorInicial) * 100;
}

// ─── Explanation builder ─────────────────────────────────────────────────────

export type CalcMode =
  | "porcentagem-de"
  | "que-percentual"
  | "aumento"
  | "desconto"
  | "variacao";

export function buildExplanation(
  mode: CalcMode,
  inputs: Record<string, number>,
  result: number | { acrescimo?: number; desconto?: number; valorFinal?: number }
): string {
  switch (mode) {
    case "porcentagem-de":
      return `${formatBR(inputs.percentual)}% de ${formatBR(inputs.valorBase)} é igual a ${formatBR(result as number)}`;
    case "que-percentual":
      return `${formatBR(inputs.valorParcial)} é ${formatBR(result as number)}% de ${formatBR(inputs.valorTotal)}`;
    case "aumento": {
      const r = result as { acrescimo: number; valorFinal: number };
      return `${formatBR(inputs.valorOriginal)} com ${formatBR(inputs.percentualAumento)}% de aumento fica ${formatBR(r.valorFinal)} (acréscimo de ${formatBR(r.acrescimo)})`;
    }
    case "desconto": {
      const r = result as { desconto: number; valorFinal: number };
      return `${formatBR(inputs.valorOriginal)} com ${formatBR(inputs.percentualDesconto)}% de desconto fica ${formatBR(r.valorFinal)} (desconto de ${formatBR(r.desconto)})`;
    }
    case "variacao":
      return `De ${formatBR(inputs.valorInicial)} para ${formatBR(inputs.valorFinal)}, a variação é de ${formatBR(result as number)}%`;
    default:
      return "";
  }
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const numericField = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} é obrigatório`)
    .refine((v) => isFinite(parseFloat(v)), { message: "Insira um número válido" })
    .refine((v) => parseFloat(v) >= 0, { message: "O valor deve ser positivo" })
    .transform((v) => parseFloat(v));

const schemas = {
  "porcentagem-de": z.object({
    percentual: numericField("Percentual"),
    valorBase: numericField("Valor base"),
  }),
  "que-percentual": z
    .object({
      valorParcial: numericField("Valor parcial"),
      valorTotal: numericField("Valor total"),
    })
    .refine((d) => d.valorTotal !== 0, {
      message: "O valor total não pode ser zero (divisão por zero)",
      path: ["valorTotal"],
    }),
  aumento: z.object({
    valorOriginal: numericField("Valor original"),
    percentualAumento: numericField("Percentual de aumento"),
  }),
  desconto: z.object({
    valorOriginal: numericField("Valor original"),
    percentualDesconto: numericField("Percentual de desconto"),
  }),
  variacao: z
    .object({
      valorInicial: numericField("Valor inicial"),
      valorFinal: numericField("Valor final"),
    })
    .refine((d) => d.valorInicial !== 0, {
      message: "O valor inicial não pode ser zero (divisão por zero)",
      path: ["valorInicial"],
    }),
} as const;

// ─── Field configs ────────────────────────────────────────────────────────────

const MODE_LABELS: Record<CalcMode, string> = {
  "porcentagem-de": "Quanto é X% de Y",
  "que-percentual": "Que percentual é A de B",
  aumento: "Aumento percentual",
  desconto: "Desconto percentual",
  variacao: "Variação percentual entre dois valores",
};

interface FieldConfig {
  name: string;
  label: string;
  placeholder: string;
}

const FIELD_CONFIGS: Record<CalcMode, [FieldConfig, FieldConfig]> = {
  "porcentagem-de": [
    { name: "percentual", label: "Percentual (%)", placeholder: "Ex: 10" },
    { name: "valorBase", label: "Valor base", placeholder: "Ex: 200" },
  ],
  "que-percentual": [
    { name: "valorParcial", label: "Valor parcial (A)", placeholder: "Ex: 30" },
    { name: "valorTotal", label: "Valor total (B)", placeholder: "Ex: 150" },
  ],
  aumento: [
    { name: "valorOriginal", label: "Valor original", placeholder: "Ex: 100" },
    { name: "percentualAumento", label: "Percentual de aumento (%)", placeholder: "Ex: 15" },
  ],
  desconto: [
    { name: "valorOriginal", label: "Valor original", placeholder: "Ex: 250" },
    { name: "percentualDesconto", label: "Percentual de desconto (%)", placeholder: "Ex: 20" },
  ],
  variacao: [
    { name: "valorInicial", label: "Valor inicial", placeholder: "Ex: 80" },
    { name: "valorFinal", label: "Valor final", placeholder: "Ex: 100" },
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalcResult {
  mainValue: string;
  explanation: string;
  variant: ResultVariant;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Porcentagem() {
  const [activeMode, setActiveMode] = useState<CalcMode>("porcentagem-de");
  const [result, setResult] = useState<CalcResult | null>(null);

  useEffect(() => {
    document.title = "Calculadora de Porcentagem | Fazaconta Online";
  }, []);

  const schema = schemas[activeMode];

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const watchedValues = watch();

  useEffect(() => {
    if (result !== null) {
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  function handleModeChange(newMode: CalcMode, event: React.MouseEvent | React.KeyboardEvent) {
    setActiveMode(newMode);
    reset();
    setResult(null);
    const isPointer = "detail" in event && (event as React.MouseEvent).detail > 0;
    if (isPointer) {
      const firstField = FIELD_CONFIGS[newMode][0].name;
      setTimeout(() => setFocus(firstField), 0);
    }
  }

  function onSubmit(data: Record<string, number>) {
    let mainValue: string;
    let explanation: string;
    let variant: ResultVariant = "success";

    switch (activeMode) {
      case "porcentagem-de": {
        const r = calcPorcentagemDe(data.percentual, data.valorBase);
        mainValue = formatBR(r);
        explanation = buildExplanation(activeMode, data, r);
        break;
      }
      case "que-percentual": {
        const r = calcQuePercentual(data.valorParcial, data.valorTotal);
        mainValue = `${formatBR(r)}%`;
        explanation = buildExplanation(activeMode, data, r);
        break;
      }
      case "aumento": {
        const r = calcAumento(data.valorOriginal, data.percentualAumento);
        mainValue = formatBR(r.valorFinal);
        explanation = buildExplanation(activeMode, data, r);
        break;
      }
      case "desconto": {
        const r = calcDesconto(data.valorOriginal, data.percentualDesconto);
        mainValue = formatBR(r.valorFinal);
        explanation = buildExplanation(activeMode, data, r);
        break;
      }
      case "variacao": {
        const r = calcVariacao(data.valorInicial, data.valorFinal);
        mainValue = `${formatBR(r)}%`;
        explanation = buildExplanation(activeMode, data, r);
        if (r < 0) variant = "warning";
        break;
      }
      default:
        return;
    }

    setResult({ mainValue, explanation, variant });
  }

  const fields = FIELD_CONFIGS[activeMode];
  const errorsTyped = errors as Record<string, { message?: string }>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 mb-4">
          <Percent className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Calculadora de Porcentagem
        </h1>
        <p className="text-lg text-muted-foreground">
          Calcule porcentagens, aumentos, descontos e variações de forma rápida.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          {/* Mode selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(MODE_LABELS) as CalcMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                data-cy={`mode-btn-${mode}`}
                onClick={(e) => handleModeChange(mode, e)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  activeMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>

          <form
            key={activeMode}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-base font-semibold">
                    {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    type="text"
                    inputMode="decimal"
                    placeholder={field.placeholder}
                    className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                    {...register(field.name, { setValueAs: normalizeDecimal })}
                  />
                  {errorsTyped[field.name] && (
                    <p role="alert" className="text-sm text-destructive">
                      {errorsTyped[field.name].message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Calcular
            </Button>
          </form>

          <div role="region" aria-live="polite" aria-label="Resultado do cálculo">
            <ResultBox
              isVisible={result !== null}
              title="Resultado"
              value={result?.mainValue ?? ""}
              description={result?.explanation}
              variant={result?.variant}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
