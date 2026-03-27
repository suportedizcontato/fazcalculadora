import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Imc from "@/pages/imc";
import Agua from "@/pages/agua";
import Xicaras from "@/pages/xicaras";
import Rescisao from "@/pages/rescisao";
import Porcentagem from "@/pages/porcentagem";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/imc" component={Imc} />
        <Route path="/consumo-agua" component={Agua} />
        <Route path="/conversor-xicaras" component={Xicaras} />
        <Route path="/calculadora-trabalhista-clt" component={Rescisao} />
        <Route path="/calculadora-porcentagem" component={Porcentagem} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
