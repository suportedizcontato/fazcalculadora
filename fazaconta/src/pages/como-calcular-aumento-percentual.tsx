import { useEffect } from "react";
import { Link } from "wouter";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function ComoCalcularAumentoPercentual() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "Como Calcular Aumento Percentual | Fórmula e Exemplos | Fazaconta";

    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const prevContent = metaDesc.content;
    metaDesc.content =
      "Aprenda como calcular aumento percentual com fórmula e exemplos práticos. Descubra o valor final após reajustes de forma simples.";

    return () => {
      document.title = prevTitle;
      metaDesc!.content = prevContent;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 mb-4">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Como Calcular Aumento Percentual
        </h1>
        <p className="text-lg font-medium text-foreground mb-2">
          Para calcular aumento percentual, use a fórmula: valor final = valor + (porcentagem × valor ÷ 100).
        </p>
        <p className="text-lg font-medium text-foreground mb-3">
          Exemplo: 10% de aumento em R$&nbsp;200 resulta em R$&nbsp;220.
        </p>
        <ul className="list-disc list-inside space-y-1 text-base text-muted-foreground mb-4">
          <li>Quanto é 10% de aumento em R$&nbsp;100? = R$&nbsp;110</li>
          <li>Quanto é 8% de aumento em R$&nbsp;3.000? = R$&nbsp;3.240</li>
          <li>Quanto é 15% de aumento em R$&nbsp;200? = R$&nbsp;230</li>
        </ul>
        <p className="text-lg text-muted-foreground">
          Aumento percentual está presente em reajustes de preço, aumentos
          salariais, correção pela inflação e rendimentos de investimentos.
          Saber calcular evita surpresas e ajuda a planejar melhor.
        </p>
      </div>

      <div className="space-y-10 text-base text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">
            O que é aumento percentual?
          </h2>
          <p className="text-muted-foreground">
            Aumento percentual é o acréscimo de um valor com base em uma
            porcentagem. Quando um produto sofre reajuste de 15%, o preço
            original é aumentado em 15% do próprio valor. O resultado é um
            novo valor maior que o original.
          </p>
          <p className="text-muted-foreground mt-3">
            É diferente de somar um valor fixo: um aumento de 10% em
            R$&nbsp;1.000 vale R$&nbsp;100, mas um aumento de 10% em
            R$&nbsp;5.000 vale R$&nbsp;500 — a porcentagem sempre incide sobre
            o valor base.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular aumento percentual?
          </h2>
          <p className="text-muted-foreground mb-3">
            Para calcular aumento percentual — seja para calcular aumento de
            preço, calcular aumento de salário ou qualquer reajuste — some a
            porcentagem ao valor original usando a fórmula:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              valor final = valor + (porcentagem × valor ÷ 100)
            </p>
          </div>
          <p className="text-muted-foreground">
            Exemplo: salário de R$&nbsp;3.000 com 8% de aumento:
          </p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>aumento = 8 × 3.000 ÷ 100 = R$&nbsp;240</p>
            <p>valor final = R$&nbsp;3.000 + R$&nbsp;240 = <strong>R$&nbsp;3.240</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Fórmula do aumento percentual
          </h2>
          <p className="text-muted-foreground mb-3">
            Você pode calcular em dois passos:
          </p>
          <div className="p-4 bg-muted rounded-xl space-y-3 text-sm">
            <p>
              <span className="font-semibold">Passo 1 — valor do aumento:</span>
              <br />
              aumento = (porcentagem × valor) ÷ 100
            </p>
            <p>
              <span className="font-semibold">Passo 2 — valor final:</span>
              <br />
              valor final = valor + aumento
            </p>
          </div>
          <p className="text-muted-foreground mt-3">
            Atalho: multiplique o valor por{" "}
            <strong>(1 + X/100)</strong>. Para 10% de aumento, multiplique por
            1,10. Para 25% de aumento, multiplique por 1,25.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Exemplos práticos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="p-3 font-semibold rounded-tl-lg">Situação</th>
                  <th className="p-3 font-semibold">Aumento</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Valor final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;100</td>
                  <td className="p-3 text-muted-foreground">10%</td>
                  <td className="p-3 font-medium">R$&nbsp;110</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;200</td>
                  <td className="p-3 text-muted-foreground">20%</td>
                  <td className="p-3 font-medium">R$&nbsp;240</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;150</td>
                  <td className="p-3 text-muted-foreground">15%</td>
                  <td className="p-3 font-medium">R$&nbsp;172,50</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;3.000</td>
                  <td className="p-3 text-muted-foreground">8%</td>
                  <td className="p-3 font-medium">R$&nbsp;3.240</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;500</td>
                  <td className="p-3 text-muted-foreground">25%</td>
                  <td className="p-3 font-medium">R$&nbsp;625</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Aumento em preços e salários
          </h2>
          <p className="text-muted-foreground mb-3">
            O aumento percentual aparece em diversas situações do dia a dia:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <strong>Reajuste salarial:</strong> um salário de
              R$&nbsp;2.500 com reajuste de 6% passa a ser R$&nbsp;2.650.
            </li>
            <li>
              <strong>Inflação e preços:</strong> um produto que custava
              R$&nbsp;80 e sofreu inflação de 12% passa a custar R$&nbsp;89,60.
            </li>
            <li>
              <strong>Rendimento de investimento:</strong> R$&nbsp;10.000
              aplicados com rendimento de 5% ao período resultam em
              R$&nbsp;10.500.
            </li>
            <li>
              <strong>Reajuste de aluguel:</strong> um aluguel de
              R$&nbsp;1.200 reajustado em 8% passa a R$&nbsp;1.296 por mês.
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Em todos esses casos, a lógica é a mesma: a porcentagem é aplicada
            sobre o valor original para chegar ao novo valor.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Perguntas frequentes</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular aumento percentual?
              </h3>
              <p className="text-muted-foreground">
                Multiplique o valor pelo percentual de aumento e divida por
                100. Some o resultado ao valor original. Exemplo: 10% de
                aumento em R$&nbsp;500 → aumento = R$&nbsp;50 → valor final =
                R$&nbsp;550.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como saber o valor com aumento percentual?
              </h3>
              <p className="text-muted-foreground">
                Use a fórmula: valor com aumento percentual = valor × (1 + aumento/100). Para
                12% de aumento em R$&nbsp;300: 300 × 1,12 ={" "}
                <strong>R$&nbsp;336</strong>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular reajuste de preço?
              </h3>
              <p className="text-muted-foreground">
                Reajuste de preço funciona como aumento percentual. Se um
                produto custa R$&nbsp;120 e será reajustado em 7%: 120 × 1,07
                = <strong>R$&nbsp;128,40</strong>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular aumento de salário?
              </h3>
              <p className="text-muted-foreground">
                Aplique o percentual de reajuste sobre o salário atual. Salário
                de R$&nbsp;4.000 com aumento de 5%: 4.000 × 1,05 ={" "}
                <strong>R$&nbsp;4.200</strong>. O aumento em reais é
                R$&nbsp;200.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <h2 className="text-2xl font-semibold mb-2">
            Calcule aumento percentual rapidamente
          </h2>
          <p className="text-muted-foreground mb-4">
            Use nossa calculadora de porcentagem para calcular aumentos de
            forma rápida e sem erro. Suporte ao modo "aumento percentual" com
            resultado imediato.
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
