import { Link } from "wouter";
import {
  Activity,
  Droplets,
  Coffee,
  Briefcase,
  Percent,
  ArrowRight
} from "lucide-react";
import { useEffect } from "react";

const CALCULATORS = [
  {
    href: "/imc",
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
    href: "/calculadora-porcentagem",
    title: "Calculadora de Porcentagem",
    description: "Calcule porcentagens, aumentos, descontos e variações de forma rápida.",
    icon: <Percent className="w-6 h-6 text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-900/20"
  }
];

export default function Home() {
  useEffect(() => {
    document.title = "Fazaconta Online - Calculadoras simples para o dia a dia";
  }, []);

  return (
    <div className="flex flex-col gap-10 sm:gap-16 pb-12">
      <section className="text-center max-w-2xl mx-auto mt-4 sm:mt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-foreground mb-4 sm:mb-6 tracking-tight">
          Calculadoras Online Gratuitas
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Use nossas calculadoras online gratuitas para resolver cálculos do dia a dia de forma rápida e prática. Aqui você encontra ferramentas como calculadora de porcentagem, IMC, consumo de água e muito mais.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      </div>

      <section>
        <h2 className="text-xl font-display font-bold text-foreground mb-3">
          Principais tipos de cálculos disponíveis
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          No Fazaconta, você encontra diversas calculadoras online para facilitar sua rotina. É possível calcular porcentagens, descobrir o IMC, estimar consumo de água e realizar conversões de medidas de forma simples e rápida.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Nossas ferramentas são ideais para quem precisa fazer cálculos do dia a dia sem complicação, com resultados imediatos e interface fácil de usar.
        </p>
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-xl font-display font-bold text-foreground mb-3">
          Todas as calculadoras
        </h2>
        <ul className="flex flex-col gap-2">
          <li>
            <Link href="/calculadora-porcentagem" className="text-primary hover:underline">
              Calculadora de Porcentagem
            </Link>
          </li>
          <li>
            <Link href="/calculadora-imc" className="text-primary hover:underline">
              Calculadora de IMC
            </Link>
          </li>
          <li>
            <Link href="/consumo-agua" className="text-primary hover:underline">
              Calculadora de Consumo de Água
            </Link>
          </li>
          <li>
            <Link href="/conversor-xicaras" className="text-primary hover:underline">
              Conversor de Xícaras
            </Link>
          </li>
        </ul>
      </section>

      <section className="bg-muted/50 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-display font-bold text-foreground mb-3">
          Como usar nossas calculadoras
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nossas ferramentas foram desenvolvidas para facilitar cálculos do dia a dia, como porcentagens, índice de massa corporal e consumo de água. Basta escolher a calculadora desejada e inserir os valores para obter o resultado rapidamente.
        </p>
      </section>
    </div>
  );
}
