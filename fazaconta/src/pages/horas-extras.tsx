import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock } from "lucide-react";
import { Link } from "wouter";
import { PageMeta } from "@/components/page-meta";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  horasExtrasSchema,
  SALARIO_MINIMO_2025,
  type HorasExtrasFormData,
} from "./horas-extras.schemas";
import { formatCurrency } from "./rescisao";

// ─── Domain types ─────────────────────────────────────────────────────────────

export type HorasExtrasInput = {
  salario: number;
  jornadaDiaria: number;               // padrão 8
  diasSemana: number;                  // padrão 5
  horasExtrasUteis: number;            // horas extras em dias úteis (adicional 50%)
  horasExtrasFeriado: number;          // horas extras em domingos/feriados (adicional 100%)
  horasNoturnas: number;               // horas trabalhadas entre 22h–05h
  horasExtrasNoturnas: number;         // horas simultaneamente extras E noturnas (dias úteis)
  horasExtrasNoturnasFerias: number;   // horas extras noturnas em domingos/feriados
};

export type HorasExtrasResult = {
  valorHoraNormal: number;
  subtotalHE50: number;
  subtotalHE100: number;
  subtotalAdicionalNoturno: number;
  subtotalHENoturna50: number;   // hora extra noturna dias úteis = × 1.50 × 1.20
  subtotalHENoturna100: number;  // hora extra noturna feriado = × 2.00 × 1.20
  totalGeral: number;
};

// ─── calcHorasExtras ──────────────────────────────────────────────────────────

export function calcHorasExtras(input: HorasExtrasInput): HorasExtrasResult {
  const {
    salario,
    jornadaDiaria,
    diasSemana,
    horasExtrasUteis,
    horasExtrasFeriado,
    horasNoturnas,
    horasExtrasNoturnas,
    horasExtrasNoturnasFerias,
  } = input;

  // valorHoraNormal = salario / (jornadaDiaria × diasSemana × 4.333)
  const valorHoraNormal = salario / (jornadaDiaria * diasSemana * 4.333);

  // HE 50%: horas extras em dias úteis
  const subtotalHE50 = horasExtrasUteis * valorHoraNormal * 1.5;

  // HE 100%: horas extras em domingos/feriados
  const subtotalHE100 = horasExtrasFeriado * valorHoraNormal * 2.0;

  // Adicional noturno: 20% sobre a hora normal (CLT Art. 73)
  const subtotalAdicionalNoturno = horasNoturnas * valorHoraNormal * 0.2;

  // HE noturna cumulativa — dias úteis: hora extra (50%) + noturno (20%) = × 1.50 × 1.20
  const subtotalHENoturna50 = horasExtrasNoturnas * valorHoraNormal * 1.5 * 1.2;

  // HE noturna cumulativa — feriados: hora extra (100%) + noturno (20%) = × 2.00 × 1.20
  const subtotalHENoturna100 = horasExtrasNoturnasFerias * valorHoraNormal * 2.0 * 1.2;

  const totalGeral =
    subtotalHE50 +
    subtotalHE100 +
    subtotalAdicionalNoturno +
    subtotalHENoturna50 +
    subtotalHENoturna100;

  return {
    valorHoraNormal,
    subtotalHE50,
    subtotalHE100,
    subtotalAdicionalNoturno,
    subtotalHENoturna50,
    subtotalHENoturna100,
    totalGeral,
  };
}

// ─── buildNarrativeHorasExtras ────────────────────────────────────────────────

export function buildNarrativeHorasExtras(
  input: HorasExtrasInput,
  result: HorasExtrasResult
): string {
  const parts: string[] = [];

  if (result.subtotalHE50 > 0) {
    parts.push(
      `${input.horasExtrasUteis}h extra(s) em dias úteis (50%): ${formatCurrency(result.subtotalHE50)}`
    );
  }
  if (result.subtotalHE100 > 0) {
    parts.push(
      `${input.horasExtrasFeriado}h extra(s) em domingos/feriados (100%): ${formatCurrency(result.subtotalHE100)}`
    );
  }
  if (result.subtotalAdicionalNoturno > 0) {
    parts.push(
      `${input.horasNoturnas}h noturna(s) (adicional 20%): ${formatCurrency(result.subtotalAdicionalNoturno)}`
    );
  }
  if (result.subtotalHENoturna50 > 0) {
    parts.push(
      `${input.horasExtrasNoturnas}h extra(s) noturna(s) em dias úteis (50% + 20%): ${formatCurrency(result.subtotalHENoturna50)}`
    );
  }
  if (result.subtotalHENoturna100 > 0) {
    parts.push(
      `${input.horasExtrasNoturnasFerias}h extra(s) noturna(s) em feriados (100% + 20%): ${formatCurrency(result.subtotalHENoturna100)}`
    );
  }

  if (parts.length === 0) return "Nenhuma hora extra ou adicional informado.";
  return parts.join(" • ");
}

