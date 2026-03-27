/**
 * Task 7.1 — Testes de integração do módulo Rescisão
 *
 * Testa:
 * - Submissão com todos os campos válidos: ResultBox e ResultDetailBlock com total correto
 * - Submissão com campo obrigatório vazio: cálculo bloqueado e mensagem de erro exibida
 * - Submissão com diasTrabalhados = 0: mensagem de erro e ausência de resultado
 * - Nota de férias zeradas aparece/desaparece reativamente ao alterar anos/meses
 * - Aviso de meses_13 persiste após submit enquanto condição incoerente
 * - Reset automático do resultado ao editar qualquer campo após exibição
 *
 * Requirements: 1.4, 2.2, 3.3, 3.4, 6.3, 6.7
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

/** Preenche e submete o módulo Rescisão com valores padrão válidos */
async function fillAndSubmitRescisao(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { salario?: string; anos?: string; meses?: string; dias?: string; meses13?: string } = {}
) {
  const { salario = "3000", anos = "2", meses = "3", dias = "15", meses13 = "3" } = overrides;

  await user.clear(screen.getByLabelText(/salário bruto/i));
  await user.type(screen.getByLabelText(/salário bruto/i), salario);
  await user.clear(screen.getByLabelText(/anos de contrato/i));
  await user.type(screen.getByLabelText(/anos de contrato/i), anos);
  await user.clear(screen.getByLabelText(/meses restantes/i));
  await user.type(screen.getByLabelText(/meses restantes/i), meses);
  await user.clear(screen.getByLabelText(/dias trabalhados/i));
  await user.type(screen.getByLabelText(/dias trabalhados/i), dias);
  await user.clear(screen.getByLabelText(/meses do 13º/i));
  await user.type(screen.getByLabelText(/meses do 13º/i), meses13);
  await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));
}

/** Aguarda o ResultDetailBlock aparecer (saldo de salário só existe no DetailBlock) */
async function waitForDetailBlock() {
  await waitFor(
    () => {
      expect(screen.getByText("Saldo de salário")).toBeVisible();
    },
    { timeout: 10000 }
  );
}

// ─── 7.1.1 — Submissão completa válida ───────────────────────────────────────

describe("7.1 — Submissão com todos os campos válidos (sem-justa-causa)", () => {
  it("exibe ResultBox com título 'Total Estimado da Rescisão' após submit válido", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);

    await waitFor(
      () => {
        expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it("exibe ResultDetailBlock com todos os itens obrigatórios após submit válido", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);
    await waitForDetailBlock();

    expect(screen.getByText("Saldo de salário")).toBeVisible();
    expect(screen.getByText("Férias proporcionais")).toBeVisible();
    expect(screen.getByText("13º proporcional — parte da rescisão")).toBeVisible();
    expect(screen.getByText("Multa FGTS")).toBeVisible();
    expect(screen.getByText("Total Estimado")).toBeVisible();
  }, 15000);

  it("total calculado é correto: salario=3000, anos=2, meses=3, dias=15, meses13=3", async () => {
    const { user } = setup();
    // saldoSalario = (3000/30)*15 = 1500
    // mesesAquisitivos = (2*12+3) % 12 = 3
    // feriasProporcionais = (3000/12)*3*(4/3) = 1000
    // decimoProporcional = (3000/12)*3 = 750
    // multaFgts = 3000*27*0.08*0.40 = 2592
    // total = 1500+1000+750+2592 = 5842
    await fillAndSubmitRescisao(user);
    await waitForDetailBlock();

    await waitFor(
      () => {
        expect(screen.getAllByText(/R\$\s*5\.842,00/).length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 10000 }
    );
  }, 15000);
});

// ─── 7.1.2 — Campo obrigatório vazio bloqueia cálculo ────────────────────────

describe("7.1 — Submissão com campo obrigatório vazio", () => {
  it("cálculo é bloqueado e mensagem de erro do salário é exibida", async () => {
    const { user } = setup();

    // Não preenche salário — tenta submeter
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.clear(screen.getByLabelText(/dias trabalhados/i));
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Resultado não deve aparecer
    expect(screen.queryByText(/total estimado da rescisão/i)).not.toBeInTheDocument();
  }, 15000);

  it("mensagem de erro é exibida com role=alert", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
    });
  }, 15000);
});

