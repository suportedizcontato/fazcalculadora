import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResultBox } from "@/components/result-box";
import { PageMeta } from "@/components/page-meta";
import { AdUnit } from "@/components/ad-unit";
import { RelatedCalculators } from "@/components/related-calculators";
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
      <PageMeta
        title="Conversor de Xícaras para ML e Copos — Resultado Imediato | Fazaconta"
        description="Converta xícaras para ml e copos em segundos. 1 xícara = 240 ml. Ideal para receitas. Gratuito e sem cadastro."
        faq={[
          {
            question: "Quantos ml tem uma xícara de receita?",
            answer: "A xícara de chá padrão brasileira tem 240 ml. Este conversor usa esse valor, que é o mais comum em receitas nacionais.",
          },
          {
            question: "Qual a diferença entre xícara de chá e xícara de café?",
            answer: "A xícara de chá tem 240 ml. A xícara de café tem aproximadamente 50 ml. Receitas brasileiras geralmente se referem à xícara de chá quando pedem 'xícara' sem especificar.",
          },
          {
            question: "Xícara brasileira é igual à xícara americana (cup)?",
            answer: "Não. A xícara americana (1 cup) tem 240 ml, coincidindo com a xícara de chá brasileira. Porém, algumas receitas importadas usam a xícara americana de 236 ml — a diferença é mínima para uso culinário.",
          },
          {
            question: "Quantas xícaras cabem em um copo americano de 200 ml?",
            answer: "Um copo americano de 200 ml equivale a aproximadamente 0,83 xícara de chá (240 ml). Ou seja, para encher 1 xícara você precisa de 1,2 copos de 200 ml.",
          },
        ]}
        softwareApp
        dateModified="2026-04-01"
      />
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-xl text-amber-600 mb-4">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Conversor de Xícaras para ML</h1>
        <p className="text-lg text-muted-foreground">
          Sua receita pede xícaras mas você só tem copos ou medidor de ML? Descubra as equivalências exatas.
        </p>
      </div>

      <AdUnit slot="horizontal" className="mb-6" />

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
      <AdUnit slot="inContent" className="mt-6" />

      <div className="mt-10 space-y-8 text-base text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">Tabela de conversão de xícaras</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Xícaras (chá, 240 ml)</th>
                  <th className="px-4 py-3 font-semibold">Em ml</th>
                  <th className="px-4 py-3 font-semibold">Copos de 200 ml</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["¼ xícara", 0.25],
                  ["½ xícara", 0.5],
                  ["¾ xícara", 0.75],
                  ["1 xícara", 1],
                  ["1½ xícaras", 1.5],
                  ["2 xícaras", 2],
                  ["3 xícaras", 3],
                ].map(([label, qtd]) => {
                  const q = qtd as number;
                  const ml = Math.round(q * 240);
                  const copos = (ml / 200).toFixed(1);
                  return (
                    <tr key={String(label)} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{label as string}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{ml} ml</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{copos.replace(".", ",")} copos</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Tipos de xícara e equivalências</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-3 font-semibold">Utensílio</th>
                  <th className="px-4 py-3 font-semibold">Volume padrão</th>
                  <th className="px-4 py-3 font-semibold">Uso típico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">Xícara de chá (BR)</td>
                  <td className="px-4 py-2.5 text-muted-foreground">240 ml</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Receitas brasileiras</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">Cup americana (US)</td>
                  <td className="px-4 py-2.5 text-muted-foreground">236 ml</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Receitas importadas</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">Xícara de café</td>
                  <td className="px-4 py-2.5 text-muted-foreground">50–80 ml</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Bebidas, bolos de café</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">Copo americano</td>
                  <td className="px-4 py-2.5 text-muted-foreground">200 ml</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Referência em hidratação</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Perguntas frequentes</h2>

          <div>
            <h3 className="font-semibold mb-1">Quantos ml tem uma xícara de receita?</h3>
            <p className="text-muted-foreground">
              A xícara de chá padrão brasileira tem 240 ml. Este conversor usa esse valor, que é
              o mais comum em receitas nacionais. Algumas receitas importadas usam a cup americana
              de 236 ml — a diferença de 4 ml é irrelevante para uso culinário.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Qual a diferença entre xícara de chá e de café?</h3>
            <p className="text-muted-foreground">
              A xícara de chá tem 240 ml. A xícara de café tem aproximadamente 50–80 ml. Receitas
              brasileiras geralmente se referem à xícara de chá quando pedem "xícara" sem
              especificar o tipo.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Xícara brasileira é igual à xícara americana (cup)?</h3>
            <p className="text-muted-foreground">
              Quase. A xícara americana (1 cup) tem 240 ml, coincidindo exatamente com a xícara de
              chá brasileira de 240 ml. A versão oficial americana é 236,588 ml (8 fl oz), mas a
              diferença é desprezível em receitas.
            </p>
          </div>
        </section>
      </div>

      <AdUnit slot="bottom" className="mt-8" />

      <RelatedCalculators />

      <p className="mt-6 text-xs text-muted-foreground text-right">
        Revisado pela equipe Fazaconta · Abril de 2026
      </p>
    </div>
  );
}
