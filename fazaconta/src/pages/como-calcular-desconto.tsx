import { useEffect } from "react";
import { Link } from "wouter";
import { Tag, ArrowRight } from "lucide-react";

export default function ComoCalcularDesconto() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "Como Calcular Desconto Percentual | Fórmula e Exemplos | Fazaconta";

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
      "Aprenda como calcular desconto percentual com fórmulas e exemplos práticos. Descubra o valor final com desconto de forma simples.";

    return () => {
      document.title = prevTitle;
      metaDesc!.content = prevContent;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 mb-4">
          <Tag className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Como Calcular Desconto Percentual
        </h1>
        <p className="text-lg font-medium text-foreground mb-2">
          Para calcular desconto percentual, use a fórmula: valor final = valor − (porcentagem × valor ÷ 100).
        </p>
        <p className="text-lg font-medium text-foreground mb-3">
          Exemplo: 20% de desconto em R$&nbsp;200 resulta em R$&nbsp;160.
        </p>
        <ul className="list-disc list-inside space-y-1 text-base text-muted-foreground mb-4">
          <li>10% de desconto em R$&nbsp;100 = R$&nbsp;90</li>
          <li>20% de desconto em R$&nbsp;200 = R$&nbsp;160</li>
          <li>30% de desconto em R$&nbsp;150 = R$&nbsp;105</li>
        </ul>
        <p className="text-lg text-muted-foreground">
          Desconto percentual está presente em compras, promoções e ofertas do
          dia a dia. Entender como calcular desconto permite comparar preços,
          avaliar promoções e evitar erros na hora de pagar.
        </p>
      </div>

      <div className="space-y-10 text-base text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">
            O que é desconto percentual?
          </h2>
          <p className="text-muted-foreground">
            Desconto percentual é a redução de um valor com base em uma
            porcentagem. Quando uma loja anuncia "20% de desconto", significa
            que você pagará 20% a menos do que o preço original. O desconto é
            calculado sobre o valor cheio e subtraído para chegar ao preço
            final.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Como calcular desconto percentual?
          </h2>
          <p className="text-muted-foreground mb-3">
            Para calcular desconto percentual, subtraia a porcentagem do valor
            original usando a fórmula:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">
              valor final = valor − (porcentagem × valor ÷ 100)
            </p>
          </div>
          <p className="text-muted-foreground">
            Exemplo: produto de R$&nbsp;100 com 10% de desconto:
          </p>
          <div className="my-3 p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p>R$&nbsp;100 − (10 × 100 ÷ 100) = R$&nbsp;100 − R$&nbsp;10 = <strong>R$&nbsp;90</strong></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Fórmula do desconto</h2>
          <p className="text-muted-foreground mb-3">
            Você pode calcular em dois passos:
          </p>
          <div className="p-4 bg-muted rounded-xl space-y-3 text-sm">
            <p>
              <span className="font-semibold">Passo 1 — valor do desconto:</span>
              <br />
              desconto = (porcentagem × valor) ÷ 100
            </p>
            <p>
              <span className="font-semibold">Passo 2 — valor final:</span>
              <br />
              valor final = valor − desconto
            </p>
          </div>
          <p className="text-muted-foreground mt-3">
            Atalho: multiplique o valor por{" "}
            <strong>(1 − X/100)</strong>. Para 20% de desconto, multiplique por
            0,80. Para 15% de desconto, multiplique por 0,85.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Exemplos práticos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="p-3 font-semibold rounded-tl-lg">Situação</th>
                  <th className="p-3 font-semibold">Desconto</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Valor final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;100</td>
                  <td className="p-3 text-muted-foreground">10%</td>
                  <td className="p-3 font-medium">R$&nbsp;90</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;200</td>
                  <td className="p-3 text-muted-foreground">20%</td>
                  <td className="p-3 font-medium">R$&nbsp;160</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;150</td>
                  <td className="p-3 text-muted-foreground">30%</td>
                  <td className="p-3 font-medium">R$&nbsp;105</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;500</td>
                  <td className="p-3 text-muted-foreground">15%</td>
                  <td className="p-3 font-medium">R$&nbsp;425</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">R$&nbsp;80</td>
                  <td className="p-3 text-muted-foreground">25%</td>
                  <td className="p-3 font-medium">R$&nbsp;60</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            Desconto em compras e promoções
          </h2>
          <p className="text-muted-foreground mb-3">
            O desconto percentual é amplamente usado em lojas físicas,
            e-commerce e marketplaces. Algumas situações comuns:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <strong>Black Friday e liquidações:</strong> descontos de 20% a
              70% sobre o preço original.
            </li>
            <li>
              <strong>Cupons de desconto:</strong> o cupom aplica uma
              porcentagem sobre o total do carrinho.
            </li>
            <li>
              <strong>Desconto à vista:</strong> lojas oferecem redução
              percentual para pagamento em dinheiro ou Pix.
            </li>
            <li>
              <strong>Promoções progressivas:</strong> quanto mais itens
              comprados, maior o percentual de desconto.
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Saber calcular o desconto antes de finalizar a compra evita
            surpresas e ajuda a comparar se a promoção é realmente vantajosa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Perguntas frequentes</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold mb-1">Como calcular desconto?</h3>
              <p className="text-muted-foreground">
                Multiplique o valor pelo percentual de desconto e divida por
                100. Subtraia o resultado do valor original. Exemplo: 20% de
                desconto em R$&nbsp;250 → desconto = R$&nbsp;50 → valor final =
                R$&nbsp;200.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como saber o valor final com desconto?
              </h3>
              <p className="text-muted-foreground">
                Use a fórmula: valor final = valor × (1 − desconto/100). Para
                15% de desconto em R$&nbsp;400: 400 × 0,85 ={" "}
                <strong>R$&nbsp;340</strong>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular a porcentagem de desconto entre dois preços?
              </h3>
              <p className="text-muted-foreground">
                Subtraia o novo preço do original, divida pelo original e
                multiplique por 100. Exemplo: preço de R$&nbsp;200 caiu para
                R$&nbsp;160 → (200 − 160) ÷ 200 × 100 ={" "}
                <strong>20% de desconto</strong>.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Como calcular desconto em produtos com preço parcelado?
              </h3>
              <p className="text-muted-foreground">
                Aplique o desconto sobre o preço à vista antes de parcelar. Se
                o produto custa R$&nbsp;600 à vista com 10% de desconto, o
                valor com desconto é R$&nbsp;540 — que então pode ser
                parcelado.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
          <h2 className="text-2xl font-semibold mb-2">
            Calcule desconto rapidamente
          </h2>
          <p className="text-muted-foreground mb-4">
            Use nossa calculadora de porcentagem para calcular descontos de
            forma rápida e sem erro. Suporte ao modo "desconto percentual" com
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
                href="/calculadora-imc"
                className="text-primary hover:underline"
              >
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
          </ul>
        </section>
      </div>
    </div>
  );
}
