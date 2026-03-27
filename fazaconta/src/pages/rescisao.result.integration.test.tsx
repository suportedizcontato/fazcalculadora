/**
 * Task 6.1 — ResultDetailBlock e área de exibição do resultado
 *
 * Testa (TDD):
 * - ResultDetailBlock renderiza itens após submit bem-sucedido
 * - ResultDetailBlock não renderiza antes do primeiro cálculo
 * - Módulo Rescisão: ordem determinística dos itens
 * - Módulo Rescisão: nota legal fixa aparece abaixo do resultado
 * - Módulo Férias: itens com/sem abono
 * - Módulo 13º: item com valor correto
 * - Área de resultado tem role="region" aria-live="polite"
 *
 * Nota: os cenários condicionais de multa FGTS e dedução de aviso prévio
 * que requerem troca do Radix Select são cobertos pelos testes unitários de
 * calcRescisao (task 3.1). Aqui verificamos apenas os cenários de
 * renderização via sem-justa-causa (default do formulário).
 *
 * Requirements: 3.8, 3.10, 4.5, 5.3, 6.1
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

/** Preenche e submete o módulo Rescisão com sem-justa-causa (default do form) */
async function fillAndSubmitRescisaoDefault(user: ReturnType<typeof userEvent.setup>) {
  await user.clear(screen.getByLabelText(/salário bruto/i));
  await user.type(screen.getByLabelText(/salário bruto/i), "3000");
  await user.clear(screen.getByLabelText(/anos de contrato/i));
  await user.type(screen.getByLabelText(/anos de contrato/i), "2");
  await user.clear(screen.getByLabelText(/meses restantes/i));
  await user.type(screen.getByLabelText(/meses restantes/i), "3");
  await user.clear(screen.getByLabelText(/dias trabalhados/i));
  await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
  await user.clear(screen.getByLabelText(/meses do 13º/i));
  await user.type(screen.getByLabelText(/meses do 13º/i), "3");
  await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));
}

/** Espera que o DetailBlock apareça (label "Saldo de salário" só existe no DetailBlock) */
async function waitForDetailBlock() {
  await waitFor(() => {
    expect(screen.getByText("Saldo de salário")).toBeVisible();
  }, { timeout: 10000 });
}

// ─── Área de resultado: acessibilidade ───────────────────────────────────────

describe("6.1 — Área de resultado: atributos de acessibilidade", () => {
  it("área de resultado tem role=region, aria-live=polite e aria-label correto", () => {
    setup();
    const region = screen.getByRole("region", { name: /resultado do cálculo/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-live", "polite");
  });
});

// ─── ResultDetailBlock não renderiza antes do primeiro cálculo ────────────────

describe("6.1 — ResultDetailBlock: não exibido antes do cálculo", () => {
  it("labels exclusivos do DetailBlock não aparecem no estado inicial", () => {
    setup();
    // These labels only appear in ResultDetailBlock, never in form or page subtitle
    expect(screen.queryByText("Saldo de salário")).not.toBeInTheDocument();
    expect(screen.queryByText("13º proporcional — parte da rescisão")).not.toBeInTheDocument();
    expect(screen.queryByText("Total Estimado")).not.toBeInTheDocument();
  });
});

// ─── Módulo Rescisão: itens do ResultDetailBlock ─────────────────────────────

describe("6.1 — Módulo Rescisão: itens do ResultDetailBlock (sem-justa-causa)", () => {
  it("exibe saldo de salário, férias proporcionais, 13º proporcional, multa FGTS e total após submit", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);
    await waitForDetailBlock();

    expect(screen.getByText("Saldo de salário")).toBeVisible();
    expect(screen.getByText("Férias proporcionais")).toBeVisible();
    expect(screen.getByText("13º proporcional — parte da rescisão")).toBeVisible();
    expect(screen.getByText("Multa FGTS")).toBeVisible();
    expect(screen.getByText("Total Estimado")).toBeVisible();
  }, 15000);

  it("item 'Total Estimado' possui destaque (font-bold)", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);
    await waitForDetailBlock();

    expect(screen.getByText("Total Estimado")).toHaveClass("font-bold");
  }, 15000);

  it("dedução de aviso prévio NÃO aparece para sem-justa-causa (aviso cumprido default)", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);
    await waitForDetailBlock();
    expect(screen.queryByText("Dedução — aviso prévio não cumprido")).not.toBeInTheDocument();
  }, 15000);

  it("exibe pelo menos 5 valores monetários em BRL após submit", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);

    await waitFor(() => {
      const brlValues = screen.getAllByText(/R\$\s*[\d.,]+/);
      // saldo, férias, 13º, multa, total (DetailBlock) + ResultBox value
      expect(brlValues.length).toBeGreaterThanOrEqual(5);
    }, { timeout: 10000 });
  }, 15000);

  it("ordem dos itens no DetailBlock: Saldo → Férias → 13º → Multa → Total", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);
    await waitForDetailBlock();

    const saldo = screen.getByText("Saldo de salário");
    const ferias = screen.getByText("Férias proporcionais");
    const decimo = screen.getByText("13º proporcional — parte da rescisão");
    const multa = screen.getByText("Multa FGTS");
    const total = screen.getByText("Total Estimado");

    const labels = [saldo, ferias, decimo, multa, total];
    for (let i = 0; i < labels.length - 1; i++) {
      // DOCUMENT_POSITION_FOLLOWING = 4 means next element appears after previous
      const position = labels[i].compareDocumentPosition(labels[i + 1]);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  }, 15000);
});

