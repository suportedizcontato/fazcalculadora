import { Link, useLocation } from "wouter";
import {
  Activity,
  Droplets,
  Coffee,
  Briefcase,
  Percent,
  Clock,
  TrendingUp,
  UserMinus,
  ArrowRight,
} from "lucide-react";
import type { JSX } from "react";

interface CalcEntry {
  href: string;
  title: string;
  icon: JSX.Element;
  color: string;
}

const ALL_CALCULATORS: CalcEntry[] = [
  {
    href: "/calculadora-imc",
    title: "Calculadora de IMC",
    icon: <Activity className="w-5 h-5 text-blue-500" aria-hidden="true" />,
    color: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    href: "/consumo-agua",
    title: "Consumo de Água",
    icon: <Droplets className="w-5 h-5 text-cyan-500" aria-hidden="true" />,
    color: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    href: "/conversor-xicaras",
    title: "Conversor de Xícaras",
    icon: <Coffee className="w-5 h-5 text-amber-600" aria-hidden="true" />,
    color: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    href: "/calculadora-trabalhista-clt",
    title: "Calculadora CLT",
    icon: <Briefcase className="w-5 h-5 text-indigo-500" aria-hidden="true" />,
    color: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    href: "/banco-de-horas",
    title: "Banco de Horas",
    icon: <Clock className="w-5 h-5 text-violet-500" aria-hidden="true" />,
    color: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    href: "/calculadora-horas-extras",
    title: "Horas Extras",
    icon: <TrendingUp className="w-5 h-5 text-orange-500" aria-hidden="true" />,
    color: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    href: "/simulador-demissao",
    title: "Simulador de Demissão",
    icon: <UserMinus className="w-5 h-5 text-rose-500" aria-hidden="true" />,
    color: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    href: "/calculadora-porcentagem",
    title: "Calculadora de Porcentagem",
    icon: <Percent className="w-5 h-5 text-emerald-500" aria-hidden="true" />,
    color: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

const RELATED_MAP: Record<string, string[]> = {
  "/calculadora-imc": ["/consumo-agua", "/calculadora-porcentagem", "/calculadora-trabalhista-clt"],
  "/consumo-agua": ["/calculadora-imc", "/conversor-xicaras", "/calculadora-porcentagem"],
  "/conversor-xicaras": ["/consumo-agua", "/calculadora-imc", "/calculadora-porcentagem"],
  "/calculadora-porcentagem": ["/calculadora-imc", "/calculadora-trabalhista-clt", "/banco-de-horas"],
  "/calculadora-trabalhista-clt": ["/banco-de-horas", "/calculadora-horas-extras", "/simulador-demissao"],
  "/banco-de-horas": ["/calculadora-horas-extras", "/calculadora-trabalhista-clt", "/simulador-demissao"],
  "/calculadora-horas-extras": ["/banco-de-horas", "/calculadora-trabalhista-clt", "/simulador-demissao"],
  "/simulador-demissao": ["/calculadora-trabalhista-clt", "/calculadora-horas-extras", "/banco-de-horas"],
};

export function RelatedCalculators() {
  const [location] = useLocation();
  const related = RELATED_MAP[location] ?? [];
  const entries = related
    .map((href) => ALL_CALCULATORS.find((c) => c.href === href))
    .filter((c): c is CalcEntry => c !== undefined);

  if (entries.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="text-lg font-display font-bold text-foreground mb-4">
        Veja também
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {entries.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 outline-none"
          >
            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${calc.color}`}>
              {calc.icon}
            </div>
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {calc.title}
            </span>
            <ArrowRight className="w-4 h-4 ml-auto shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
