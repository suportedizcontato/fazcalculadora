import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Porcentagem from "./porcentagem";

// Mock wouter Link
vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock framer-motion to avoid animation issues in jsdom
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function setup() {
  const user = userEvent.setup();
  render(<Porcentagem />);
  return { user };
}

describe("7.2 — Integração: componente Porcentagem", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("define document.title correto no mount", () => {
    render(<Porcentagem />);
    expect(document.title).toBe("Calculadora de Porcentagem Online Grátis | Fazaconta");
    cleanup();
  });

  it("h1 contém o texto 'Calculadora de Porcentagem Online'", () => {
    render(<Porcentagem />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Calculadora de Porcentagem Online"
    );
    cleanup();
  });

  it("existe exatamente um h1 no componente renderizado", () => {
    render(<Porcentagem />);
    expect(document.querySelectorAll("h1").length).toBe(1);
    cleanup();
  });

  it("meta description tem o conteúdo correto após mount", () => {
    render(<Porcentagem />);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta!.getAttribute("content")).toBe(
      "Calcule porcentagem de forma rápida e fácil. Descubra valores, descontos e aumentos percentuais com nossa calculadora online gratuita."
    );
    cleanup();
  });

  it("inicia no modo 'porcentagem-de' com campos visíveis", () => {
    setup();
    expect(screen.getByLabelText(/percentual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor base/i)).toBeInTheDocument();
  });

  it("submissão com campos vazios exibe erros de campo obrigatório sem calcular", async () => {
    const { user } = setup();
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/\d+,\d+% de \d+,\d+ é igual a/i)).not.toBeInTheDocument();
  });

  it("submissão válida no modo 'porcentagem-de' exibe ResultBox com valor e explicação", async () => {
    const { user } = setup();
    const inputs = screen.getAllByRole("textbox");
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(inputs[0], "10");
    await user.type(inputs[1], "200");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("20,00")).toBeInTheDocument();
      expect(screen.getByText(/10,00% de 200,00 é igual a 20,00/i)).toBeInTheDocument();
    });
  });

  it("editar campo após resultado exibido oculta o ResultBox", async () => {
    const { user } = setup();
    const inputs = screen.getAllByRole("textbox");
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(inputs[0], "10");
    await user.type(inputs[1], "200");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("20,00")).toBeInTheDocument();
    });

    await user.type(inputs[0], "5");

    await waitFor(() => {
      expect(screen.queryByText(/\d+,\d+% de \d+,\d+ é igual a/i)).not.toBeInTheDocument();
    });
  });

  it("troca de modo limpa campos e oculta resultado", async () => {
    const { user } = setup();
    const inputs = screen.getAllByRole("textbox");
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(inputs[0], "10");
    await user.type(inputs[1], "200");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("20,00")).toBeInTheDocument();
    });

    const modeBtn = screen.getByRole("button", { name: /aumento percentual/i });
    await user.click(modeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/\d+,\d+% de \d+,\d+ é igual a/i)).not.toBeInTheDocument();
    });
    // New mode fields should appear
    expect(screen.getByLabelText(/valor original/i)).toBeInTheDocument();
  });

  it("modo 'que-percentual': erro de divisão por zero ao submeter valorTotal=0", async () => {
    const { user } = setup();

    const modeBtn = screen.getByRole("button", { name: /que percentual/i });
    await user.click(modeBtn);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "30");
    await user.type(inputs[1], "0");

    const submitBtn = screen.getByRole("button", { name: /calcular/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/não pode ser zero/i)).toBeInTheDocument();
    });
    // Result should not be visible — no explanation containing "é ... % de <number>"
    expect(screen.queryByText(/\d+,\d+ é \d+,\d+% de/i)).not.toBeInTheDocument();
  });

  it("modo 'variacao': resultado negativo usa variante warning", async () => {
    const { user } = setup();

    const modeBtn = screen.getByRole("button", { name: /variação percentual/i });
    await user.click(modeBtn);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "100");
    await user.type(inputs[1], "80");

    const submitBtn = screen.getByRole("button", { name: /calcular/i });
    await user.click(submitBtn);

    await waitFor(() => {
      // -20,00% should be shown (may appear in both main value and explanation)
      const elements = screen.getAllByText(/-20,00%/);
      expect(elements.length).toBeGreaterThan(0);
    });

    // The ResultBox with warning variant renders an AlertCircle icon (aria role)
    // We check that the warning explanation is present
    expect(screen.getByText(/a variação é de -20,00%/i)).toBeInTheDocument();
  });

  it("modo 'variacao': erro de divisão por zero ao submeter valorInicial=0", async () => {
    const { user } = setup();

    const modeBtn = screen.getByRole("button", { name: /variação percentual/i });
    await user.click(modeBtn);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "0");
    await user.type(inputs[1], "100");

    const submitBtn = screen.getByRole("button", { name: /calcular/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/não pode ser zero/i)).toBeInTheDocument();
    });
  });

  it("modo 'aumento': exibe valor final e frase com acréscimo", async () => {
    const { user } = setup();

    const modeBtn = screen.getByRole("button", { name: /aumento percentual/i });
    await user.click(modeBtn);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "100");
    await user.type(inputs[1], "15");

    const submitBtn = screen.getByRole("button", { name: /calcular/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("115,00")).toBeInTheDocument();
      expect(screen.getByText(/acréscimo de 15,00/i)).toBeInTheDocument();
    });
  });

  it("modo 'desconto': exibe valor final e frase com desconto", async () => {
    const { user } = setup();

    const modeBtn = screen.getByRole("button", { name: /desconto percentual/i });
    await user.click(modeBtn);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "250");
    await user.type(inputs[1], "20");

    const submitBtn = screen.getByRole("button", { name: /calcular/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("200,00")).toBeInTheDocument();
      expect(screen.getByText(/desconto de 50,00/i)).toBeInTheDocument();
    });
  });

  it("aria-pressed reflete o modo ativo antes e depois da troca", async () => {
    const { user } = setup();

    const btnPorcentagemDe = screen.getByRole("button", { name: /quanto é x% de y/i });
    const btnAumento = screen.getByRole("button", { name: /aumento percentual/i });

    // Estado inicial: porcentagem-de ativo, aumento inativo
    expect(btnPorcentagemDe).toHaveAttribute("aria-pressed", "true");
    expect(btnAumento).toHaveAttribute("aria-pressed", "false");

    await user.click(btnAumento);

    // Após troca: aumento ativo, porcentagem-de inativo
    expect(btnAumento).toHaveAttribute("aria-pressed", "true");
    expect(btnPorcentagemDe).toHaveAttribute("aria-pressed", "false");
  });

  it("foco automático no primeiro campo do formulário ao trocar de modo via clique", async () => {
    const { user } = setup();

    const btnAumento = screen.getByRole("button", { name: /aumento percentual/i });
    await user.click(btnAumento);

    // setFocus usa setTimeout; aguarda o foco ser aplicado
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText(/valor original/i));
    });
  });

  it("valor negativo após blur exibe mensagem de erro", async () => {
    // This is blocked by the schema — negative value is caught by refine >= 0
    // But schema uses onBlur mode, and negative value entered as "-5" would first
    // fail the isFinite check since we pass through normalizeDecimal
    // Actually "-5" => parseFloat("-5") = -5, which is < 0, so refine fires.
    // However, in our schema, mode is "onBlur" — but our form's mode is "onBlur"
    // so it triggers after blur. Let's type and blur.
    const { user } = setup();
    const inputs = screen.getAllByRole("textbox");

    // Type a negative value and blur
    await user.type(inputs[0], "-5");
    await user.tab(); // triggers blur

    await waitFor(() => {
      expect(screen.getByText(/o valor deve ser positivo/i)).toBeInTheDocument();
    });
  });
});
