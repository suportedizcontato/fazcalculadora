import { useEffect } from "react";
import { Link } from "wouter";
import { Activity, ArrowRight } from "lucide-react";

export default function ComoCalcularImc() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Como Calcular IMC | Fórmula, Tabela e Exemplo Prático | Fazaconta";

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    const prevContent = metaDesc.content;
    metaDesc.content =
      "Aprenda como calcular IMC com fórmula, exemplo prático e tabela completa. Veja como interpretar o resultado e use nossa calculadora de IMC online.";

    return () => {
      document.title = prevTitle;
      metaDesc!.content = prevContent;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl text-blue-600 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
          Como Calcular IMC
        </h1>
        <p className="text-lg text-muted-foreground">
          O IMC (Índice de Massa Corporal) é um índice utilizado para relacionar peso e altura,
          ajudando a identificar em qual faixa de peso corporal uma pessoa se encontra. Entender
          como calcular IMC é simples e pode ser o primeiro passo para cuidar melhor da saúde.
        </p>
      </div>

      <div className="space-y-10 text-base text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">O que é IMC?</h2>
          <p className="text-muted-foreground">
            O Índice de Massa Corporal (IMC) é uma medida numérica criada para estimar se uma
            pessoa está dentro de um peso saudável em relação à sua altura. Ele é amplamente
            utilizado por profissionais de saúde como triagem inicial para identificar riscos
            relacionados ao peso, como desnutrição, sobrepeso e obesidade.
          </p>
          <p className="text-muted-foreground mt-3">
            O IMC foi desenvolvido pelo matemático Adolphe Quetelet no século XIX e é recomendado
            pela Organização Mundial da Saúde (OMS) como indicador de peso populacional. Embora
            seja prático, ele não considera fatores como composição corporal, massa muscular ou
            distribuição de gordura.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Como calcular IMC?</h2>
          <p className="text-muted-foreground">
            O cálculo do IMC é feito dividindo o peso (em quilogramas) pelo quadrado da altura (em
            metros). A fórmula do IMC é:
          </p>
          <div className="my-4 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg font-semibold">IMC = peso ÷ (altura × altura)</p>
            <p className="text-sm text-muted-foreground mt-1">peso em kg · altura em metros</p>
          </div>
          <p className="text-muted-foreground">
            O resultado é um número que indica a faixa de peso corporal em que a pessoa se
            encontra. Quanto mais próximo de 22, mais próximo do peso considerado ideal pela OMS.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Exemplo de cálculo do IMC</h2>
          <p className="text-muted-foreground mb-3">
            Veja como aplicar a fórmula na prática:
          </p>
          <div className="p-4 bg-muted rounded-xl space-y-1 text-sm">
            <p><strong>Peso:</strong> 70 kg</p>
            <p><strong>Altura:</strong> 1,75 m</p>
            <p><strong>Cálculo:</strong> IMC = 70 ÷ (1,75 × 1,75)</p>
            <p><strong>Resultado:</strong> IMC = 70 ÷ 3,0625 ≈ <strong>22,9</strong></p>
          </div>
          <p className="text-muted-foreground mt-3">
            Um IMC de 22,9 se enquadra na faixa de <strong>Peso normal</strong>, entre 18,5 e
            24,9. Isso significa que, segundo a tabela de IMC, essa pessoa está em uma faixa
            saudável de peso corporal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Tabela de IMC</h2>
          <p className="text-muted-foreground mb-4">
            A tabela de IMC da OMS classifica o resultado em seis faixas:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="p-3 font-semibold rounded-tl-lg">Faixa de IMC</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 text-muted-foreground">Abaixo de 18,5</td>
                  <td className="p-3 font-medium text-blue-600">Abaixo do peso</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">18,5 a 24,9</td>
                  <td className="p-3 font-medium text-green-600">Peso normal</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">25,0 a 29,9</td>
                  <td className="p-3 font-medium text-yellow-600">Sobrepeso</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">30,0 a 34,9</td>
                  <td className="p-3 font-medium text-orange-500">Obesidade grau 1</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">35,0 a 39,9</td>
                  <td className="p-3 font-medium text-orange-600">Obesidade grau 2</td>
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">40,0 ou mais</td>
                  <td className="p-3 font-medium text-red-600">Obesidade grau 3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Como interpretar o resultado do IMC?</h2>
          <p className="text-muted-foreground">
            Após calcular o IMC, compare o resultado com a tabela acima para identificar sua
            classificação. Lembre-se de que o IMC é um indicador inicial: ele oferece uma
            referência útil, mas não substitui a avaliação de um profissional de saúde.
          </p>
          <p className="text-muted-foreground mt-3">
            Fatores como idade, sexo, percentual de gordura corporal e massa muscular influenciam o
            peso saudável de cada pessoa. Atletas com grande massa muscular, por exemplo, podem ter
            IMC elevado sem apresentar excesso de gordura. Por isso, use o resultado como um ponto
            de partida para uma conversa com seu médico ou nutricionista.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Perguntas frequentes</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold mb-1">O que é IMC?</h3>
              <p className="text-muted-foreground">
                IMC significa Índice de Massa Corporal. É uma medida calculada a partir do peso e
                da altura que classifica o estado nutricional em categorias como abaixo do peso,
                peso normal, sobrepeso e obesidade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Como calcular IMC?</h3>
              <p className="text-muted-foreground">
                Divida seu peso em quilogramas pelo quadrado da sua altura em metros. Exemplo:
                70&nbsp;kg ÷ (1,75 × 1,75) = 22,9. Você também pode usar nossa{" "}
                <Link href="/calculadora-imc" className="text-primary hover:underline">
                  calculadora de IMC online
                </Link>
                {" "}para obter o resultado instantaneamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Qual é o IMC ideal?</h3>
              <p className="text-muted-foreground">
                Segundo a OMS, o IMC ideal para adultos está entre 18,5 e 24,9, classificado como
                "Peso normal". Valores fora desse intervalo indicam risco à saúde e merecem atenção
                médica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">IMC é confiável?</h3>
              <p className="text-muted-foreground">
                O IMC é uma ferramenta de triagem prática e amplamente adotada, mas não leva em
                conta o percentual de gordura, a massa muscular nem a distribuição de gordura
                corporal. Utilize-o como referência inicial e complemente com avaliação
                profissional.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">IMC serve para qualquer pessoa?</h3>
              <p className="text-muted-foreground">
                O IMC foi desenvolvido para adultos em geral. Para crianças e adolescentes, a OMS
                usa tabelas específicas por idade e sexo. Grávidas, idosos e atletas também podem
                ter interpretações diferentes, tornando ainda mais importante a avaliação
                individualizada por um profissional de saúde.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h2 className="text-2xl font-semibold mb-2">Calcule seu IMC agora</h2>
          <p className="text-muted-foreground mb-4">
            Quer descobrir seu IMC de forma rápida? Use nossa calculadora online gratuita — basta
            informar seu peso e altura para obter o resultado com a classificação completa.
          </p>
          <Link
            href="/calculadora-imc"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Usar a calculadora de IMC
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Veja também</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/calculadora-porcentagem"
                className="text-primary hover:underline"
              >
                Calculadora de Porcentagem
              </Link>
              {" "}— calcule aumentos, descontos e variações percentuais.
            </li>
            <li>
              <Link
                href="/consumo-agua"
                className="text-primary hover:underline"
              >
                Calculadora de Consumo de Água
              </Link>
              {" "}— descubra a quantidade ideal de água por dia.
            </li>
            <li>
              <Link
                href="/conversor-xicaras"
                className="text-primary hover:underline"
              >
                Conversor de Xícaras
              </Link>
              {" "}— converta medidas de receitas para ml e copos.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
