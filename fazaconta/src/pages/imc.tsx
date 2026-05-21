import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { ResultBox, type ResultVariant } from "@/components/result-box";
import { PageMeta } from "@/components/page-meta";
import { AdUnit } from "@/components/ad-unit";
import { RelatedCalculators } from "@/components/related-calculators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowLeft } from "lucide-react";

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

export function BmiScaleIndicator({ imc }: BmiScaleIndicatorProps) {
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
          className="absolute top-1/2 -translate-y-1/2 w-3 h-5 bg-background border-2 border-foreground/60 rounded-sm shadow"
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

const IMC_FAQ = [
  {
    question: "Como calcular o IMC?",
    answer: "O IMC é calculado dividindo o peso em quilogramas pelo quadrado da altura em metros. Fórmula: IMC = Peso (kg) ÷ Altura² (m²). Exemplo: uma pessoa com 70 kg e 1,75 m tem IMC = 70 ÷ (1,75 × 1,75) = 22,86, classificado como peso normal.",
  },
  {
    question: "Qual o IMC ideal para adultos?",
    answer: "Segundo a Organização Mundial da Saúde (OMS), o IMC saudável para adultos está entre 18,5 e 24,9. Abaixo de 18,5 indica baixo peso; entre 25 e 29,9 é sobrepeso; a partir de 30 é classificado como obesidade.",
  },
  {
    question: "O IMC é diferente para homens e mulheres?",
    answer: "A tabela da OMS usa os mesmos intervalos para adultos de ambos os sexos. A interpretação pode variar conforme composição corporal, etnia e idade — por isso o IMC é um indicador de triagem populacional, não um diagnóstico médico individual.",
  },
  {
    question: "O que fazer se o IMC estiver alto?",
    answer: "Um IMC acima de 25 indica sobrepeso e acima de 30 indica obesidade, fatores associados a riscos cardiovasculares e metabólicos. Recomenda-se consultar um médico ou nutricionista para avaliação individualizada e orientação sobre alimentação e atividade física.",
  },
];

const IMC_HOW_TO = {
  name: "Como calcular o IMC",
  description: "Passo a passo para calcular o Índice de Massa Corporal (IMC) online",
  steps: [
    { name: "Informe seu peso", text: "Digite seu peso atual em quilogramas no campo Peso. Use vírgula para decimais, por exemplo: 70,5." },
    { name: "Informe sua altura", text: "Digite sua altura em metros no campo Altura. Por exemplo: 1,75 para 1 metro e 75 centímetros." },
    { name: "Clique em Calcular IMC", text: "Pressione o botão Calcular IMC para obter o resultado instantaneamente." },
    { name: "Veja sua classificação", text: "A calculadora exibe seu IMC e a classificação conforme a tabela da OMS: abaixo do peso, peso normal, sobrepeso ou obesidade." },
  ],
};

export default function Imc() {
  const [result, setResult] = useState<BmiResult | null>(null);

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
      <PageMeta
        title="Calculadora de IMC Online — Descubra Seu Índice de Massa Corporal | Fazaconta"
        description="Calcule seu IMC grátis pela tabela da OMS. Descubra se está abaixo do peso, no peso normal, com sobrepeso ou obesidade. Resultado imediato, sem cadastro."
        faq={IMC_FAQ}
        howTo={IMC_HOW_TO}
        softwareApp
        dateModified="2026-05-01"
      />
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl text-blue-500 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Calculadora de IMC Online</h1>
        <p className="text-lg font-medium text-foreground mb-2">
          Para calcular o IMC, use a fórmula: Peso (kg) ÷ Altura² (m²). Exemplo: 70 kg e 1,75 m → IMC = 22,86 (peso normal).
        </p>
        <p className="text-lg text-muted-foreground">
          O Índice de Massa Corporal (IMC) é um indicador internacional adotado pela OMS para classificar o estado nutricional de adultos. Informe seu peso e altura para obter seu IMC e a classificação instantaneamente, sem cadastro.
        </p>
      </div>

      <AdUnit slot="horizontal" className="mb-6" />

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

      <AdUnit slot="inContent" className="mt-6" />

      <div className="mt-10 space-y-8 text-base text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">Como calcular o IMC?</h2>
          <p className="text-muted-foreground mb-3">
            O IMC (Índice de Massa Corporal) é calculado pela seguinte fórmula, adotada pela Organização Mundial da Saúde (OMS):
          </p>
          <div className="bg-muted/50 rounded-xl px-5 py-4 font-mono text-center text-lg mb-3">
            IMC = Peso (kg) ÷ Altura² (m²)
          </div>
          <p className="text-muted-foreground">
            <strong>Exemplo prático:</strong> uma pessoa com 70 kg e 1,75 m de altura tem IMC = 70 ÷ (1,75 × 1,75) = 70 ÷ 3,0625 = <strong>22,86</strong> — classificado como peso normal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Tabela de IMC — Classificação da OMS para adultos</h2>
          <p className="text-muted-foreground mb-4">
            A Organização Mundial da Saúde classifica o IMC de adultos (maiores de 18 anos) nos seguintes intervalos:
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold">IMC</th>
                  <th className="text-left px-4 py-3 font-semibold">Classificação</th>
                  <th className="text-left px-4 py-3 font-semibold">Risco de saúde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">Abaixo de 18,5</td>
                  <td className="px-4 py-2.5">Abaixo do peso</td>
                  <td className="px-4 py-2.5 text-yellow-600 dark:text-yellow-400">Elevado</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">18,5 – 24,9</td>
                  <td className="px-4 py-2.5 font-medium text-green-600 dark:text-green-400">Peso normal</td>
                  <td className="px-4 py-2.5 text-green-600 dark:text-green-400">Baixo</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">25,0 – 29,9</td>
                  <td className="px-4 py-2.5">Sobrepeso</td>
                  <td className="px-4 py-2.5 text-yellow-600 dark:text-yellow-400">Aumentado</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">30,0 – 34,9</td>
                  <td className="px-4 py-2.5">Obesidade grau I</td>
                  <td className="px-4 py-2.5 text-orange-600 dark:text-orange-400">Alto</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">35,0 – 39,9</td>
                  <td className="px-4 py-2.5">Obesidade grau II</td>
                  <td className="px-4 py-2.5 text-red-500">Muito alto</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-muted-foreground">40,0 ou mais</td>
                  <td className="px-4 py-2.5">Obesidade grau III</td>
                  <td className="px-4 py-2.5 text-red-700 dark:text-red-400">Extremamente alto</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Exemplos práticos de cálculo de IMC</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>60 kg e 1,65 m:</strong> IMC = 60 ÷ 2,7225 ≈ <strong>22,04</strong> → Peso normal</li>
            <li><strong>80 kg e 1,70 m:</strong> IMC = 80 ÷ 2,89 ≈ <strong>27,68</strong> → Sobrepeso</li>
            <li><strong>50 kg e 1,60 m:</strong> IMC = 50 ÷ 2,56 ≈ <strong>19,53</strong> → Peso normal</li>
            <li><strong>100 kg e 1,80 m:</strong> IMC = 100 ÷ 3,24 ≈ <strong>30,86</strong> → Obesidade grau I</li>
            <li><strong>45 kg e 1,55 m:</strong> IMC = 45 ÷ 2,4025 ≈ <strong>18,73</strong> → Peso normal (limítrofe)</li>
          </ul>
        </section>

        <AdUnit slot="bottom" />

        <section>
          <h2 className="text-xl font-semibold mb-3">Perguntas frequentes sobre IMC</h2>

          <h3 className="font-semibold mt-4 mb-1">O IMC é diferente para homens e mulheres?</h3>
          <p className="text-muted-foreground">
            A tabela da OMS usa os mesmos intervalos para adultos de ambos os sexos. A interpretação pode variar conforme composição corporal, etnia e idade — por isso o IMC é um indicador de triagem populacional, não um diagnóstico médico individual.
          </p>

          <h3 className="font-semibold mt-4 mb-1">Qual é o IMC ideal?</h3>
          <p className="text-muted-foreground">
            Para adultos, o IMC entre <strong>18,5 e 24,9</strong> é classificado como peso normal pela OMS. Valores fora dessa faixa indicam risco aumentado para doenças metabólicas e cardiovasculares.
          </p>

          <h3 className="font-semibold mt-4 mb-1">O IMC tem limitações?</h3>
          <p className="text-muted-foreground">
            Sim. O IMC não distingue entre massa muscular e gordura corporal. Um atleta pode ter IMC elevado por musculatura, sem excesso de gordura. Pessoas idosas podem ter IMC normal com excesso de gordura e baixa massa muscular. Para avaliação completa, consulte um médico ou nutricionista.
          </p>

          <h3 className="font-semibold mt-4 mb-1">O IMC serve para crianças e adolescentes?</h3>
          <p className="text-muted-foreground">
            Não com esta tabela. Para menores de 18 anos, o IMC deve ser avaliado pelas curvas de crescimento específicas por idade e sexo, disponíveis nas cadernetas de saúde do Ministério da Saúde. Esta calculadora utiliza a classificação adulta da OMS.
          </p>
        </section>
      </div>

      <RelatedCalculators />

      <div className="mt-6 flex items-center justify-between flex-wrap gap-2">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Voltar para a página inicial
        </Link>
        <p className="text-xs text-muted-foreground">
          Revisado pela equipe Fazaconta · Maio de 2026
        </p>
      </div>
    </div>
  );
}
