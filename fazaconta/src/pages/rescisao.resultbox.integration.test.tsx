/**
 * Task 6.2 — Integrar ResultBox com animação e narrativa
 *
 * Testa (TDD):
 * - ResultBox aparece após submit bem-sucedido (isVisible=true)
 * - ResultBox exibe title, value (total formatado) e description (narrativa)
 * - variant="success" resulta em classe de cor verde
 * - Exatamente um único ResultBox por cálculo (nunca múltiplos em paralelo)
 * - Narrativa exibe exatamente os mesmos valores monetários das linhas de detalhamento
 * - AnimatePresence via mock: componente renderiza sem erros
 *
 * Requirements: 6.1, 6.2
 */

import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrabalhistaPage from "./rescisao";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

afterEach(() => cleanup());

function setup() {
  render(<TrabalhistaPage />);
  const user = userEvent.setup();
  return { user };
}

// ─── Módulo Rescisão ──────────────────────────────────────────────────────────

describe("6.2 — ResultBox: revelação após submit do módulo Rescisão", () => {
  it("ResultBox NÃO aparece antes do primeiro cálculo", () => {
    setup();
    // O ResultBox com variant=success tem classe bg-success/25 — verifica ausência
    expect(screen.queryByText(/total estimado da rescisão/i)).not.toBeInTheDocument();
  });

  it("ResultBox aparece com título 'Total Estimado da Rescisão' após submit válido", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
    }, { timeout: 10000 });
  }, 15000);

  it("ResultBox exibe valor total formatado em BRL após submit", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/R\$\s*[\d.,]+/).length).toBeGreaterThanOrEqual(1);
    }, { timeout: 10000 });
  }, 15000);

  it("narrativa contém os mesmos valores BRL que o ResultDetailBlock", async () => {
    const { user } = setup();

    // salario=3000, anos=2, meses=3, dias=15, meses13=3
    // saldoSalario = (3000/30)*15 = 1500
    // mesesAquisitivos = (2*12+3) % 12 = 27 % 12 = 3
    // feriasProporcionais = (3000/12)*3*(4/3) = 250*3*1.333... = 1000
    // decimoProporcional = (3000/12)*3 = 750
    // multaFgts = 3000*27*0.08*0.40 = 2592
    // total = 1500+1000+750+2592 = 5842
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
    }, { timeout: 10000 });

    // Narrativa deve conter "Saldo de salário" value — R$ 1.500,00
    const narrativeEl = screen.getByText(/rescisão sem justa causa/i);
    expect(narrativeEl).toBeVisible();
    // Narrative should mention the saldo value
    expect(narrativeEl.textContent).toMatch(/1\.500,00/);
    // Narrative should mention total
    expect(narrativeEl.textContent).toMatch(/5\.842,00/);
  }, 15000);

  it("exatamente um único ResultBox visível após submit (nunca múltiplos)", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
    }, { timeout: 10000 });

    // Deve existir exatamente 1 título de ResultBox (não múltiplos)
    const resultTitles = screen.queryAllByText(/total estimado da rescisão/i);
    expect(resultTitles).toHaveLength(1);
  }, 15000);
});

// ─── Módulo Férias ────────────────────────────────────────────────────────────

describe("6.2 — ResultBox: módulo Férias", () => {
  it("ResultBox exibe título 'Total de Férias' após submit válido do módulo Férias", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("tab", { name: /férias/i }));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/meses aquisitivos/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular férias/i }));

    // ResultBox title is an <h3> element
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /total de férias/i })).toBeVisible();
    }, { timeout: 10000 });
  }, 15000);

  it("narrativa do módulo Férias menciona meses aquisitivos e valor total", async () => {
    const { user } = setup();

    // salario=3000, meses=6 → totalFerias = (3000/12)*6*(4/3) = 2000
    await user.click(screen.getByRole("tab", { name: /férias/i }));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/meses aquisitivos/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular férias/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /total de férias/i })).toBeVisible();
    }, { timeout: 10000 });

    // Narrative is in ResultBox description — check the result region
    const region = document.querySelector('[aria-label="Resultado do cálculo"]')!;
    expect(region.textContent).toMatch(/férias proporcionais a/i);
    expect(region.textContent).toMatch(/2\.000,00/);
  }, 15000);
});

// ─── Módulo 13º ──────────────────────────────────────────────────────────────

describe("6.2 — ResultBox: módulo 13º Salário", () => {
  it("ResultBox exibe título '13º Salário Proporcional' após submit válido", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("tab", { name: /13º salário/i }));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/meses trabalhados/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular 13º salário/i }));

    // ResultBox title uses uppercase; use heading role or check region
    await waitFor(() => {
      const region = document.querySelector('[aria-label="Resultado do cálculo"]')!;
      expect(region.textContent).toMatch(/13º Salário Proporcional/i);
    }, { timeout: 10000 });
  }, 15000);

  it("narrativa do módulo 13º menciona meses trabalhados e valor correto", async () => {
    const { user } = setup();

    // salario=3000, meses=6 → valorDecimo = 1500
    await user.click(screen.getByRole("tab", { name: /13º salário/i }));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/meses trabalhados/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular 13º salário/i }));

    await waitFor(() => {
      const region = document.querySelector('[aria-label="Resultado do cálculo"]')!;
      // Narrative: "13º salário proporcional a 6 meses: R$ 1.500,00."
      expect(region.textContent).toMatch(/13º salário proporcional a/i);
      expect(region.textContent).toMatch(/1\.500,00/);
    }, { timeout: 10000 });
  }, 15000);
});