// ─── JSON-LD FAQ data ─────────────────────────────────────────────────────────

const FAQ_HORAS_EXTRAS = [
  {
    question: "Qual é o percentual mínimo para hora extra em dia útil?",
    answer:
      "A CLT (Art. 59) garante adicional mínimo de 50% sobre o valor da hora normal para horas extras em dias úteis. Convenções coletivas podem prever percentuais maiores.",
  },
  {
    question: "Qual é o percentual para hora extra em domingo ou feriado?",
    answer:
      "Horas extras trabalhadas em domingos e feriados têm adicional de 100% sobre a hora normal, totalizando o dobro da hora regular.",
  },
  {
    question: "O que é adicional noturno e qual o percentual?",
    answer:
      "O adicional noturno é devido para o trabalho realizado entre 22h e 5h. A CLT (Art. 73) garante 20% a mais sobre o valor da hora diurna, além da hora noturna reduzida (52min30s = 1 hora).",
  },
  {
    question: "Como funciona a hora extra noturna (cumulativo)?",
    answer:
      "Quando a hora extra é também noturna, os adicionais se acumulam: para dias úteis = 50% (HE) + 20% (noturno); para domingos/feriados = 100% (HE) + 20% (noturno). Os percentuais incidem sobre a hora normal diurna.",
  },
  {
    question: "Existe limite de horas extras por dia?",
    answer:
      "Sim. A CLT limita a 2 horas extras por dia (Art. 59). Acordos coletivos podem ampliar esse limite em situações excepcionais, mas a regra geral é de 2h.",
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
    <div className="mt-4 rounded-xl border border-border bg-muted/30 divide-y divide-border">
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

// ─── HorasExtrasPage ──────────────────────────────────────────────────────────

export default function HorasExtrasPage() {
  const [result, setResult] = useState<HorasExtrasResult | null>(null);
  const [lastInput, setLastInput] = useState<HorasExtrasInput | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HorasExtrasFormData>({
    resolver: zodResolver(horasExtrasSchema),
    defaultValues: {
      jornadaDiaria: 8,
      diasSemana: 5,
      horasExtrasUteis: 0,
      horasExtrasFeriado: 0,
      horasNoturnas: 0,
      horasExtrasNoturnas: 0,
      horasExtrasNoturnasFerias: 0,
    },
  });

  // Inline salary warning — watch without blocking calc
  const salarioRaw = watch("salario");
  const salarioAbaixoMinimo =
    typeof salarioRaw === "number"
      ? salarioRaw < SALARIO_MINIMO_2025
      : parseFloat(String(salarioRaw ?? "0").replace(",", ".")) < SALARIO_MINIMO_2025 &&
        String(salarioRaw ?? "").trim() !== "";

  // Reset result on any field change
  const watchedValues = watch();
  useEffect(() => {
    if (result !== null) {
      setResult(null);
      setLastInput(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  function onSubmit(data: HorasExtrasFormData) {
    const input: HorasExtrasInput = {
      salario: data.salario,
      jornadaDiaria: data.jornadaDiaria,
      diasSemana: data.diasSemana,
      horasExtrasUteis: data.horasExtrasUteis,
      horasExtrasFeriado: data.horasExtrasFeriado,
      horasNoturnas: data.horasNoturnas,
      horasExtrasNoturnas: data.horasExtrasNoturnas,
      horasExtrasNoturnasFerias: data.horasExtrasNoturnasFerias,
    };
    setLastInput(input);
    setResult(calcHorasExtras(input));
  }

  function buildDetailItems(r: HorasExtrasResult): DetailItem[] {
    const items: DetailItem[] = [
      {
        label: "Valor hora normal",
        value: formatCurrency(r.valorHoraNormal),
        note: "Salário ÷ (dias/semana × horas/dia × 4,333)",
      },
    ];
    if (r.subtotalHE50 > 0) {
      items.push({ label: "HE dias úteis (adicional 50%)", value: formatCurrency(r.subtotalHE50) });
    }
    if (r.subtotalHE100 > 0) {
      items.push({
        label: "HE domingos/feriados (adicional 100%)",
        value: formatCurrency(r.subtotalHE100),
      });
    }
    if (r.subtotalAdicionalNoturno > 0) {
      items.push({
        label: "Adicional noturno (20%)",
        value: formatCurrency(r.subtotalAdicionalNoturno),
        note: "CLT Art. 73 — horas entre 22h e 5h",
      });
    }
    if (r.subtotalHENoturna50 > 0) {
      items.push({
        label: "HE noturna dias úteis (50% + 20%)",
        value: formatCurrency(r.subtotalHENoturna50),
        note: "Cumulativo: hora extra + adicional noturno",
      });
    }
    if (r.subtotalHENoturna100 > 0) {
      items.push({
        label: "HE noturna feriados (100% + 20%)",
        value: formatCurrency(r.subtotalHENoturna100),
        note: "Cumulativo: hora extra feriado + adicional noturno",
      });
    }
    items.push({ label: "Total geral", value: formatCurrency(r.totalGeral), highlight: true });
    return items;
  }

  return (
    <div>
      <PageMeta
        title="Calculadora de Horas Extras e Adicional Noturno CLT | Fazaconta"
        description="Calcule o valor das horas extras (50% e 100%), adicional noturno e cumulativos pela CLT. Gratuito, sem cadastro, resultado imediato."
        faq={FAQ_HORAS_EXTRAS}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Calculadora de Horas Extras
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Calcule o valor das horas extras (50% e 100%), adicional noturno e cumulativos conforme a
            CLT.
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
            {salarioAbaixoMinimo && !errors.salario && (
              <p role="alert" className="text-warning-foreground bg-warning/10 border border-warning/20 rounded-md px-3 py-2 text-xs mt-1">
                Salário abaixo do mínimo nacional de{" "}
                {formatCurrency(SALARIO_MINIMO_2025)} em 2025. O cálculo será feito normalmente.
              </p>
            )}
          </div>

          {/* Jornada + Dias/semana */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jornadaDiaria">Jornada diária (horas)</Label>
              <Input
                id="jornadaDiaria"
                type="number"
                min={1}
                max={24}
                step={0.5}
                {...register("jornadaDiaria")}
                className="mt-1"
              />
              <FieldError message={errors.jornadaDiaria?.message} />
            </div>
            <div>
              <Label htmlFor="diasSemana">Dias por semana</Label>
              <Input
                id="diasSemana"
                type="number"
                min={1}
                max={7}
                {...register("diasSemana")}
                className="mt-1"
              />
              <FieldError message={errors.diasSemana?.message} />
            </div>
          </div>

          {/* Horas extras */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground mb-2">
              Horas no período
            </legend>

            <div>
              <Label htmlFor="horasExtrasUteis">
                Horas extras em dias úteis{" "}
                <span className="text-muted-foreground font-normal">(adicional 50%)</span>
              </Label>
              <Input
                id="horasExtrasUteis"
                type="number"
                min={0}
                max={744}
                step={0.5}
                {...register("horasExtrasUteis")}
                className="mt-1"
              />
              <FieldError message={errors.horasExtrasUteis?.message} />
            </div>

            <div>
              <Label htmlFor="horasExtrasFeriado">
                Horas extras em domingos/feriados{" "}
                <span className="text-muted-foreground font-normal">(adicional 100%)</span>
              </Label>
              <Input
                id="horasExtrasFeriado"
                type="number"
                min={0}
                max={744}
                step={0.5}
                {...register("horasExtrasFeriado")}
                className="mt-1"
              />
              <FieldError message={errors.horasExtrasFeriado?.message} />
            </div>

            <div>
              <Label htmlFor="horasNoturnas">
                Horas noturnas (22h–5h){" "}
                <span className="text-muted-foreground font-normal">(adicional 20%)</span>
              </Label>
              <Input
                id="horasNoturnas"
                type="number"
                min={0}
                max={744}
                step={0.5}
                {...register("horasNoturnas")}
                className="mt-1"
              />
              <FieldError message={errors.horasNoturnas?.message} />
            </div>

            <div>
              <Label htmlFor="horasExtrasNoturnas">
                Horas extras noturnas em dias úteis{" "}
                <span className="text-muted-foreground font-normal">(50% + 20%)</span>
              </Label>
              <Input
                id="horasExtrasNoturnas"
                type="number"
                min={0}
                max={744}
                step={0.5}
                {...register("horasExtrasNoturnas")}
                className="mt-1"
              />
              <FieldError message={errors.horasExtrasNoturnas?.message} />
              <p className="text-xs text-muted-foreground mt-1">
                Horas que são simultaneamente extras E noturnas em dias úteis. Os adicionais se
                acumulam.
              </p>
            </div>

            <div>
              <Label htmlFor="horasExtrasNoturnasFerias">
                Horas extras noturnas em domingos/feriados{" "}
                <span className="text-muted-foreground font-normal">(100% + 20%)</span>
              </Label>
              <Input
                id="horasExtrasNoturnasFerias"
                type="number"
                min={0}
                max={744}
                step={0.5}
                {...register("horasExtrasNoturnasFerias")}
                className="mt-1"
              />
              <FieldError message={errors.horasExtrasNoturnasFerias?.message} />
              <p className="text-xs text-muted-foreground mt-1">
                Horas extras noturnas em domingos e feriados. Adicional de 100% (HE) + 20%
                (noturno).
              </p>
            </div>
          </fieldset>

          <Button type="submit" className="w-full">
            Calcular horas extras
          </Button>
        </form>

        {/* Result */}
        <div aria-live="polite">
          <ResultBox
            title="Total de horas extras e adicionais"
            value={result ? formatCurrency(result.totalGeral) : "—"}
            description={
              result && lastInput
                ? buildNarrativeHorasExtras(lastInput, result)
                : undefined
            }
            variant={result ? (result.totalGeral > 0 ? "success" : "info") : "default"}
            isVisible={result !== null}
          />

          {result && (
            <>
              <ResultDetailBlock items={buildDetailItems(result)} isVisible={true} />

              {/* Nota hora noturna reduzida */}
              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
                <strong>Hora noturna reduzida:</strong> A CLT considera a hora noturna como 52min30s
                (não 60min), o que efetivamente aumenta o número de horas computadas entre 22h e 5h.
                Esta calculadora usa o valor nominal informado; considere este ajuste em cálculos de
                folha de pagamento.
              </div>

              {/* Disclaimer */}
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Valores baseados na CLT (Arts. 59 e 73) e no salário mínimo 2025 (R${" "}
                {formatCurrency(SALARIO_MINIMO_2025)}). Convenções coletivas podem prever percentuais
                superiores. Consulte um especialista trabalhista para análise do seu caso.
              </p>
            </>
          )}
        </div>

        {/* Educational content */}
        <section className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-display font-bold mb-3">Como funcionam as horas extras?</h2>
            <p className="text-muted-foreground leading-relaxed">
              A CLT (Art. 59) permite até 2 horas extras por dia, desde que remuneradas com adicional
              mínimo de 50% sobre a hora normal. Em domingos e feriados, o adicional é de 100%. O
              adicional noturno (Art. 73) de 20% se aplica ao trabalho entre 22h e 5h e se acumula
              com o adicional de horas extras quando aplicável.
            </p>
          </div>

          {/* Percentuais legais */}
          <div>
            <h2 className="text-xl font-display font-bold mb-3">Percentuais legais mínimos</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                    <th className="text-left px-4 py-3 font-semibold">Base legal</th>
                    <th className="text-right px-4 py-3 font-semibold">Adicional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">HE dias úteis</td>
                    <td className="px-4 py-3 text-muted-foreground">CLT Art. 59</td>
                    <td className="px-4 py-3 text-right font-mono">50%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">HE domingos/feriados</td>
                    <td className="px-4 py-3 text-muted-foreground">CLT Art. 59</td>
                    <td className="px-4 py-3 text-right font-mono">100%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Adicional noturno (22h–5h)</td>
                    <td className="px-4 py-3 text-muted-foreground">CLT Art. 73</td>
                    <td className="px-4 py-3 text-right font-mono">20%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">HE noturna dias úteis</td>
                    <td className="px-4 py-3 text-muted-foreground">CLT Arts. 59 + 73</td>
                    <td className="px-4 py-3 text-right font-mono">50% + 20%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">HE noturna domingos/feriados</td>
                    <td className="px-4 py-3 text-muted-foreground">CLT Arts. 59 + 73</td>
                    <td className="px-4 py-3 text-right font-mono">100% + 20%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Exemplos práticos */}
          <div>
            <h2 className="text-xl font-display font-bold mb-3">Exemplos práticos</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <p className="font-semibold mb-1">Salário R$ 3.000 · 8h/dia · 5 dias/semana</p>
                <p className="text-sm text-muted-foreground">
                  Valor hora normal = R$ 3.000 ÷ (8 × 5 × 4,333) ≈{" "}
                  <strong>R$ 17,31/hora</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  10h extras dias úteis (50%): 10 × R$ 17,31 × 1,50 ≈{" "}
                  <strong>R$ 259,62</strong>
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <p className="font-semibold mb-1">Trabalho em feriado</p>
                <p className="text-sm text-muted-foreground">
                  Salário R$ 2.500 · 8h trabalhadas em feriado: hora normal ≈ R$ 14,43 →{" "}
                  <strong>R$ 14,43 × 2,00 × 8h = R$ 230,80</strong>
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-display font-bold mb-4">Perguntas frequentes</h2>
            <div className="space-y-4">
              {FAQ_HORAS_EXTRAS.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="font-semibold mb-1">{faq.question}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Revisado em abril de 2025.
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
              <Link href="/simulador-demissao" className="text-primary hover:underline text-sm">
                Simulador de Cenários de Demissão
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
