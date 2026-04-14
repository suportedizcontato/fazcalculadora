import { Link } from "wouter";
import { Percent, ArrowRight } from "lucide-react";
import { PageMeta } from "@/components/page-meta";

const FAQ_PORCENTAGEM = [
  { question: "O que é porcentagem?", answer: "Porcentagem representa uma fração de 100. O símbolo % indica \"por cem\". Por exemplo, 40% equivale a 40 de cada 100, ou 0,40 em forma decimal." },
  { question: "Como calcular porcentagem de um valor?", answer: "Multiplique o valor pela porcentagem e divida por 100. Para saber quanto é 15% de R$ 200: (15 × 200) ÷ 100 = R$ 30." },
  { question: "Como calcular desconto percentual?", answer: "Subtraia a porcentagem do valor original: valor final = valor − (% × valor ÷ 100). Com 20% de desconto em R$ 150: R$ 150 − R$ 30 = R$ 120." },
  { question: "Como calcular aumento percentual?", answer: "Some a porcentagem ao valor original: valor final = valor + (% × valor ÷ 100). Com 5% de aumento em R$ 1.000: R$ 1.000 + R$ 50 = R$ 1.050." },
  { question: "Como saber quantos por cento um número representa?", answer: "Divida o número pelo total e multiplique por 100. Se você economizou R$ 80 de um salário de R$ 400: (80 ÷ 400) × 100 = 20%." },
];

