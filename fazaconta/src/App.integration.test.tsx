import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Router as WouterRouter, Switch, Route } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import userEvent from "@testing-library/user-event";
import { Layout } from "@/components/layout";
import PoliticaPrivacidade from "@/pages/politica-privacidade";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

afterEach(() => {
  cleanup();
});

function renderApp(initialPath: string) {
  const { hook, navigate } = memoryLocation({ path: initialPath });
  render(
    <WouterRouter hook={hook}>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/politica-de-privacidade" component={PoliticaPrivacidade} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </WouterRouter>
  );
  return { navigate };
}

describe("Rota /politica-de-privacidade", () => {
  it("renderiza PoliticaPrivacidade quando a rota /politica-de-privacidade está registrada", () => {
    const { hook } = memoryLocation({ path: "/politica-de-privacidade", static: true });
    render(
      <WouterRouter hook={hook}>
        <Layout>
          <Switch>
            <Route path="/politica-de-privacidade" component={PoliticaPrivacidade} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </WouterRouter>
    );
    expect(screen.getByRole("heading", { level: 1, name: /política de privacidade/i })).toBeDefined();
  });

  it("cai no NotFound quando /politica-de-privacidade não está registrada", () => {
    const { hook } = memoryLocation({ path: "/politica-de-privacidade", static: true });
    render(
      <WouterRouter hook={hook}>
        <Layout>
          <Switch>
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </WouterRouter>
    );
    expect(screen.queryByRole("heading", { level: 1, name: /política de privacidade/i })).toBeNull();
  });
});

describe("Navegação SPA — link do rodapé e botão Voltar", () => {
  it("clicar no link 'Política de Privacidade' no rodapé exibe a página sem recarregamento", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const footerLink = screen.getByRole("link", { name: /política de privacidade/i });
    await user.click(footerLink);
    expect(screen.getByRole("heading", { level: 1, name: /política de privacidade/i })).toBeDefined();
  });

  it("botão 'Voltar' na página de política retorna para a home", async () => {
    const user = userEvent.setup();
    renderApp("/politica-de-privacidade");
    const backBtn = screen.getByRole("link", { name: /voltar/i });
    await user.click(backBtn);
    expect(screen.queryByRole("heading", { level: 1, name: /política de privacidade/i })).toBeNull();
  });
});
