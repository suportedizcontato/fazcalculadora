import { Link } from "wouter";
import { Percent, ArrowRight } from "lucide-react";
import { PageMeta } from "@/components/page-meta";

const FAQ_X_PORCENTO = [
  { question: "Como calcular porcentagem de um valor?", answer: "Multiplique o valor pela porcentagem e divida por 100. Para saber quanto é 15% de R$ 200: (15 × 200) ÷ 100 = R$ 30." },
  { question: "Quanto é X% de Y?", answer: "Use a fórmula: resultado = (X × Y) ÷ 100. Exemplos: 10% de 500 = 50; 25% de 200 = 50; 50% de 90 = 45." },
  { question: "Como calcular porcentagem rapidamente?", answer: "Para 10%, divida por 10. Para 5%, divida por 20. Para 1%, divida por 100. Para outras porcentagens, use a fórmula (porcentagem × valor) ÷ 100." },
  { question: "Qual é a fórmula da porcentagem?", answer: "A fórmula é: resultado = (porcentagem × valor) ÷ 100. Para descobrir que porcentagem A representa de B, use: % = (A ÷ B) × 100." },
];

export default function QuantoEXPorcentoDeY() {

  return (
    <div className="max-w-2xl mx-auto">
      <PageMeta
        title="Quanto é X% de um valor? | Exemplos e Calculadora | Fazaconta"
        description="Descubra quanto é X% de um valor com exemplos práticos. Aprenda a calcular porcentagem e use nossa calculadora online gratuita."
        faq={FAQ_X_PORCENTO}
      />
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 mb-4">
          <Percent className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Quanto é X% de um valor?
        </h1>
        <p className="text-lg font-medium text-foreground mb-2">
          Para calcular quanto é X% de um valor, multiplique o número pela porcentagem e divida por 100.
        </p>
        <p className="text-lg font-medium text-foreground mb-3">
          Exemplo: 10% de 200 = 20.
        </p>
        <ul className="list-disc list-inside space-y-1 text-base text-muted-foreground mb-4">
          <li>10% de 200 = 20</li>
          <li>15% de 300 = 45</li>
          <li>25% de 400 = 100</li>
        </ul>
        <p className="text-lg text-muted-foreground">
          Calcular porcentagem de um valor é uma das operações mais comuns do
          dia a dia — presente em descontos, juros, comissões e reajustes.
          Entender a fórmula permite resolver qualquer caso rapidamente.
        </p>
      </div>

      <div className="space-y-10 text-base text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular porcentagem de um valor?
          </h2>
          <p className="text-muted-foreground mb-3">
            A fórmula para calcular quanto é X% de um número é:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              resultado = (X × valor) ÷ 100
            </p>
          </div>
          <p className="text-muted-foreground mb-3">
            Exemplos:
          </p>
          <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
            <p>Quanto é 10% de 200? → (10 × 200) ÷ 100 = <strong>20</strong></p>
            <p>Quanto é 15% de 300? → (15 × 300) ÷ 100 = <strong>45</strong></p>
            <p>Quanto é 30% de 250? → (30 × 250) ÷ 100 = <strong>75</strong></p>
          </div>
          <p className="text-muted-foreground mt-3">
            Atalho: mova a vírgula dois lugares para a esquerda e multiplique.
            Para 10%, basta dividir o valor por 10. Para 1%, divida por 100.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Exemplos práticos</h2>
          <p className="text-muted-foreground mb-3">
            Veja quanto é cada porcentagem para diferentes valores:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="p-3 font-semibold rounded-tl-lg">Cálculo</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 text-muted-foreground">10% de 200</td>
                  <td className="p-3 font-medium">20</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">15% de 300</td>
                  <td className="p-3 font-medium">45</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">20% de 150</td>
                  <td className="p-3 font-medium">30</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">25% de 400</td>
                  <td className="p-3 font-medium">100</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">30% de 250</td>
                  <td className="p-3 font-medium">75</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">50% de 80</td>
                  <td className="p-3 font-medium">40</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">5% de 1.000</td>
                  <td className="p-3 font-medium">50</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">12% de 500</td>
                  <td className="p-3 font-medium">60</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">8% de 3.000</td>
                  <td className="p-3 font-medium">240</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">35% de 200</td>
                  <td className="p-3 font-medium">70</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Casos comuns de uso</h2>
          <p className="text-muted-foreground mb-3">
            Calcular quanto é X% de um valor aparece em diversas situações do dia a dia:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <strong>Descontos em compras:</strong> saber quanto é 20% de
              R$&nbsp;150 permite calcular o valor final antes de pagar.
            </li>
            <li>
              <strong>Juros e taxas:</strong> calcular 2,5% de juros sobre
              uma dívida de R$&nbsp;800 resulta em R$&nbsp;20 de encargo.
            </li>
            <li>
              <strong>Comissões sobre vendas:</strong> uma comissão de 5%
              sobre R$&nbsp;10.000 em vendas equivale a R$&nbsp;500.
            </li>
            <li>
              <strong>Reajustes de preço:</strong> calcular 8% de aumento
              em R$&nbsp;1.200 indica que o novo valor será R$&nbsp;1.296.
            </li>
            <li>
              <strong>Gorjeta em restaurantes:</strong> 10% de uma conta de
              R$&nbsp;180 corresponde a R$&nbsp;18 de gorjeta.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Perguntas frequentes</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular porcentagem de um valor?
              </h3>
              <p className="text-muted-foreground">
                Multiplique o valor pela porcentagem e divida por 100. Para
                saber quanto é 15% de R$&nbsp;200: (15 × 200) ÷ 100 =
                R$&nbsp;30.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Quanto é X% de Y?</h3>
              <p className="text-muted-foreground">
                Use a fórmula: resultado = (X × Y) ÷ 100. Exemplos: 10% de
                500 = 50; 25% de 200 = 50; 50% de 90 = 45.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular porcentagem rapidamente?
              </h3>
              <p className="text-muted-foreground">
                Para 10%, divida por 10. Para 5%, divida por 20. Para 1%,
                divida por 100. Para outras porcentagens, use a fórmula ou
                nossa{" "}
                <Link
                  href="/calculadora-porcentagem"
                  className="text-primary hover:underline"
                >
                  calculadora de porcentagem online
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Qual é a fórmula da porcentagem?
              </h3>
              <p className="text-muted-foreground">
                A fórmula é: resultado = (porcentagem × valor) ÷ 100. Para
                descobrir que porcentagem A representa de B, use: % = (A ÷ B)
                × 100.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <h2 className="text-2xl font-semibold mb-2">
            Calcule porcentagem rapidamente
          </h2>
          <p className="text-muted-foreground mb-4">
            Use nossa calculadora de porcentagem para obter resultados
            instantâneos. Suporte a cinco modos: porcentagem de um valor,
            desconto, aumento, que percentual é A de B e variação entre dois
            valores.
          </p>
          <Link
            href="/calculadora-porcentagem"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Usar a calculadora de porcentagem
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Veja também</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/como-calcular-porcentagem"
                className="text-primary hover:underline"
              >
                Como calcular porcentagem
              </Link>{" "}
              — fórmulas e exemplos completos.
            </li>
            <li>
              <Link
                href="/como-calcular-desconto"
                className="text-primary hover:underline"
              >
                Como calcular desconto percentual
              </Link>{" "}
              — calcule o valor final após descontos.
            </li>
            <li>
              <Link
                href="/como-calcular-aumento-percentual"
                className="text-primary hover:underline"
              >
                Como calcular aumento percentual
              </Link>{" "}
              — reajustes de preço e salário.
            </li>
            <li>
              <Link
                href="/calculadora-imc"
                className="text-primary hover:underline"
              >
                Calculadora de IMC
              </Link>{" "}
              — calcule seu índice de massa corporal.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
