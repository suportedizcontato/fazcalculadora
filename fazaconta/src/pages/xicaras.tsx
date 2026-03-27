import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee } from "lucide-react";

export function normalizeDecimal(raw: string): string {
  const trimmed = raw.trim();
  const withPeriod = trimmed.replace(/,/g, ".");
  if (withPeriod.startsWith(".")) return "0" + withPeriod;
  return withPeriod;
}

export const xícarasSchema = z
  .string()
  .refine((v) => v.trim().length > 0, { message: "Informe a quantidade de xícaras." })
  .transform((v) => parseFloat(v))
  .refine((v) => isFinite(v), { message: "Informe um número válido." })
  .refine((v) => v > 0, { message: "O valor deve ser maior que zero." })
  .refine((v) => v <= 9999, { message: "O valor excede o máximo permitido (9999 xícaras)." })
  .refine((v) => (String(v).split(".")[1]?.length ?? 0) <= 2, {
    message: "Use no máximo duas casas decimais.",
  });

export const ML_PER_XICARA = 240 as const;
export const ML_PER_COPO = 200 as const;

export type CupResult = {
  ml: number;
  copos: number;
};

export function calculateCupConversion(xicaras: number): CupResult {
  const ml = Math.round(xicaras * ML_PER_XICARA);
  const copos = parseFloat((ml / ML_PER_COPO).toFixed(1));
  return { ml, copos };
}

export const XICARAS_DISCLAIMER =
  "Medidas culinárias podem variar conforme o utensílio, a receita ou o padrão regional.";

const formSchema = z.object({
  xicaras: xícarasSchema,
});

type FormData = z.infer<typeof formSchema>;

export default function Xicaras() {
  const [result, setResult] = useState<CupResult | null>(null);

  useEffect(() => {
    document.title = "Conversor de Xícaras | Fazaconta Online";
  }, []);

  const { register, handleSubmit, setFocus, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedXicaras = watch("xicaras");

  useEffect(() => {
    if (result !== null) {
      setResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedXicaras]);

  const onError = () => {
    setResult(null);
    setFocus("xicaras");
  };

  const onSubmit = (data: FormData) => {
    setResult(calculateCupConversion(data.xicaras));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-xl text-amber-600 mb-4">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Conversor de Xícaras para ML</h1>
        <p className="text-lg text-muted-foreground">
          Sua receita pede xícaras mas você só tem copos ou medidor de ML? Descubra as equivalências exatas.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="xicaras" className="text-base font-semibold">Quantidade de xícaras</Label>
              <div className="relative">
                <Input
                  id="xicaras"
                  type="text"
                  inputMode="decimal"
                  aria-describedby="xicaras-error"
                  placeholder="Ex: 2.5"
                  className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                  {...register("xicaras", { setValueAs: normalizeDecimal })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">xícaras</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Utilize valores decimais (ex: 1.5 para uma xícara e meia)</p>
              {errors.xicaras && (
                <p id="xicaras-error" role="alert" className="text-sm text-destructive">
                  {errors.xicaras.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Converter
            </Button>
          </form>

          <div role="region" aria-live="polite" aria-label="Resultado da conversão">
            <ResultBox
              isVisible={result !== null}
              title="Equivale a"
              variant="warning"
              value={
                <div className="flex flex-col">
                  <span>{result?.ml.toLocaleString('pt-BR')} <span className="text-2xl font-normal opacity-80">ml</span></span>
                  <span className="text-lg font-medium opacity-70 mt-1">ou {result?.copos.toLocaleString('pt-BR')} copos americanos (200ml)</span>
                </div>
              }
              description="Considerando a xícara de chá padrão de 240ml."
            />
            {result !== null && (
              <p className="mt-2 text-xs text-muted-foreground">{XICARAS_DISCLAIMER}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
