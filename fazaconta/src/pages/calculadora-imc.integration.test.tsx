import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalculadoraImc from "./calculadora-imc";

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
  render(<CalculadoraImc />);
  return { user };
}

describe("Integração: CalculadoraImc", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 5.2 — Montagem
  it("define document.title correto no mount", () => {
    render(<CalculadoraImc />);
    expect(document.title).toBe("Calculadora de IMC Online Grátis | Fazaconta");
    cleanup();
  });

  it("meta description tem o conteúdo correto após mount", () => {
    render(<CalculadoraImc />);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta!.getAttribute("content")).toBe(
      "Calcule seu IMC de forma rápida e fácil. Descubra se você está no peso ideal com nossa calculadora online gratuita."
    );
    cleanup();
  });

  it("h1 contém o texto 'Calculadora de IMC Online'", () => {
    render(<CalculadoraImc />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Calculadora de IMC Online"
    );
    cleanup();
  });

  // 5.2 — Validação e resultado correto
  it("submissão com campos vazios exibe erros sem mostrar resultado", async () => {
    const { user } = setup();
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/seu imc é/i)).not.toBeInTheDocument();
  });

  it("submissão válida peso=70 altura=1.75 exibe 'Seu IMC é 22.9 (Peso normal)'", async () => {
    const { user } = setup();
    const pesoInput = screen.getByLabelText(/peso/i);
    const alturaInput = screen.getByLabelText(/altura/i);
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(pesoInput, "70");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/seu imc é 22\.9 \(peso normal\)/i)).toBeInTheDocument();
    });
  });

  it("alterar input após cálculo oculta o resultado", async () => {
    const { user } = setup();
    const pesoInput = screen.getByLabelText(/peso/i);
    const alturaInput = screen.getByLabelText(/altura/i);
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(pesoInput, "70");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/seu imc é/i)).toBeInTheDocument();
    });

    await user.type(pesoInput, "5");

    await waitFor(() => {
      expect(screen.queryByText(/seu imc é/i)).not.toBeInTheDocument();
    });
  });

  // 5.3 — Classificações e conteúdo SEO
  it("peso=50 altura=1.75 classifica como 'Abaixo do peso'", async () => {
    const { user } = setup();
    const pesoInput = screen.getByLabelText(/peso/i);
    const alturaInput = screen.getByLabelText(/altura/i);
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(pesoInput, "50");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      const region = screen.getByRole("region", { name: /resultado do imc/i });
      expect(region).toHaveTextContent(/abaixo do peso/i);
    });
  });

  it("peso=85 altura=1.75 classifica como 'Sobrepeso'", async () => {
    const { user } = setup();
    const pesoInput = screen.getByLabelText(/peso/i);
    const alturaInput = screen.getByLabelText(/altura/i);
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(pesoInput, "85");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      const region = screen.getByRole("region", { name: /resultado do imc/i });
      expect(region).toHaveTextContent(/sobrepeso/i);
    });
  });

  it("peso=100 altura=1.80 classifica como 'Obesidade grau I'", async () => {
    const { user } = setup();
    const pesoInput = screen.getByLabelText(/peso/i);
    const alturaInput = screen.getByLabelText(/altura/i);
    const submitBtn = screen.getByRole("button", { name: /calcular/i });

    await user.type(pesoInput, "100");
    await user.type(alturaInput, "1.80");
    await user.click(submitBtn);

    await waitFor(() => {
      const region = screen.getByRole("region", { name: /resultado do imc/i });
      expect(region).toHaveTextContent(/obesidade grau i/i);
    });
  });

  it("as quatro seções H2 de SEO estão presentes no DOM", () => {
    render(<CalculadoraImc />);
    const h2s = screen.getAllByRole("heading", { level: 2 });
    const texts = h2s.map((h) => h.textContent ?? "");

    expect(texts.some((t) => /o que é imc/i.test(t))).toBe(true);
    expect(texts.some((t) => /como calcular o imc/i.test(t))).toBe(true);
    expect(texts.some((t) => /tabela de imc/i.test(t))).toBe(true);
    expect(texts.some((t) => /perguntas frequentes/i.test(t))).toBe(true);
    cleanup();
  });
});
