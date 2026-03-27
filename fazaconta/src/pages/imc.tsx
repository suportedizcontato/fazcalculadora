import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import { ResultBox, type ResultVariant } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function normalizeDecimal(raw: string): string {
  const withPeriod = raw.replace(/,/g, ".");
  if (withPeriod.startsWith(".")) return "0" + withPeriod;
  return withPeriod;
}

export const pesoSchema = z
  .string()
  .refine((v) => v.trim().length > 0, { message: "Peso é obrigatório" })
  .transform((v) => parseFloat(v))
  .refine((v) => isFinite(v), { message: "Insira um número válido para o peso" })
  .refine((v) => v > 0, { message: "O peso deve ser maior que zero" })
  .refine((v) => v <= 500, { message: "Valor implausível para o peso" })
  .refine((v) => (String(v).split(".")[1]?.length ?? 0) <= 2, {
    message: "Máximo de 2 casas decimais permitidas",
  });

export const alturaSchema = z
  .string()
  .refine((v) => v.trim().length > 0, { message: "Altura é obrigatório" })
  .transform((v) => parseFloat(v))
  .refine((v) => isFinite(v), { message: "Insira um número válido para a altura" })
  .refine((v) => v > 0, { message: "A altura deve ser maior que zero" })
  .refine((v) => v <= 3.0, { message: "Valor implausível para a altura" })
  .refine((v) => (String(v).split(".")[1]?.length ?? 0) <= 2, {
    message: "Máximo de 2 casas decimais permitidas",
  });

const formSchema = z.object({
  peso: pesoSchema,
  altura: alturaSchema,
});

type FormData = z.infer<typeof formSchema>;

type BmiLabel =
  | "Abaixo do peso"
  | "Peso normal"
  | "Sobrepeso"
  | "Obesidade grau I"
  | "Obesidade grau II"
  | "Obesidade grau III";

type BmiResult = {
  imc: number;
  label: BmiLabel;
  variant: ResultVariant;
};

export function calculateBMI(peso: number, altura: number): number {
  return parseFloat((peso / (altura * altura)).toFixed(2));
}

export function classifyBMI(imc: number): BmiResult {
  let label: BmiLabel;
  let variant: ResultVariant;

  if (imc < 18.5) {
    label = "Abaixo do peso";
    variant = "warning";
  } else if (imc < 25) {
    label = "Peso normal";
    variant = "success";
  } else if (imc < 30) {
    label = "Sobrepeso";
    variant = "warning";
  } else if (imc < 35) {
    label = "Obesidade grau I";
    variant = "danger";
  } else if (imc < 40) {
    label = "Obesidade grau II";
    variant = "danger";
  } else {
    label = "Obesidade grau III";
    variant = "danger";
  }

  return { imc, label, variant };
}

export function calculateMarkerPct(imc: number): number {
  const pct = ((imc - 10) / 35) * 100;
  return Math.max(0, Math.min(100, pct));
}

interface BmiScaleIndicatorProps {
  imc: number;
}

function BmiScaleIndicator({ imc }: BmiScaleIndicatorProps) {
  const markerPct = calculateMarkerPct(imc);

  // Segments: [width%, color] proportional to ranges within [10, 45]
  // Abaixo do peso: 10–18.5 (8.5 units), Peso normal: 18.5–25 (6.5), Sobrepeso: 25–30 (5),
  // Obesidade I: 30–35 (5), Obesidade II: 35–40 (5), Obesidade III: 40–45 (5) — total 35 units
  const segments = [
    { width: (8.5 / 35) * 100, color: "bg-yellow-400", label: "Abaixo do peso" },
    { width: (6.5 / 35) * 100, color: "bg-green-500", label: "Peso normal" },
    { width: (5 / 35) * 100, color: "bg-yellow-500", label: "Sobrepeso" },
    { width: (5 / 35) * 100, color: "bg-orange-500", label: "Obesidade I" },
    { width: (5 / 35) * 100, color: "bg-red-500", label: "Obesidade II" },
    { width: (5 / 35) * 100, color: "bg-red-700", label: "Obesidade III" },
  ];

  return (
    <div aria-hidden="true" className="mt-4 px-1">
      <div className="relative h-4 flex rounded-full overflow-hidden">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} h-full`}
            style={{ width: `${seg.width}%` }}
          />
        ))}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-5 bg-white border-2 border-gray-700 rounded-sm shadow"
          style={{ left: `calc(${markerPct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>10</span>
        <span>18,5</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40</span>
        <span>45+</span>
      </div>
    </div>
  );
}

export const IMC_DISCLAIMER =
  "O IMC é um indicador estatístico populacional e não substitui a avaliação médica individual.";

export function getFirstErrorKey(errors: Record<string, unknown>): string | undefined {
  return Object.keys(errors)[0];
}

export default function Imc() {
  const [result, setResult] = useState<BmiResult | null>(null);

  useEffect(() => {
    document.title = "Calculadora de IMC | Fazaconta Online";
  }, []);

  const { register, handleSubmit, setFocus, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedPeso = watch("peso");
  const watchedAltura = watch("altura");

  useEffect(() => {
    if (result !== null) {
      setResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPeso, watchedAltura]);

  const onError = (errs: Record<string, unknown>) => {
    setResult(null);
    const firstKey = getFirstErrorKey(errs);
    if (firstKey) setFocus(firstKey as keyof FormData);
  };

  const onSubmit = (data: FormData) => {
    const imc = calculateBMI(data.peso, data.altura);
    setResult(classifyBMI(imc));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl text-blue-600 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Calculadora de IMC</h1>
        <p className="text-lg text-muted-foreground">
          O Índice de Massa Corporal (IMC) é uma medida internacional usada para calcular se uma pessoa está no peso ideal.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="peso" className="text-base font-semibold">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 70,5"
                  className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                  {...register("peso", { setValueAs: normalizeDecimal })}
                />
                {errors.peso && <p role="alert" className="text-sm text-destructive">{errors.peso.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura" className="text-base font-semibold">Altura (m)</Label>
                <Input
                  id="altura"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 1,75"
                  className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                  {...register("altura", { setValueAs: normalizeDecimal })}
                />
                {errors.altura && <p role="alert" className="text-sm text-destructive">{errors.altura.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Calcular IMC
            </Button>
          </form>

          <div role="region" aria-live="polite" aria-label="Resultado do IMC">
            <ResultBox
              isVisible={result !== null}
              title="Seu Resultado"
              value={<div className="flex items-baseline gap-2">{result?.imc} <span className="text-xl font-normal opacity-70">IMC</span></div>}
              description={`Classificação: ${result?.label}`}
              variant={result?.variant}
            />
            {result !== null && (
              <>
                <BmiScaleIndicator imc={result.imc} />
                <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
                  {IMC_DISCLAIMER}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
