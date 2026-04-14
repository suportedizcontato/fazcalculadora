import { Link } from "wouter";
import {
  Activity,
  Droplets,
  Coffee,
  Briefcase,
  Percent,
  Clock,
  TrendingUp,
  UserMinus,
  ArrowRight
} from "lucide-react";
import { PageMeta } from "@/components/page-meta";

const CALCULATORS = [
  {
    href: "/calculadora-imc",
    title: "Calculadora de IMC",
    description: "Descubra se o seu peso está ideal para sua altura.",
    icon: <Activity className="w-6 h-6 text-primary" />,
    color: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    href: "/consumo-agua",
    title: "Consumo de Água",
    description: "Calcule a quantidade ideal de água para beber por dia.",
    icon: <Droplets className="w-6 h-6 text-cyan-500" />,
    color: "bg-cyan-50 dark:bg-cyan-900/20"
  },
  {
    href: "/conversor-xicaras",
    title: "Conversor de Xícaras",
    description: "Converta xícaras de receita para mililitros e copos.",
    icon: <Coffee className="w-6 h-6 text-amber-600" />,
    color: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    href: "/calculadora-trabalhista-clt",
    title: "Calculadora Trabalhista CLT",
    description: "Estime rescisão, férias proporcionais e 13º salário de forma rápida e sem cadastro.",
    icon: <Briefcase className="w-6 h-6 text-indigo-500" />,
    color: "bg-indigo-50 dark:bg-indigo-900/20"
  },
  {
    href: "/banco-de-horas",
    title: "Banco de Horas",
    description: "Calcule o saldo acumulado do banco de horas, o valor monetário e os alertas de prazo legal.",
    icon: <Clock className="w-6 h-6 text-violet-500" />,
    color: "bg-violet-50 dark:bg-violet-900/20"
  },
  {
    href: "/calculadora-horas-extras",
    title: "Horas Extras e Adicional Noturno",
    description: "Calcule o valor das horas extras (50% ou 100%) e do adicional noturno pela CLT.",
    icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
    color: "bg-orange-50 dark:bg-orange-900/20"
  },
  {
    href: "/simulador-demissao",
    title: "Simulador de Demissão",
    description: "Compare rescisão sem justa causa, pedido de demissão e acordo mútuo lado a lado.",
    icon: <UserMinus className="w-6 h-6 text-rose-500" />,
    color: "bg-rose-50 dark:bg-rose-900/20"
  },
  {
    href: "/calculadora-porcentagem",
    title: "Calculadora de Porcentagem",
    description: "Calcule porcentagens, aumentos, descontos e variações de forma rápida.",
    icon: <Percent className="w-6 h-6 text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-900/20"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10 sm:gap-16 pb-12">
      <PageMeta
        title="Fazaconta Online - Calculadoras simples para o dia a dia"
        description="Calculadoras online gratuitas para brasileiros: IMC, porcentagem, consumo de água, xícaras, rescisão CLT e muito mais. Sem cadastro, resultado imediato."
      />
      <section className="text-center max-w-2xl mx-auto mt-4 sm:mt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-foreground mb-4 sm:mb-6 tracking-tight">
          Calculadoras Online Gratuitas
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Use nossas calculadoras online gratuitas para calcular porcentagem, IMC, consumo de água e outros valores do dia a dia de forma rápida e prática. As ferramentas foram desenvolvidas para oferecer resultados imediatos com facilidade de uso.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">
          Calculadoras mais utilizadas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/calculadora-porcentagem"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <Percent className="w-4 h-4" />
            Calculadora de Porcentagem
          </Link>
          <Link
            href="/calculadora-imc"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Calculadora de IMC
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {CALCULATORS.map((calc, i) => (
          <Link
            key={i}
            href={calc.href}
            className="group block outline-none"
          >
            <div className="h-full bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${calc.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {calc.icon}
              </div>

              <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {calc.title}
              </h3>

              <p className="text-muted-foreground mb-6 line-clamp-2">
                {calc.description}
              </p>

              <div className="flex items-center text-sm font-semibold text-primary mt-auto">
                Calcular agora
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="ad-placeholder" />

      <section className="border-t border-border pt-8">
        <h2 className="text-xl font-display font-bold text-foreground mb-3">
          Explore nossas ferramentas
        </h2>
        <ul className="flex flex-col gap-2">
          <li>
            <Link href="/calculadora-porcentagem" className="text-primary hover:underline">
              Calcular porcentagem online
            </Link>
          </li>
          <li>
            <Link href="/calculadora-imc" className="text-primary hover:underline">
              Calcular IMC online
            </Link>
          </li>
          <li>
            <Link href="/consumo-agua" className="text-primary hover:underline">
              Calcular consumo de água
            </Link>
          </li>
          <li>
            <Link href="/conversor-xicaras" className="text-primary hover:underline">
              Converter xícaras em ml
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-display font-bold text-foreground mb-3">
          Para que servem nossas calculadoras?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Cada calculadora foi criada para resolver um tipo específico de cálculo: porcentagem para descontos e aumentos, IMC para saúde e peso, consumo de água para hidratação diária, e conversão de xícaras para receitas. Sem cadastro, sem anúncio intrusivo, direto ao resultado.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-display font-bold text-foreground mb-3">
          Ferramentas simples para cálculos rápidos
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nosso objetivo é facilitar o acesso a calculadoras online gratuitas, permitindo que você faça cálculos com rapidez, precisão e sem complicações. Escolha a ferramenta desejada e obtenha o resultado em poucos segundos.
        </p>
      </section>
    </div>
  );
}