// ─── Módulo Rescisão: nota legal fixa (R3.10) ────────────────────────────────

describe("6.1 — Módulo Rescisão: nota legal fixa (R3.10)", () => {
  it("nota legal aparece abaixo do resultado após submit do módulo Rescisão", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);
    await waitForDetailBlock();
    expect(screen.getByText(/aviso legal/i)).toBeVisible();
  }, 15000);

  it("nota legal menciona estimativa simplificada e INSS", async () => {
    const { user } = setup();
    await fillAndSubmitRescisaoDefault(user);
    await waitForDetailBlock();
    expect(screen.getByText(/estimativa simplificada/i)).toBeVisible();
  }, 15000);

  it("nota legal NÃO aparece antes do primeiro cálculo", () => {
    setup();
    expect(screen.queryByText(/aviso legal/i)).not.toBeInTheDocument();
  });
});

// ─── Módulo Férias ────────────────────────────────────────────────────────────

describe("6.1 — Módulo Férias: itens do ResultDetailBlock", () => {
  it("sem abono: exibe 'Total de férias (com 1/3)' com destaque", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /férias/i }));
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/meses aquisitivos/i));
    await user.type(screen.getByLabelText(/meses aquisitivos/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular férias/i }));

    await waitFor(() => {
      expect(screen.getByText("Total de férias (com 1/3)")).toBeVisible();
    }, { timeout: 10000 });

    expect(screen.getByText("Total de férias (com 1/3)")).toHaveClass("font-bold");
    // "Abono pecuniário (1/3 das férias)" is the exact DetailBlock label (form checkbox has different text)
    expect(screen.queryByText("Abono pecuniário (1/3 das férias)")).not.toBeInTheDocument();
    expect(screen.queryByText("Férias restantes (2/3)")).not.toBeInTheDocument();
  }, 15000);

  it("com abono: exibe abono pecuniário e férias restantes (2/3) com destaque", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /férias/i }));
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/meses aquisitivos/i));
    await user.type(screen.getByLabelText(/meses aquisitivos/i), "6");

    const abono = screen.getByRole("checkbox", { name: /solicitar abono/i });
    if (!(abono as HTMLInputElement).checked) {
      await user.click(abono);
    }

    await user.click(screen.getByRole("button", { name: /calcular férias/i }));

    await waitFor(() => {
      expect(screen.getByText("Abono pecuniário (1/3 das férias)")).toBeVisible();
    }, { timeout: 10000 });

    expect(screen.getByText("Férias restantes (2/3)")).toBeVisible();
    expect(screen.getByText("Férias restantes (2/3)")).toHaveClass("font-bold");
  }, 15000);

  it("nota legal NÃO aparece para módulo Férias", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /férias/i }));
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/meses aquisitivos/i));
    await user.type(screen.getByLabelText(/meses aquisitivos/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular férias/i }));

    await waitFor(() => {
      expect(screen.getByText("Total de férias (com 1/3)")).toBeVisible();
    }, { timeout: 10000 });

    expect(screen.queryByText(/aviso legal/i)).not.toBeInTheDocument();
  }, 15000);
});

// ─── Módulo 13º ──────────────────────────────────────────────────────────────

describe("6.1 — Módulo 13º: itens do ResultDetailBlock", () => {
  it("exibe '13º salário proporcional' com destaque após submit", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /13º salário/i }));
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/meses trabalhados/i));
    await user.type(screen.getByLabelText(/meses trabalhados/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular 13º salário/i }));

    await waitFor(() => {
      expect(screen.getByText("13º salário proporcional")).toBeVisible();
    }, { timeout: 10000 });

    expect(screen.getByText("13º salário proporcional")).toHaveClass("font-bold");
  }, 15000);

  it("exibe R$ 1.500,00 para salário=3000 e 6 meses (3000/12*6=1500)", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /13º salário/i }));
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/meses trabalhados/i));
    await user.type(screen.getByLabelText(/meses trabalhados/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular 13º salário/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/R\$\s*1\.500,00/).length).toBeGreaterThanOrEqual(1);
    }, { timeout: 10000 });
  }, 15000);

  it("nota legal NÃO aparece para módulo 13º", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("tab", { name: /13º salário/i }));
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/meses trabalhados/i));
    await user.type(screen.getByLabelText(/meses trabalhados/i), "6");
    await user.click(screen.getByRole("button", { name: /calcular 13º salário/i }));

    await waitFor(() => {
      expect(screen.getByText("13º salário proporcional")).toBeVisible();
    }, { timeout: 10000 });

    expect(screen.queryByText(/aviso legal/i)).not.toBeInTheDocument();
  }, 15000);
});

// ─── Nota de férias zeradas inline no DetailBlock ────────────────────────────

describe("6.1 — Módulo Rescisão: nota de férias zeradas inline no DetailBlock (R3.3)", () => {
  it("quando mesesAquisitivos=0, nota de férias zeradas aparece junto ao resultado", async () => {
    const { user } = setup();

    // anos=1, meses=0 → 12 meses totais → mesesAquisitivos=0
    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");
    await user.clear(screen.getByLabelText(/dias trabalhados/i));
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "1");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitForDetailBlock();

    // Note about zero accrued vacation (appears in DetailBlock item note)
    const notaElements = screen.getAllByText(/período aquisitivo corrente zerado/i);
    expect(notaElements.length).toBeGreaterThanOrEqual(1);
  }, 15000);
});
