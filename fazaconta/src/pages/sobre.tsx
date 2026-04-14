import { Link } from "wouter";
import { Calculator, Heart, Zap, Shield } from "lucide-react";
import { PageMeta } from "@/components/page-meta";

export default function Sobre() {
  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-12">
      <PageMeta
        title="Sobre o Fazaconta Online | Calculadoras Gratuitas"
        description="Conheça o Fazaconta Online: calculadoras gratuitas para brasileiros, sem cadastro e sem anúncios intrusivos."
      />
      <div>
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl text-primary mb-4">
          <Calculator className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Sobre o Fazaconta Online</h1>
        <p className="text-lg text-muted-foreground">
          O <strong>Fazaconta Online</strong> é um conjunto de calculadoras gratuitas desenvolvido
          para facilitar cálculos do dia a dia de brasileiros — sem cadastro, sem aplicativo e sem
          complicação.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Nossa missão</h2>
        <p className="text-muted-foreground leading-relaxed">
          Acreditamos que ferramentas úteis devem ser acessíveis a todos. Por isso, todas as
          calculadoras do Fazaconta são gratuitas, funcionam diretamente no navegador (sem enviar
          dados para servidores) e foram desenvolvidas com foco em clareza e precisão.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Nossos princípios</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-foreground">Rapidez</strong>
              <p className="text-muted-foreground text-sm mt-0.5">
                Resultados imediatos, sem carregamentos desnecessários ou redirecionamentos.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-foreground">Privacidade</strong>
              <p className="text-muted-foreground text-sm mt-0.5">
                Todos os cálculos acontecem no seu dispositivo. Não coletamos nem armazenamos seus dados.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-foreground">Cuidado com o conteúdo</strong>
              <p className="text-muted-foreground text-sm mt-0.5">
                Cada calculadora é revisada para garantir fórmulas corretas e informações
                atualizadas com base em fontes como OMS e legislação brasileira vigente.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Calculadoras disponíveis</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <Link href="/calculadora-porcentagem" className="text-primary hover:underline font-medium">
              Calculadora de Porcentagem
            </Link>{" "}
            — descontos, aumentos, variações e mais
          </li>
          <li>
            <Link href="/calculadora-imc" className="text-primary hover:underline font-medium">
              Calculadora de IMC
            </Link>{" "}
            — índice de massa corporal com tabela da OMS
          </li>
          <li>
            <Link href="/consumo-agua" className="text-primary hover:underline font-medium">
              Consumo Diário de Água
            </Link>{" "}
            — recomendação personalizada por peso
          </li>
          <li>
            <Link href="/conversor-xicaras" className="text-primary hover:underline font-medium">
              Conversor de Xícaras
            </Link>{" "}
            — xícaras para ml e copos
          </li>
          <li>
            <Link href="/calculadora-trabalhista-clt" className="text-primary hover:underline font-medium">
              Calculadora Trabalhista CLT
            </Link>{" "}
            — rescisão, férias e 13º salário
          </li>
          <li>
            <Link href="/banco-de-horas" className="text-primary hover:underline font-medium">
              Banco de Horas
            </Link>{" "}
            — saldo, valor monetário e alertas de prazo
          </li>
          <li>
            <Link href="/calculadora-horas-extras" className="text-primary hover:underline font-medium">
              Calculadora de Horas Extras
            </Link>{" "}
            — HE 50%, 100%, adicional noturno e cumulativos
          </li>
          <li>
            <Link href="/simulador-demissao" className="text-primary hover:underline font-medium">
              Simulador de Demissão
            </Link>{" "}
            — comparativo dos três cenários de rescisão
          </li>
        </ul>
      </section>

      <section className="border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Encontrou algum erro ou tem sugestões? As informações deste site têm caráter educativo e
          não substituem a orientação de profissionais de saúde, nutricionistas ou advogados
          trabalhistas.
        </p>
      </section>
    </div>
  );
}
