/**
 * Task 5.1 — Derived state: avisos inline reativos (módulo Rescisão)
 *
 * Testa:
 * - showNotaFeriasZeradas: aparece quando mesesTotais > 0 && mesesTotais % 12 === 0
 * - showNotaFeriasZeradas: desaparece quando a condição não é satisfeita
 * - showAvisoMeses13: aparece quando meses13 > min(12, mesesTotais)
 * - showAvisoMeses13: persiste após submit enquanto a condição incoerente persistir
 * - showAvisoMeses13: desaparece quando meses13 <= min(12, mesesTotais)
 *
 * Requirements: 3.3, 3.4
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

// ─── Nota de Férias Zeradas ───────────────────────────────────────────────────

describe("5.1 — showNotaFeriasZeradas: nota de férias zeradas reativa", () => {
  it("nota NÃO aparece no estado inicial (campos vazios)", () => {
    setup();
    expect(
      screen.queryByText(/período aquisitivo corrente zerado/i)
    ).not.toBeInTheDocument();
  });

  it("nota aparece quando mesesTotais é múltiplo de 12 (ex: anos=1, meses=0 → 12 meses)", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");

    await waitFor(() => {
      expect(
        screen.getByText(/período aquisitivo corrente zerado/i)
      ).toBeInTheDocument();
    });
  });

  it("nota aparece para 24 meses (anos=2, meses=0)", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");

    await waitFor(() => {
      expect(
        screen.getByText(/período aquisitivo corrente zerado/i)
      ).toBeInTheDocument();
    });
  });

  it("nota NÃO aparece quando há meses aquisitivos (ex: anos=1, meses=3 → 15 meses)", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");

    await waitFor(() => {
      expect(
        screen.queryByText(/período aquisitivo corrente zerado/i)
      ).not.toBeInTheDocument();
    });
  });

  it("nota desaparece ao alterar anos para criar meses aquisitivos", async () => {
    const { user } = setup();

    // Trigger nota: 12 meses
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");

    await waitFor(() => {
      expect(
        screen.getByText(/período aquisitivo corrente zerado/i)
      ).toBeInTheDocument();
    });

    // Change meses to 3 → 15 meses totais, nota should disappear
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");

    await waitFor(() => {
      expect(
        screen.queryByText(/período aquisitivo corrente zerado/i)
      ).not.toBeInTheDocument();
    });
  });

  it("nota contém o texto completo exigido pelo requisito", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");

    await waitFor(() => {
      expect(
        screen.getByText(
          /férias vencidas de ciclos anteriores não são consideradas nesta estimativa/i
        )
      ).toBeInTheDocument();
    });
  });
});

// ─── Aviso de meses13 incoerente ─────────────────────────────────────────────

describe("5.1 — showAvisoMeses13: aviso leve de meses_13 incoerente", () => {
  it("aviso NÃO aparece no estado inicial (campos vazios)", () => {
    setup();
    expect(
      screen.queryByText(/valor maior que o tempo de contrato informado/i)
    ).not.toBeInTheDocument();
  });

  it("aviso aparece quando meses13 > mesesTotais (ex: meses13=5, anos=0, meses=3 → 3 meses)", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "0");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "5");

    await waitFor(() => {
      expect(
        screen.getByText(/valor maior que o tempo de contrato informado/i)
      ).toBeInTheDocument();
    });
  });

  it("aviso NÃO aparece quando meses13 <= mesesTotais (ex: meses13=3, anos=1, meses=0 → 12 meses)", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");

    await waitFor(() => {
      expect(
        screen.queryByText(/valor maior que o tempo de contrato informado/i)
      ).not.toBeInTheDocument();
    });
  });

  it("aviso NÃO aparece quando meses13 = min(12, mesesTotais) (ex: meses13=12, anos=2, meses=0 → cap em 12)", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "12");

    await waitFor(() => {
      expect(
        screen.queryByText(/valor maior que o tempo de contrato informado/i)
      ).not.toBeInTheDocument();
    });
  });

  it("aviso persiste após submissão válida enquanto a condição incoerente persistir", async () => {
    const { user } = setup();

    // Set up incoherent state: meses13=5, but only 3 months total
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "0");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.clear(screen.getByLabelText(/dias trabalhados/i));
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "5");

    // Verify aviso appears before submit
    await waitFor(() => {
      expect(
        screen.getByText(/valor maior que o tempo de contrato informado/i)
      ).toBeInTheDocument();
    });

    // Submit (meses13=5 is valid per schema, it's non-blocking)
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    // Result should appear (submit was accepted)
    await waitFor(() => {
      expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
    }, { timeout: 10000 });

    // Aviso should STILL be visible after submit
    expect(
      screen.getByText(/valor maior que o tempo de contrato informado/i)
    ).toBeInTheDocument();
  }, 15000);

  it("aviso desaparece ao corrigir meses13 para valor coerente", async () => {
    const { user } = setup();

    // Trigger aviso
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "0");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "5");

    await waitFor(() => {
      expect(
        screen.getByText(/valor maior que o tempo de contrato informado/i)
      ).toBeInTheDocument();
    });

    // Fix meses13 to a coherent value
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");

    await waitFor(() => {
      expect(
        screen.queryByText(/valor maior que o tempo de contrato informado/i)
      ).not.toBeInTheDocument();
    });
  });

  it("aviso contém o texto fixo completo exigido pelo requisito", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "0");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "5");

    await waitFor(() => {
      expect(
        screen.getByText(/verifique se está correto/i)
      ).toBeInTheDocument();
    });
  });
});
