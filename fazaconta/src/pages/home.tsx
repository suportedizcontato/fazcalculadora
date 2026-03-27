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
    href: "/conversao-xicaras",
    title: "Conversor de Xícaras",
    description: "Converta xícaras de receita para mililitros e copos.",
    icon: <Coffee className="w-6 h-6 text-amber-600" />,
    color: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    href: "/rescisao-clt",
    title: "Calculadora Trabalhista CLT",
    description: "Estime rescisão, férias proporcionais e 13º salário de forma rápida e sem cadastro.",
    icon: <Briefcase className="w-6 h-6 text-indigo-500" />,
    color: "bg-indigo-50 dark:bg-indigo-900/20"
  },
  {
    href: "/porcentagem",
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
          Cálculos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">simples</span> para<br/> o seu dia a dia.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          O Fazaconta Online reúne ferramentas rápidas, gratuitas e diretas ao ponto para você não perder tempo fazendo contas de cabeça.
        </p>
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
    </div>
  );
}
