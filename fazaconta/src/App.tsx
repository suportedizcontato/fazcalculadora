import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";

// Pages — lazy loaded for route-level code splitting
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Agua = lazy(() => import("@/pages/agua"));
const Xicaras = lazy(() => import("@/pages/xicaras"));
const Rescisao = lazy(() => import("@/pages/rescisao"));
const Porcentagem = lazy(() => import("@/pages/porcentagem"));
const CalculadoraImc = lazy(() => import("@/pages/calculadora-imc"));
const ComoCalcularImc = lazy(() => import("@/pages/como-calcular-imc"));
const ComoCalcularPorcentagem = lazy(() => import("@/pages/como-calcular-porcentagem"));
const ComoCalcularDesconto = lazy(() => import("@/pages/como-calcular-desconto"));
const ComoCalcularAumentoPercentual = lazy(() => import("@/pages/como-calcular-aumento-percentual"));
const QuantoEXPorcentoDeY = lazy(() => import("@/pages/quanto-e-x-porcento-de-y"));
const PoliticaPrivacidade = lazy(() => import("@/pages/politica-privacidade"));
const Sobre = lazy(() => import("@/pages/sobre"));
const BancoDeHoras = lazy(() => import("@/pages/banco-de-horas"));
const HorasExtras = lazy(() => import("@/pages/horas-extras"));
const SimuladorDemissao = lazy(() => import("@/pages/simulador-demissao"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/imc"><Redirect to="/calculadora-imc" /></Route>
        <Route path="/consumo-agua" component={Agua} />
        <Route path="/conversor-xicaras" component={Xicaras} />
        <Route path="/calculadora-trabalhista-clt" component={Rescisao} />
        <Route path="/calculadora-porcentagem" component={Porcentagem} />
        <Route path="/calculadora-imc" component={CalculadoraImc} />
        <Route path="/como-calcular-imc" component={ComoCalcularImc} />
        <Route path="/como-calcular-porcentagem" component={ComoCalcularPorcentagem} />
        <Route path="/como-calcular-desconto" component={ComoCalcularDesconto} />
        <Route path="/como-calcular-aumento-percentual" component={ComoCalcularAumentoPercentual} />
        <Route path="/quanto-e-x-porcento-de-y" component={QuantoEXPorcentoDeY} />
        <Route path="/banco-de-horas" component={BancoDeHoras} />
        <Route path="/calculadora-horas-extras" component={HorasExtras} />
        <Route path="/simulador-demissao" component={SimuladorDemissao} />
        <Route path="/politica-de-privacidade" component={PoliticaPrivacidade} />
        <Route path="/sobre" component={Sobre} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
