// ─────────────────────────────────────────────────────────────────────────────
// ─── Task 4.1: BancoDeHorasPage ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { PageMeta } from "@/components/page-meta";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bancoDeHorasSchema, type BancoDeHorasFormData } from "./banco-de-horas.schemas";
import { formatCurrency } from "./rescisao";

// ─── JSON-LD FAQ data ─────────────────────────────────────────────────────────

const FAQ = [
  {
    question: "O que é banco de horas?",
    answer:
      "Banco de horas é um sistema pelo qual as horas extras trabalhadas são compensadas com folgas ou redução de jornada em outro dia, em vez de serem pagas diretamente. É regulado pelo Art. 59 da CLT.",
  },
  {
    question: "Qual é o prazo para compensar o banco de horas?",
    answer:
      "No regime informal (acordo individual entre empregado e empregador), o prazo é de 6 meses. No regime formal (previsto em convenção coletiva — CCT ou ACT), o prazo pode ser de até 12 meses.",
  },
  {
    question: "O que acontece se o banco de horas não for compensado no prazo?",
    answer:
      "As horas não compensadas dentro do prazo devem ser pagas como horas extras, com adicional mínimo de 50%, conforme o Art. 59 §2º da CLT.",
  },
  {
    question: "Existe limite diário de horas extras?",
    answer:
      "Sim. A CLT (Art. 59) limita a 2 horas extras por dia. Ultrapassar esse limite pode gerar passivo trabalhista e é considerado descumprimento do contrato de trabalho.",
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
            <span className={`text-sm ${item.highlight ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              {item.label}
            </span>
            {item.note && <p className="text-xs text-muted-foreground mt-0.5 italic">{item.note}</p>}
          </div>
          <span className={`text-sm tabular-nums shrink-0 ${item.highlight ? "font-bold text-foreground" : "text-foreground"}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BancoDeHorasPage() {
  const [result, setResult] = useState<BancoHorasResult | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BancoDeHorasFormData>({
    resolver: zodResolver(bancoDeHorasSchema),
    defaultValues: {
      jornadaDiaria: 8,
      diasPorSemana: 5,
      regime: "informal",
      semanas: [{ periodo: "", horasTrabalhadas: 0, horasDevidas: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "semanas" });

  // Reset result when any field changes
  const watchedValues = watch();
  useEffect(() => {
    if (result !== null) setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  function onSubmit(data: BancoDeHorasFormData) {
    const r = calcBancoHoras(data);
    setResult(r);
  }

  // Build summary items
  function buildDetailItems(r: BancoHorasResult): DetailItem[] {
    const items: DetailItem[] = [
      {
        label: "Valor hora normal",
        value: formatCurrency(r.valorHoraNormal),
        note: "Salário ÷ (dias/semana × horas/dia × 4,333)",
      },
    ];
    if (r.valorMonetario !== null) {
      items.push({
        label: "Valor monetário do saldo (adicional 50%)",
        value: formatCurrency(r.valorMonetario),
        highlight: true,
      });
    }
    return items;
  }

  const classificacaoLabel =
    result === null
      ? ""
      : result.classificacao === "credito"
      ? "Crédito de horas"
      : result.classificacao === "debito"
      ? "Débito de horas"
      : "Saldo zerado";

  const saldoFormatado =
    result === null
      ? ""
      : `${Math.floor(Math.abs(result.saldoHoras))}h ${result.saldoMinutos}min`;

  const resultVariant =
    result === null
      ? "default"
      : result.classificacao === "credito"
      ? "success"
      : result.classificacao === "debito"
      ? "danger"
      : "info";

  return (
    <Layout>
      <PageMeta
        title="Calculadora de Banco de Horas CLT | Saldo e Valor Monetário | Fazaconta"
        description="Calcule o saldo do banco de horas, o valor monetário das horas acumuladas e verifique alertas de prazo e limite diário pela CLT. Gratuito e sem cadastro."
        faq={FAQ}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Calculadora de Banco de Horas
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Calcule o saldo acumulado, o valor monetário e verifique alertas de prazo e limite diário
            conforme a CLT.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Salário */}
          <div className="space-y-1.5">
            <Label htmlFor="salario">Salário bruto (R$)</Label>
            <Input
              id="salario"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 3.000,00"
              aria-describedby={errors.salario ? "salario-error" : undefined}
              {...register("salario")}
            />
            {errors.salario && (
              <p id="salario-error" role="alert" className="text-sm text-destructive">
                {errors.salario.message}
              </p>
            )}
          </div>

          {/* Jornada diária + Dias por semana */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="jornadaDiaria">Horas por dia</Label>
              <Input
                id="jornadaDiaria"
                type="number"
                min={1}
                max={24}
                step={0.5}
                aria-describedby={errors.jornadaDiaria ? "jornadaDiaria-error" : undefined}
                {...register("jornadaDiaria")}
              />
              {errors.jornadaDiaria && (
                <p id="jornadaDiaria-error" role="alert" className="text-sm text-destructive">
                  {errors.jornadaDiaria.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diasPorSemana">Dias por semana</Label>
              <Input
                id="diasPorSemana"
                type="number"
                min={1}
                max={7}
                step={1}
                aria-describedby={errors.diasPorSemana ? "diasPorSemana-error" : undefined}
                {...register("diasPorSemana")}
              />
              {errors.diasPorSemana && (
                <p id="diasPorSemana-error" role="alert" className="text-sm text-destructive">
                  {errors.diasPorSemana.message}
                </p>
              )}
            </div>
          </div>

          {/* Regime */}
          <div className="space-y-1.5">
            <Label htmlFor="regime">Regime do banco de horas</Label>
            <Controller
              name="regime"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="regime" aria-describedby={errors.regime ? "regime-error" : undefined}>
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informal">Informal — acordo individual (prazo: 6 meses)</SelectItem>
                    <SelectItem value="formal">Formal — CCT/ACT (prazo: 12 meses)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.regime && (
              <p id="regime-error" role="alert" className="text-sm text-destructive">
                {errors.regime.message}
              </p>
            )}
          </div>

          {/* Data de início (opcional) */}
          <div className="space-y-1.5">
            <Label htmlFor="dataInicio">
              Data de início do banco de horas{" "}
              <span className="text-muted-foreground font-normal">(opcional — ativa alertas de prazo)</span>
            </Label>
            <Input
              id="dataInicio"
              type="date"
              aria-describedby={errors.dataInicio ? "dataInicio-error" : undefined}
              {...register("dataInicio")}
            />
            {errors.dataInicio && (
              <p id="dataInicio-error" role="alert" className="text-sm text-destructive">
                {errors.dataInicio.message}
              </p>
            )}
          </div>

          {/* ── Lista dinâmica de semanas ────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Semanas</h2>
              <span className="text-xs text-muted-foreground">{fields.length}/52</span>
            </div>

            {/* Erro de array vazio (não-indexed) */}
            {errors.semanas && (
              <p role="alert" className="text-sm text-destructive">
                {/* RHF v7 can put array root errors in .root.message or directly */}
                {(errors.semanas as { root?: { message?: string }; message?: string })?.root?.message
                  ?? (errors.semanas as { message?: string })?.message}
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                data-testid="semana-row"
                className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Semana {index + 1}
                  </span>
                  <button
                    type="button"
                    aria-label="Remover semana"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>

                {/* Período */}
                <div className="space-y-1">
                  <Label htmlFor={`semanas.${index}.periodo`}>Período</Label>
                  <Input
                    id={`semanas.${index}.periodo`}
                    type="text"
                    placeholder="Ex: 01/04 – 07/04"
                    aria-describedby={
                      errors.semanas?.[index]?.periodo ? `semanas-${index}-periodo-error` : undefined
                    }
                    {...register(`semanas.${index}.periodo`)}
                  />
                  {errors.semanas?.[index]?.periodo && (
                    <p
                      id={`semanas-${index}-periodo-error`}
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {errors.semanas[index]?.periodo?.message}
                    </p>
                  )}
                </div>

                {/* Horas trabalhadas + Horas devidas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`semanas.${index}.horasTrabalhadas`}>Horas trabalhadas</Label>
                    <Input
                      id={`semanas.${index}.horasTrabalhadas`}
                      type="number"
                      min={0}
                      max={168}
                      step={0.5}
                      aria-describedby={
                        errors.semanas?.[index]?.horasTrabalhadas
                          ? `semanas-${index}-horasTrabalhadas-error`
                          : undefined
                      }
                      {...register(`semanas.${index}.horasTrabalhadas`)}
                    />
                    {errors.semanas?.[index]?.horasTrabalhadas && (
                      <p
                        id={`semanas-${index}-horasTrabalhadas-error`}
                        role="alert"
                        className="text-sm text-destructive"
                      >
                        {errors.semanas[index]?.horasTrabalhadas?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`semanas.${index}.horasDevidas`}>Horas devidas</Label>
                    <Input
                      id={`semanas.${index}.horasDevidas`}
                      type="number"
                      min={0}
                      max={168}
                      step={0.5}
                      aria-describedby={
                        errors.semanas?.[index]?.horasDevidas
                          ? `semanas-${index}-horasDevidas-error`
                          : undefined
                      }
                      {...register(`semanas.${index}.horasDevidas`)}
                    />
                    {errors.semanas?.[index]?.horasDevidas && (
                      <p
                        id={`semanas-${index}-horasDevidas-error`}
                        role="alert"
                        className="text-sm text-destructive"
                      >
                        {errors.semanas[index]?.horasDevidas?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Botão Adicionar semana */}
            {fields.length < 52 && (
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[40px]"
                onClick={() => append({ periodo: "", horasTrabalhadas: 0, horasDevidas: 0 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar semana
              </Button>
            )}
          </div>

          <Button type="submit" className="w-full min-h-[44px] text-base font-semibold">
            Calcular Saldo
          </Button>
        </form>

        {/* Result region */}
        <div aria-live="polite">
          {result !== null && (
            <>
              {/* Alertas */}
              {result.alertas.length > 0 && (
                <div className="mt-6 space-y-2">
                  {result.alertas.map((alerta, idx) => (
                    <div
                      key={idx}
                      role="alert"
                      className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground"
                    >
                      {alerta.mensagem}
                    </div>
                  ))}
                </div>
              )}

              <ResultBox
                title={classificacaoLabel}
                value={saldoFormatado}
                description={
                  result.valorMonetario !== null
                    ? `Valor estimado: ${formatCurrency(result.valorMonetario)} (saldo × valor hora × 1,50)`
                    : result.classificacao === "debito"
                    ? "Saldo negativo: horas a compensar ao empregador."
                    : "Saldo zerado."
                }
                variant={resultVariant}
                isVisible={result !== null}
              />

              <ResultDetailBlock items={buildDetailItems(result)} isVisible={result !== null} />

              {/* Tabela semana a semana */}
              <div data-testid="tabela-semanas" className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Período</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Saldo parcial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.tabelaSemanas.map((linha, idx) => {
                      const horas = Math.floor(Math.abs(linha.saldoParcial));
                      const mins = Math.round((Math.abs(linha.saldoParcial) - horas) * 60);
                      const sinal = linha.saldoParcial >= 0 ? "+" : "−";
                      return (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="px-4 py-2 text-foreground">{linha.periodo || `Semana ${idx + 1}`}</td>
                          <td className={`px-4 py-2 text-right tabular-nums ${linha.saldoParcial > 0 ? "text-green-600 dark:text-green-400" : linha.saldoParcial < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {sinal}{horas}h {mins}min
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Fórmula de cálculo do valor hora */}
              <div data-testid="formula-valor-hora" className="mt-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Fórmula do valor hora normal</p>
                <p className="font-mono">Salário ÷ (dias/semana × horas/dia × 4,333)</p>
                <p className="mt-1">
                  = {formatCurrency(watch("salario") as unknown as number || 0)} ÷ ({watch("diasPorSemana")} × {watch("jornadaDiaria")} × 4,333)
                  {" "}= <strong>{formatCurrency(result.valorHoraNormal)}/h</strong>
                </p>
                {result.valorMonetario !== null && (
                  <p className="mt-1">
                    Valor do saldo (adicional 50%): {Math.floor(Math.abs(result.saldoHoras))}h {result.saldoMinutos}min × {formatCurrency(result.valorHoraNormal)}/h × 1,50 = <strong>{formatCurrency(result.valorMonetario)}</strong>
                  </p>
                )}
              </div>

              {/* Info sobre saldo negativo */}
              {result.classificacao === "debito" && (
                <div data-testid="info-saldo-negativo" className="mt-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">O que significa saldo negativo?</p>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside text-xs">
                    <li><strong>Demissão sem justa causa:</strong> o empregador não pode descontar o saldo negativo das verbas rescisórias (CLT Art. 462).</li>
                    <li><strong>Pedido de demissão ou justa causa:</strong> o desconto pode ser autorizado desde que haja previsão em contrato ou acordo coletivo.</li>
                  </ul>
                </div>
              )}

              <p className="mt-4 text-xs text-muted-foreground italic">
                Valores estimados com base nos dados informados. Consulte sempre a convenção coletiva
                aplicável e um especialista trabalhista para decisões definitivas.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Seção educativa ──────────────────────────────────────────────── */}
      <div className="mt-16 space-y-12 border-t border-border pt-12">

        {/* Como funciona o banco de horas */}
        <section aria-labelledby="como-funciona">
          <h2 id="como-funciona" className="text-2xl font-display font-bold mb-4">
            Como funciona o banco de horas?
          </h2>
          <p className="text-muted-foreground mb-4">
            O banco de horas é um mecanismo autorizado pelo <strong>Art. 59 da CLT</strong> que permite
            compensar horas extras trabalhadas com folgas ou redução de jornada em outro dia, sem
            necessidade de pagamento imediato. Em vez de receber o adicional de 50%, o trabalhador
            &ldquo;deposita&rdquo; as horas a mais e as utiliza como descanso posteriormente.
          </p>
          <p className="text-muted-foreground mb-4">
            Para ser válido, o banco de horas precisa de autorização expressa — por acordo individual
            escrito (regime informal) ou por Convenção Coletiva de Trabalho (CCT/ACT) no regime formal.
            A Reforma Trabalhista de 2017 (Lei 13.467/2017) ampliou as possibilidades de acordo
            individual, mas manteve prazos distintos para cada regime.
          </p>

          <h3 className="text-lg font-semibold mb-3 mt-6">Regime informal vs. regime formal</h3>
          <p className="text-muted-foreground mb-4">
            A principal diferença está no prazo para compensação e na forma de formalização:
          </p>
          <ul className="text-muted-foreground list-disc list-inside space-y-2 mb-4">
            <li>
              <strong>Regime informal</strong> — acordo individual escrito entre empregado e empregador.
              Prazo de compensação: <strong>6 meses</strong>. Horas não compensadas dentro do prazo
              viram pagamento com adicional de 50% (Art. 59 §2º).
            </li>
            <li>
              <strong>Regime formal (CCT/ACT)</strong> — previsto em Convenção ou Acordo Coletivo de
              Trabalho. Prazo de compensação: <strong>até 12 meses</strong>. Condições específicas
              podem variar conforme a negociação coletiva da categoria.
            </li>
          </ul>
        </section>

        {/* Tabela de regras principais */}
        <section aria-labelledby="regras-principais">
          <h2 id="regras-principais" className="text-2xl font-display font-bold mb-4">
            Regras principais do banco de horas
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">Regra</th>
                  <th className="px-4 py-3 text-left font-semibold">Detalhe</th>
                  <th className="px-4 py-3 text-left font-semibold">Base legal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 font-medium">Adicional mínimo de hora extra</td>
                  <td className="px-4 py-3 text-muted-foreground">50% sobre o valor da hora normal</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 59 / CF Art. 7º XVI</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Limite diário de horas extras</td>
                  <td className="px-4 py-3 text-muted-foreground">Máximo 2 horas extras por dia</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 59 caput</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Prazo — regime informal</td>
                  <td className="px-4 py-3 text-muted-foreground">6 meses para compensar</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 59 §2º</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Prazo — regime formal (CCT/ACT)</td>
                  <td className="px-4 py-3 text-muted-foreground">Até 12 meses para compensar</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 59 §2º c/c negociação coletiva</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Saldo positivo na rescisão</td>
                  <td className="px-4 py-3 text-muted-foreground">Horas não compensadas são pagas com adicional de 50%</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 59 §2º</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Saldo negativo — demissão sem justa causa</td>
                  <td className="px-4 py-3 text-muted-foreground">Empregador não pode descontar das verbas rescisórias</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 462</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Saldo negativo — pedido de demissão / justa causa</td>
                  <td className="px-4 py-3 text-muted-foreground">Desconto permitido se previsto em contrato ou acordo coletivo</td>
                  <td className="px-4 py-3 text-muted-foreground">CLT Art. 462 §1º</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Exemplos práticos */}
        <section aria-labelledby="exemplos-praticos">
          <h2 id="exemplos-praticos" className="text-2xl font-display font-bold mb-4">
            Exemplos práticos
          </h2>
          <div className="space-y-6">

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">Exemplo 1 — Saldo positivo com valor monetário</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Trabalhador com salário de <strong>R$ 3.000,00</strong>, jornada de 8h/dia, 5 dias/semana,
                acumulou <strong>10 horas extras</strong> em 4 semanas.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Valor da hora normal: R$ 3.000 ÷ (5 × 8 × 4,333) = <strong>R$ 17,31/h</strong></li>
                <li>Valor das horas extras com adicional 50%: 10h × R$ 17,31 × 1,50 = <strong>R$ 259,65</strong></li>
                <li>Se as horas não forem compensadas no prazo, esse valor deve ser pago ao trabalhador.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">Exemplo 2 — Saldo negativo (horas a compensar)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Trabalhador com salário de <strong>R$ 2.500,00</strong> saiu mais cedo em 3 semanas,
                acumulando <strong>6 horas a compensar</strong>.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Saldo: −6 horas (débito ao empregador).</li>
                <li>Se for demitido sem justa causa, o desconto <strong>não pode ser feito</strong> nas verbas rescisórias.</li>
                <li>Se pedir demissão e houver previsão contratual ou coletiva, o desconto pode ser aplicado.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">Exemplo 3 — Alerta de limite diário</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Trabalhador com jornada de 8h/dia, 5 dias/semana, trabalhou <strong>55 horas</strong> em
                uma semana (15 horas extras na semana = 3h extras/dia).
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Média de extras por dia: 15h ÷ 5 = <strong>3h extras/dia</strong> — acima do limite legal de 2h.</li>
                <li>Isso pode gerar passivo trabalhista e multas ao empregador.</li>
                <li>A calculadora exibe um alerta automático neste caso.</li>
              </ul>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-banco-horas">
          <h2 id="faq-banco-horas" className="text-2xl font-display font-bold mb-6">
            Perguntas frequentes sobre banco de horas
          </h2>
          <div className="space-y-4">

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">O banco de horas é obrigatório?</h3>
              <p className="text-sm text-muted-foreground">
                Não. O banco de horas é uma alternativa ao pagamento de horas extras, mas precisa ser
                acordado por escrito. Sem acordo, as horas extras devem ser pagas no mês em que foram
                realizadas, com adicional mínimo de 50%.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">
                O empregador pode impor o banco de horas sem minha concordância?
              </h3>
              <p className="text-sm text-muted-foreground">
                Não. O banco de horas requer concordância expressa do empregado — seja por acordo
                individual escrito (regime informal) ou por Convenção/Acordo Coletivo que o empregado,
                por ser filiado ao sindicato, está sujeito (regime formal).
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">O que acontece com o banco de horas se eu for demitido?</h3>
              <p className="text-sm text-muted-foreground">
                Se você tiver saldo positivo (mais horas a receber), as horas não compensadas devem ser
                pagas como horas extras (adicional de 50%) nas verbas rescisórias. Se o saldo for negativo
                (horas a compensar), na demissão sem justa causa o empregador <strong>não pode</strong>{" "}
                descontar o valor das suas verbas (CLT Art. 462).
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">
                Posso trabalhar mais de 2 horas extras por dia mesmo com banco de horas?
              </h3>
              <p className="text-sm text-muted-foreground">
                A CLT limita as horas extras a 2 horas por dia (Art. 59), independentemente de haver
                banco de horas. Ultrapassar esse limite é irregular e pode gerar passivo trabalhista ao
                empregador, além de ser considerado descumprimento do contrato de trabalho.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-semibold mb-2">A CCT pode alterar as regras do banco de horas?</h3>
              <p className="text-sm text-muted-foreground">
                Sim. A negociação coletiva pode ampliar o prazo de compensação para até 12 meses e
                estabelecer condições específicas para o banco de horas. Sempre verifique o que prevê a
                Convenção ou Acordo Coletivo da sua categoria profissional.
              </p>
            </div>

          </div>
          <p className="mt-4 text-xs text-muted-foreground italic">
            Revisado em abril de 2026. As informações acima refletem a CLT vigente e a Reforma
            Trabalhista de 2017 (Lei 13.467/2017). Consulte um advogado trabalhista para casos específicos.
          </p>
        </section>

        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Outras calculadoras trabalhistas</h2>
          <ul className="flex flex-col gap-2">
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
            <li>
              <Link href="/calculadora-trabalhista-clt" className="text-primary hover:underline text-sm">
                Calculadora Trabalhista CLT (rescisão, férias e 13º)
              </Link>
            </li>
          </ul>
        </section>

      </div>
    </Layout>
  );
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export type SemanaItem = {
  periodo: string;
  horasTrabalhadas: number; // horas decimais
  horasDevidas: number;     // horas decimais
};

export type RegimeBancoHoras = "informal" | "formal";

export type BancoHorasInput = {
  salario: number;
  jornadaDiaria: number;     // horas por dia (padrão 8)
  diasPorSemana: number;     // dias por semana (padrão 5)
  regime: RegimeBancoHoras;
  dataInicio?: string;       // ISO date string "YYYY-MM-DD" — ativa alertas de prazo
  semanas: SemanaItem[];
};

export type AlertaBancoHoras = {
  tipo: "prazo-vencido" | "limite-diario";
  mensagem: string;
};

export type BancoHorasResult = {
  saldoHoras: number;          // horas decimais; positivo = crédito, negativo = débito
  saldoMinutos: number;        // minutos da parte fracionada do saldo
  valorMonetario: number | null; // null se saldo <= 0
  classificacao: "credito" | "debito" | "zerado";
  valorHoraNormal: number;
  alertas: AlertaBancoHoras[];
  tabelaSemanas: Array<{
    periodo: string;
    saldoParcial: number;    // saldo acumulado até essa semana
  }>;
};

// ─── calcBancoHoras ───────────────────────────────────────────────────────────

export function calcBancoHoras(input: BancoHorasInput): BancoHorasResult {
  const { salario, jornadaDiaria, diasPorSemana, regime, dataInicio, semanas } = input;

  // Saldo acumulado semana a semana
  let saldoAcumulado = 0;
  const tabelaSemanas = semanas.map((semana) => {
    saldoAcumulado += semana.horasTrabalhadas - semana.horasDevidas;
    return { periodo: semana.periodo, saldoParcial: saldoAcumulado };
  });

  const saldoHoras = saldoAcumulado;

  // Parte fracionada em minutos
  const saldoAbsoluto = Math.abs(saldoHoras);
  const horasInteiras = Math.floor(saldoAbsoluto);
  const saldoMinutos = Math.round((saldoAbsoluto - horasInteiras) * 60);

  // Classificação
  const classificacao: "credito" | "debito" | "zerado" =
    saldoHoras > 0 ? "credito" : saldoHoras < 0 ? "debito" : "zerado";

  // Valor hora normal: salario / (diasPorSemana × jornadaDiaria × 4.333)
  const valorHoraNormal = salario / (diasPorSemana * jornadaDiaria * 4.333);

  // Valor monetário: apenas para saldo positivo, com adicional de 50%
  const valorMonetario =
    saldoHoras > 0 ? saldoHoras * valorHoraNormal * 1.5 : null;

  // Alertas
  const alertas: AlertaBancoHoras[] = [];

  // Alerta de prazo vencido
  if (dataInicio) {
    const inicio = new Date(dataInicio);
    const agora = new Date();
    // Diferença em meses (aproximada, sem ajuste de fuso)
    const diffMs = agora.getTime() - inicio.getTime();
    const diffMeses = diffMs / (1000 * 60 * 60 * 24 * 30.44);
    const limitesMeses = regime === "informal" ? 6 : 12;
    if (diffMeses > limitesMeses) {
      alertas.push({
        tipo: "prazo-vencido",
        mensagem: `Atenção: horas com mais de ${limitesMeses} meses não compensadas devem ser pagas como hora extra (CLT Art. 59 §2º).`,
      });
    }
  }

  // Alerta de limite diário de 2h extras por dia
  for (const semana of semanas) {
    const extrasNaSemana = semana.horasTrabalhadas - semana.horasDevidas;
    if (extrasNaSemana > 0) {
      const extrasPorDia = extrasNaSemana / diasPorSemana;
      if (extrasPorDia > 2) {
        alertas.push({
          tipo: "limite-diario",
          mensagem:
            "A CLT limita a 2h extras por dia (Art. 59). Horas acima desse limite podem gerar passivo trabalhista.",
        });
        break; // Um único alerta é suficiente
      }
    }
  }

  return {
    saldoHoras,
    saldoMinutos,
    valorMonetario,
    classificacao,
    valorHoraNormal,
    alertas,
    tabelaSemanas,
  };
}
