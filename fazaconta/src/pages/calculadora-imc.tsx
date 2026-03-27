import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { ResultBox } from "@/components/result-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowLeft } from "lucide-react";
// Reutiliza os utilitários já validados da página /imc.
// Se imc.tsx for renomeado, esta importação precisará ser atualizada.
import {
  pesoSchema,
  alturaSchema,
  calculateBMI,
  classifyBMI,
  normalizeDecimal,
} from "@/pages/imc";

const imcFormSchema = z.object({
  peso: pesoSchema,
  altura: alturaSchema,
});

type FormData = z.infer<typeof imcFormSchema>;

export default function CalculadoraImc() {
  const [result, setResult] = useState<ReturnType<typeof classifyBMI> | null>(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Calculadora de IMC Online Grátis | Fazaconta";

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const prevContent = metaDesc.content;
    metaDesc.content =
      "Calcule seu IMC de forma rápida e fácil. Descubra se você está no peso ideal com nossa calculadora online gratuita.";

    return () => {
      document.title = prevTitle;
      metaDesc!.content = prevContent;
    };
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(imcFormSchema),
  });

  const watchedPeso = watch("peso");
  const watchedAltura = watch("altura");

  useEffect(() => {
    if (result !== null) {
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPeso, watchedAltura]);

  const onSubmit = (data: FormData) => {
    const imc = calculateBMI(data.peso, data.altura);
    setResult(classifyBMI(imc));
  };

  const resultText = result
    ? `Seu IMC é ${result.imc.toFixed(1)} (${result.label})`
    : "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl text-blue-600 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Calculadora de IMC Online
        </h1>
        <p className="text-lg text-muted-foreground">
          O Índice de Massa Corporal (IMC) é uma medida usada para avaliar se uma pessoa está no
          peso ideal em relação à sua altura. Calcule seu IMC gratuitamente e descubra sua
          classificação.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="peso" className="text-base font-semibold">
                  Peso (kg)
                </Label>
                <Input
                  id="peso"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 70,5"
                  className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                  {...register("peso", { setValueAs: normalizeDecimal })}
                />
                {errors.peso && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.peso.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura" className="text-base font-semibold">
                  Altura (m)
                </Label>
                <Input
                  id="altura"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 1,75"
                  className="h-14 text-lg pl-4 bg-muted/50 focus:bg-background transition-colors"
                  {...register("altura", { setValueAs: normalizeDecimal })}
                />
                {errors.altura && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.altura.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Calcular
            </Button>
          </form>

          <div role="region" aria-live="polite" aria-label="Resultado do IMC">
            <ResultBox
              isVisible={result !== null}
              title="Seu Resultado"
              value={resultText}
              variant={result?.variant}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 space-y-8 text-base text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">O que é IMC?</h2>
          <p className="text-muted-foreground">
            O Índice de Massa Corporal (IMC) é um indicador estatístico criado pelo matemático
            Adolphe Quetelet no século XIX. Ele relaciona o peso e a altura de uma pessoa para
            fornecer uma estimativa do nível de gordura corporal. Embora seja amplamente utilizado
            por profissionais de saúde, o IMC é uma medida populacional e não substitui a avaliação
            médica individual.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Como calcular o IMC?</h2>
          <p className="text-muted-foreground">
            A fórmula do IMC é simples:{" "}
            <strong>
              IMC = peso (kg) ÷ altura² (m²)
            </strong>
            . Por exemplo, uma pessoa com 70&nbsp;kg e 1,75&nbsp;m de altura tem IMC = 70 ÷ (1,75
            × 1,75) ≈ 22,9. Basta preencher os campos acima e clicar em Calcular.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Tabela de IMC</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              <strong>Abaixo do peso:</strong> IMC abaixo de 18,5
            </li>
            <li>
              <strong>Peso normal:</strong> IMC entre 18,5 e 24,9
            </li>
            <li>
              <strong>Sobrepeso:</strong> IMC entre 25,0 e 29,9
            </li>
            <li>
              <strong>Obesidade grau I:</strong> IMC entre 30,0 e 34,9
            </li>
            <li>
              <strong>Obesidade grau II:</strong> IMC entre 35,0 e 39,9
            </li>
            <li>
              <strong>Obesidade grau III:</strong> IMC igual ou superior a 40,0
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Perguntas frequentes</h2>

          <h3 className="font-semibold mt-4 mb-1">O que é IMC?</h3>
          <p className="text-muted-foreground">
            IMC significa Índice de Massa Corporal. É uma medida numérica calculada a partir do
            peso e da altura que classifica o estado nutricional de uma pessoa em categorias como
            abaixo do peso, peso normal, sobrepeso e obesidade.
          </p>

          <h3 className="font-semibold mt-4 mb-1">Como calcular IMC?</h3>
          <p className="text-muted-foreground">
            Divida seu peso em quilogramas pelo quadrado da sua altura em metros. Exemplo: 80&nbsp;kg
            ÷ (1,80 × 1,80) = 24,7. Use a calculadora acima para obter o resultado instantaneamente.
          </p>

          <h3 className="font-semibold mt-4 mb-1">Qual é o IMC ideal?</h3>
          <p className="text-muted-foreground">
            Segundo a Organização Mundial da Saúde (OMS), o IMC ideal para adultos está entre 18,5
            e 24,9, classificado como "Peso normal". Valores abaixo ou acima desse intervalo
            indicam risco à saúde e merecem atenção médica.
          </p>

          <h3 className="font-semibold mt-4 mb-1">IMC é confiável?</h3>
          <p className="text-muted-foreground">
            O IMC é uma ferramenta de triagem prática e amplamente utilizada, mas não leva em conta
            fatores como percentual de gordura, massa muscular ou distribuição de gordura corporal.
            Atletas com muita massa muscular, por exemplo, podem ter IMC elevado sem excesso de
            gordura. Sempre consulte um profissional de saúde para uma avaliação completa.
          </p>
        </section>
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