export default function ComoCalcularPorcentagem() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageMeta
        title="Como Calcular Porcentagem | Fórmula, Exemplos e Calculadora | Fazaconta"
        description="Aprenda como calcular porcentagem com fórmulas e exemplos práticos. Descubra como calcular descontos, aumentos e use nossa calculadora online."
        faq={FAQ_PORCENTAGEM}
      />
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl text-blue-600 mb-4">
          <Percent className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Como Calcular Porcentagem
        </h1>
        <p className="text-lg text-muted-foreground">
          Porcentagem está presente no cotidiano: descontos em compras, juros no
          cartão, aumentos salariais, notas escolares. Entender como calcular
          porcentagem é uma habilidade prática que facilita decisões financeiras
          e do dia a dia.
        </p>
      </div>

      <div className="space-y-10 text-base text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">O que é porcentagem?</h2>
          <p className="text-muted-foreground">
            Porcentagem representa uma parte de 100. O símbolo <strong>%</strong>{" "}
            vem do latim <em>per centum</em>, que significa "por cem". Quando
            dizemos que algo representa 30%, estamos dizendo que é equivalente a
            30 partes de cada 100.
          </p>
          <p className="text-muted-foreground mt-3">
            Na prática, a porcentagem é usada para comparar proporções, calcular
            descontos, aplicar juros, medir crescimento e expressar qualquer
            relação entre uma parte e um todo de forma padronizada.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular porcentagem?
          </h2>
          <p className="text-muted-foreground">
            A fórmula da porcentagem relaciona uma parte a um total:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              porcentagem = (parte ÷ total) × 100
            </p>
          </div>
          <p className="text-muted-foreground">
            Por exemplo, se você acertou 45 questões em uma prova de 60, quanto
            é X% de acerto?
          </p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>(45 ÷ 60) × 100 = <strong>75%</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular X% de um valor?
          </h2>
          <p className="text-muted-foreground">
            Para descobrir quanto é X% de um número, use:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">resultado = (X × valor) ÷ 100</p>
          </div>
          <p className="text-muted-foreground">Exemplo:</p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>
              Quanto é 10% de 200?
            </p>
            <p>(10 × 200) ÷ 100 = <strong>20</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Exemplos práticos de porcentagem
          </h2>
          <p className="text-muted-foreground mb-3">
            Veja como aplicar a fórmula em situações comuns:
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
                  <td className="p-3 text-muted-foreground">20% de 150</td>
                  <td className="p-3 font-medium">30</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">50% de 80</td>
                  <td className="p-3 font-medium">40</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">10% de 500</td>
                  <td className="p-3 font-medium">50</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">25% de 200</td>
                  <td className="p-3 font-medium">50</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">15% de 300</td>
                  <td className="p-3 font-medium">45</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular desconto percentual?
          </h2>
          <p className="text-muted-foreground">
            Para calcular o valor final após um desconto, subtraia a porcentagem
            do valor original:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              valor final = valor − (porcentagem × valor ÷ 100)
            </p>
          </div>
          <p className="text-muted-foreground">Exemplo:</p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>Produto de R$&nbsp;100 com 10% de desconto:</p>
            <p>
              R$&nbsp;100 − (10 × 100 ÷ 100) = R$&nbsp;100 − R$&nbsp;10 ={" "}
              <strong>R$&nbsp;90</strong>
            </p>
          </div>
          <p className="text-muted-foreground mt-3">
            Uma forma mais rápida: multiplique o valor por{" "}
            <strong>(1 − X/100)</strong>. Para 10% de desconto, multiplique por
            0,90.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular aumento percentual?
          </h2>
          <p className="text-muted-foreground">
            Para calcular o valor final após um aumento, some a porcentagem ao
            valor original:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              valor final = valor + (porcentagem × valor ÷ 100)
            </p>
          </div>
          <p className="text-muted-foreground">Exemplo:</p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>Salário de R$&nbsp;100 com 10% de aumento:</p>
            <p>
              R$&nbsp;100 + (10 × 100 ÷ 100) = R$&nbsp;100 + R$&nbsp;10 ={" "}
              <strong>R$&nbsp;110</strong>
            </p>
          </div>
          <p className="text-muted-foreground mt-3">
            Atalho: multiplique por <strong>(1 + X/100)</strong>. Para 10% de
            aumento, multiplique por 1,10.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular a porcentagem entre dois valores?
          </h2>
          <p className="text-muted-foreground">
            Para saber quantos por cento um número representa em relação a
            outro, use:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              % = (valor1 ÷ valor2) × 100
            </p>
          </div>
          <p className="text-muted-foreground">Exemplo:</p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>50 é quantos % de 200?</p>
            <p>
              (50 ÷ 200) × 100 = <strong>25%</strong>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Perguntas frequentes</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold mb-1">O que é porcentagem?</h3>
              <p className="text-muted-foreground">
                Porcentagem representa uma fração de 100. O símbolo % indica
                "por cem". Por exemplo, 40% equivale a 40 de cada 100, ou 0,40
                em forma decimal.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular porcentagem de um valor?
              </h3>
              <p className="text-muted-foreground">
                Multiplique o valor pela porcentagem e divida por 100. Para
                saber quanto é 15% de R$&nbsp;200: (15 × 200) ÷ 100 =
                R$&nbsp;30. Você também pode usar nossa{" "}
                <Link
                  href="/calculadora-porcentagem"
                  className="text-primary hover:underline"
                >
                  calculadora de porcentagem online
                </Link>{" "}
                para obter o resultado em segundos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular desconto percentual?
              </h3>
              <p className="text-muted-foreground">
                Subtraia a porcentagem do valor original: valor final = valor −
                (% × valor ÷ 100). Com 20% de desconto em R$&nbsp;150: R$&nbsp;150
                − R$&nbsp;30 = R$&nbsp;120.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular aumento percentual?
              </h3>
              <p className="text-muted-foreground">
                Some a porcentagem ao valor original: valor final = valor + (%
                × valor ÷ 100). Com 5% de aumento em R$&nbsp;1.000:
                R$&nbsp;1.000 + R$&nbsp;50 = R$&nbsp;1.050.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como saber quantos por cento um número representa?
              </h3>
              <p className="text-muted-foreground">
                Divida o número pelo total e multiplique por 100. Se você
                economizou R$&nbsp;80 de um salário de R$&nbsp;400: (80 ÷ 400)
                × 100 = 20%. Você economizou 20% do salário.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h2 className="text-2xl font-semibold mb-2">
            Use a calculadora de porcentagem
          </h2>
          <p className="text-muted-foreground mb-4">
            Quer calcular porcentagens de forma rápida e sem erro? Use nossa
            calculadora online gratuita — suporte a múltiplos modos: porcentagem
            de um valor, desconto, aumento e variação entre dois valores.
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
              <Link href="/calculadora-imc" className="text-primary hover:underline">
                Calculadora de IMC
              </Link>{" "}
              — calcule seu índice de massa corporal.
            </li>
            <li>
              <Link
                href="/consumo-agua"
                className="text-primary hover:underline"
              >
                Calculadora de Consumo de Água
              </Link>{" "}
              — descubra a quantidade ideal de água por dia.
            </li>
            <li>
              <Link
                href="/conversor-xicaras"
                className="text-primary hover:underline"
              >
                Conversor de Xícaras
              </Link>{" "}
              — converta medidas de receitas para ml e copos.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
