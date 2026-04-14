import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Percent, Activity, Droplets, Coffee, Briefcase, Clock, Timer, UserMinus } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
          </div>

          <p className="text-gray-600 mb-6">
            A página que você procura não existe. Veja abaixo as calculadoras disponíveis:
          </p>

          <ul className="space-y-2 mb-8">
            <li>
              <Link href="/calculadora-porcentagem" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Percent className="w-4 h-4" /> Calculadora de Porcentagem
              </Link>
            </li>
            <li>
              <Link href="/calculadora-imc" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Activity className="w-4 h-4" /> Calculadora de IMC
              </Link>
            </li>
            <li>
              <Link href="/consumo-agua" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Droplets className="w-4 h-4" /> Consumo de Água Diário
              </Link>
            </li>
            <li>
              <Link href="/conversor-xicaras" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Coffee className="w-4 h-4" /> Conversor de Xícaras
              </Link>
            </li>
            <li>
              <Link href="/calculadora-trabalhista-clt" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Briefcase className="w-4 h-4" /> Calculadora Trabalhista CLT
              </Link>
            </li>
            <li>
              <Link href="/banco-de-horas" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Clock className="w-4 h-4" /> Banco de Horas
              </Link>
            </li>
            <li>
              <Link href="/calculadora-horas-extras" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <Timer className="w-4 h-4" /> Calculadora de Horas Extras
              </Link>
            </li>
            <li>
              <Link href="/simulador-demissao" className="flex items-center gap-2 text-primary hover:underline font-medium">
                <UserMinus className="w-4 h-4" /> Simulador de Demissão
              </Link>
            </li>
          </ul>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar para a página inicial
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
