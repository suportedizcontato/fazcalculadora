import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResultBox } from "@/components/result-box";
import { PageMeta } from "@/components/page-meta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets } from "lucide-react";

export function normalizeDecimal(raw: string): string {
  const withPeriod = raw.replace(/,/g, ".");
  if (withPeriod.startsWith(".")) return "0" + withPeriod;
  return withPeriod;
}

export const pesoAguaSchema = z
  .string()
  .refine((v) => v.trim().length > 0, { message: "Informe o peso corporal" })
  .transform((v) => parseFloat(v))
  .refine((v) => isFinite(v), { message: "Insira um número válido" })
  .refine((v) => v >= 20 && v <= 300, {
    message: "Peso fora do intervalo permitido (20 kg a 300 kg)",
  })
  .refine((v) => (String(v).split(".")[1]?.length ?? 0) <= 2, {
    message: "Máximo de 2 casas decimais permitidas",
  });

export type WaterResult = {
  ml: number;
  litros: number;
  copos: number;
};

export function calculateWaterIntake(pesoKg: number): WaterResult {
  const ml = Math.round(pesoKg * 35);
  const litros = parseFloat((ml / 1000).toFixed(2));
  const copos = Math.round(ml / 250);
  return { ml, litros, copos };
}

const formSchema = z.object({
  peso: pesoAguaSchema,
});

type FormData = z.infer<typeof formSchema>;

export const WATER_DISCLAIMER =
  "A ingestão ideal de água pode variar conforme atividade física, clima e condições de saúde. Consulte um profissional de saúde para orientação individualizada.";

export default function Agua() {
  const [result, setResult] = useState<WaterResult | null>(null);

  const { register, handleSubmit, setFocus, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedPeso = watch("peso");

  useEffect(() => {
    if (result !== null) {
      setResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPeso]);

  const onError = () => {
    setResult(null);
    setFocus("peso");
  };

  const onSubmit = (data: FormData) => {
    setResult(calculateWaterIntake(data.peso));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageMeta
        title="Calculadora de Consumo de Água Diário | Fazaconta"
        description="Descubra quantos litros de água você deve beber por dia com base no seu peso corporal. Cálculo gratuito e instantâneo."
        faq={[
          {
            question: "Quantos litros de água devo beber por dia?",
            answer: "A recomendação geral é de 35 ml por kg de peso corporal. Uma pessoa de 70 kg deve beber cerca de 2,45 litros (aproximadamente 10 copos de 250 ml) por dia.",
          },
          {
            question: "A fórmula de 35 ml por kg serve para todo mundo?",
            answer: "É uma referência amplamente utilizada, mas pode variar conforme atividade física, temperatura ambiente, condições de saúde e gestação. Consulte um profissional de saúde para orientação individualizada.",
          },
          {
            question: "Outros líquidos contam como ingestão de água?",
            answer: "Sucos naturais, chás, sopas e até alimentos com alto teor de água (melancia, pepino) contribuem para a hidratação diária. A fórmula de 35 ml/kg considera exclusivamente água pura.",
          },
          {
            question: "Como saber se estou bebendo água suficiente?",
            answer: "O indicador mais prático é a cor da urina: amarelo-claro indica hidratação adequada; amarelo-escuro indica necessidade de beber mais água. Sede frequente também é sinal de desidratação leve.",
          },
        ]}
      />
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-50 rounded-xl text-cyan-500 mb-4">
          <Droplets className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Consumo Diário de Água</h1>
        <p className="text-lg text-muted-foreground">
          Calcule a quantidade ideal de água que você deve ingerir por dia com base no seu peso corporal (35ml por kg).
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="peso" className="text-base font-semibold">Seu peso corporal</Label>
              <div className="relative">
                <Input
                  id="peso"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 70"
                  aria-describedby="peso-error"
                  className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                  {...register("peso", { setValueAs: normalizeDecimal })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">kg</span>
              </div>
              {errors.peso && (
                <p id="peso-error" role="alert" className="text-sm text-destructive">
                  {errors.peso.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Calcular Consumo
            </Button>
          </form>

          <div role="region" aria-live="polite" aria-label="Resultado do consumo de água">
            <ResultBox
              isVisible={result !== null}
              title="Meta Diária Recomendada"
              variant="info"
              value={
                <div className="flex flex-col">
                  <span>{result?.litros.toLocaleString("pt-BR")} <span className="text-2xl font-normal opacity-80">Litros</span></span>
                  <span className="text-lg font-medium opacity-70 mt-1">({result?.ml.toLocaleString("pt-BR")} ml)</span>
                </div>
              }
              description={`Equivalente a cerca de ${result?.copos} copos de 250 ml por dia.`}
            />
            {result !== null && (
              <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
                {WATER_DISCLAIMER}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground text-right">
        Revisado pela equipe Fazaconta · Abril de 2026
      </p>
    </div>
  );
}
