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
    document.title = "Calculadora de Porcentagem Online Grátis | Fazaconta";

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const previousContent = metaDesc.content;
    metaDesc.content =
      "Calcule porcentagem de forma rápida e fácil. Descubra valores, descontos e aumentos percentuais com nossa calculadora online gratuita.";

    return () => {
      metaDesc!.content = previousContent;
    };
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
          Calculadora de Porcentagem Online
        </h1>
        <p className="text-lg font-medium text-foreground mb-2">
          Para calcular porcentagem, use a fórmula: (parte ÷ total) × 100. Exemplo: 50 é 25% de 200.
        </p>
        <p className="text-lg text-muted-foreground">
          Calcule porcentagens de forma rápida e gratuita. Use os cinco modos disponíveis: calcular quanto é X% de um valor, descobrir que percentual um valor representa de outro, calcular aumento percentual, calcular desconto percentual e calcular a variação percentual entre dois valores.
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
                aria-pressed={activeMode === mode}
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

      <div className="mt-10 space-y-8 text-base text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">Como calcular porcentagem?</h2>
          <p className="text-muted-foreground mb-3">
            Para calcular porcentagem de um número, divida a parte pelo total e multiplique por 100.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
            <li>Quanto é 10% de 200? = 20</li>
            <li>Quanto é 15% de 300? = 45</li>
            <li>Quanto é 30% de 150? = 45</li>
          </ul>
          <p className="text-muted-foreground">
            Use a fórmula: <strong>Resultado = Valor × Percentual ÷ 100</strong>.
            Por exemplo, para saber quanto é 15% de R$&nbsp;200,00, basta calcular 200 × 15 ÷ 100 = R$&nbsp;30,00.
            A calculadora acima faz esse cálculo automaticamente assim que você preenche os campos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Exemplos práticos de porcentagem</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Desconto em compra:</strong> um produto de R$&nbsp;150,00 com 20% de desconto sai por R$&nbsp;120,00.</li>
            <li><strong>Aumento salarial:</strong> um salário de R$&nbsp;3.000,00 com reajuste de 8% passa a ser R$&nbsp;3.240,00.</li>
            <li><strong>Comissão sobre vendas:</strong> uma comissão de 5% sobre R$&nbsp;10.000,00 em vendas equivale a R$&nbsp;500,00.</li>
            <li><strong>Variação de preço de produto:</strong> um item que custava R$&nbsp;80,00 e passou a custar R$&nbsp;92,00 teve uma variação de +15%.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Como calcular aumento e desconto percentual?</h2>
          <p className="text-muted-foreground mb-2">
            Para calcular aumento percentual ou desconto percentual de um valor, use as fórmulas abaixo.
          </p>
          <p className="text-muted-foreground">
            Para calcular um <strong>aumento percentual</strong>, use: Valor final = Valor × (1 + P/100).
            Exemplo: R$&nbsp;500,00 com 10% de aumento → 500 × 1,10 = R$&nbsp;550,00.
            Para calcular um <strong>desconto percentual</strong>, use: Valor final = Valor × (1 − P/100).
            Exemplo: R$&nbsp;500,00 com 10% de desconto → 500 × 0,90 = R$&nbsp;450,00.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Perguntas frequentes</h2>

          <h3 className="font-semibold mt-4 mb-1">Como calcular 10% de um valor?</h3>
          <p className="text-muted-foreground">
            Divida o valor por 10. Por exemplo, 10% de R$&nbsp;350,00 é R$&nbsp;35,00.
            No modo "Quanto é X% de Y" desta calculadora, basta digitar 10 no campo de percentual e o valor desejado no campo de base.
          </p>

          <h3 className="font-semibold mt-4 mb-1">Como saber quantos por cento um valor representa?</h3>
          <p className="text-muted-foreground">
            Use a fórmula: Percentual = (Valor Parcial ÷ Valor Total) × 100.
            Exemplo: 45 é qual percentual de 180? → (45 ÷ 180) × 100 = 25%.
            Use o modo "Que percentual é A de B" para calcular isso diretamente.
          </p>

          <h3 className="font-semibold mt-4 mb-1">Qual a diferença entre aumento e variação percentual?</h3>
          <p className="text-muted-foreground">
            O <strong>aumento percentual</strong> aplica uma taxa a um valor base para obter o novo valor.
            A <strong>variação percentual</strong> compara dois valores já conhecidos e retorna a taxa de mudança entre eles — que pode ser positiva (alta) ou negativa (queda).
          </p>
        </section>
      </div>

      <div className="mt-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