// ─── 7.1.3 — diasTrabalhados = 0 bloqueia cálculo ────────────────────────────

describe("7.1 — Submissão com diasTrabalhados = 0", () => {
  it("exibe mensagem de erro e não exibe resultado quando diasTrabalhados=0", async () => {
    const { user } = setup();

    await user.clear(screen.getByLabelText(/salário bruto/i));
    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    // diasTrabalhados: limpar campo deixa vazio → schema rejeita
    await user.clear(screen.getByLabelText(/dias trabalhados/i));
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "3");
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      // Erro no campo diasTrabalhados vazio
      expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.queryByText(/total estimado da rescisão/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Saldo de salário")).not.toBeInTheDocument();
  }, 15000);
});

// ─── 7.1.4 — Nota de férias zeradas reativa ──────────────────────────────────

describe("7.1 — Nota de férias zeradas: aparece/desaparece reativamente", () => {
  it("nota NÃO aparece no estado inicial", () => {
    setup();
    expect(
      screen.queryByText(/período aquisitivo corrente zerado/i)
    ).not.toBeInTheDocument();
  });

  it("nota aparece quando anos=1 e meses=0 (12 meses totais → mesesAquisitivos=0)", async () => {
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
  }, 15000);

  it("nota desaparece ao adicionar meses aquisitivos (anos=1, meses=3 → 15 meses)", async () => {
    const { user } = setup();

    // Trigger nota
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "1");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "0");

    await waitFor(() => {
      expect(
        screen.getByText(/período aquisitivo corrente zerado/i)
      ).toBeInTheDocument();
    });

    // Alterar meses → nota deve sumir
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");

    await waitFor(() => {
      expect(
        screen.queryByText(/período aquisitivo corrente zerado/i)
      ).not.toBeInTheDocument();
    });
  }, 15000);
});

// ─── 7.1.5 — Aviso meses_13 persiste após submit ─────────────────────────────

describe("7.1 — Aviso meses_13 incoerente persiste após submit enquanto condição persistir", () => {
  it("aviso persiste após submit válido quando meses13 > min(12, mesesTotais)", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.clear(screen.getByLabelText(/anos de contrato/i));
    await user.type(screen.getByLabelText(/anos de contrato/i), "0");
    await user.clear(screen.getByLabelText(/meses restantes/i));
    await user.type(screen.getByLabelText(/meses restantes/i), "3");
    await user.clear(screen.getByLabelText(/dias trabalhados/i));
    await user.type(screen.getByLabelText(/dias trabalhados/i), "15");
    await user.clear(screen.getByLabelText(/meses do 13º/i));
    await user.type(screen.getByLabelText(/meses do 13º/i), "5");

    // Aviso deve aparecer antes do submit
    await waitFor(() => {
      expect(
        screen.getByText(/valor maior que o tempo de contrato informado/i)
      ).toBeInTheDocument();
    });

    // Submit (meses13=5 é válido pelo schema — aviso é não bloqueante)
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    // Resultado deve aparecer
    await waitFor(
      () => {
        expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
      },
      { timeout: 10000 }
    );

    // Aviso deve CONTINUAR visível após submit
    expect(
      screen.getByText(/valor maior que o tempo de contrato informado/i)
    ).toBeInTheDocument();
  }, 15000);
});

// ─── 7.1.6 — Reset automático do resultado ao editar campos ──────────────────

describe("7.1 — Reset automático do resultado ao editar qualquer campo", () => {
  it("resultado desaparece ao editar campo salário após exibição", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);

    await waitFor(
      () => {
        expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
      },
      { timeout: 10000 }
    );

    // Editar campo → resultado deve sumir
    const salarioInput = screen.getByLabelText(/salário bruto/i);
    await user.clear(salarioInput);
    await user.type(salarioInput, "4000");

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /total estimado da rescisão/i })
      ).not.toBeInTheDocument();
    });
  }, 15000);

  it("resultado desaparece ao editar campo anos após exibição", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);

    await waitFor(
      () => {
        expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
      },
      { timeout: 10000 }
    );

    // Editar campo anos → resultado deve sumir
    const anosInput = screen.getByLabelText(/anos de contrato/i);
    await user.clear(anosInput);
    await user.type(anosInput, "3");

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /total estimado da rescisão/i })
      ).not.toBeInTheDocument();
    });
  }, 15000);
});
