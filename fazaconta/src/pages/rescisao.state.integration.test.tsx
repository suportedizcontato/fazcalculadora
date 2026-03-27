/**
 * Task 4.3 — Estado, reset reativo e onError com setFocus
 *
 * Testa:
 * - useState<PageResult>(null) e useState<ModuleKey>("rescisao")
 * - useEffect + watch() limpa resultado ao editar campos
 * - onSubmitRescisao, onSubmitFerias, onSubmitDecimo atualizam result
 * - onError limpa result e foca o primeiro campo inválido
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

// Radix UI uses ResizeObserver which is not in jsdom
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

// ─── Helpers (setup after render so userEvent.setup() has a valid document) ───

function setup() {
  render(<TrabalhistaPage />);
  const user = userEvent.setup();
  return { user };
}

async function fillAndSubmitRescisao(user: ReturnType<typeof userEvent.setup>) {
  const salario = screen.getByLabelText(/salário bruto/i);
  await user.clear(salario);
  await user.type(salario, "3000");
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

async function fillAndSubmitFerias(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: /férias/i }));
  const salario = screen.getByLabelText(/salário bruto/i);
  await user.clear(salario);
  await user.type(salario, "3000");
  await user.clear(screen.getByLabelText(/meses aquisitivos/i));
  await user.type(screen.getByLabelText(/meses aquisitivos/i), "6");
  await user.click(screen.getByRole("button", { name: /calcular férias/i }));
}

async function fillAndSubmitDecimo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: /13º salário/i }));
  const salario = screen.getByLabelText(/salário bruto/i);
  await user.clear(salario);
  await user.type(salario, "3000");
  await user.clear(screen.getByLabelText(/meses trabalhados/i));
  await user.type(screen.getByLabelText(/meses trabalhados/i), "6");
  await user.click(screen.getByRole("button", { name: /calcular 13º salário/i }));
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("4.3 — Estado da página: módulo ativo e resultado", () => {
  it("módulo ativo inicial é 'rescisao' (aba Rescisão CLT ativa na carga)", () => {
    setup();
    const abaRescisao = screen.getByRole("tab", { name: /rescisão clt/i });
    expect(abaRescisao).toHaveAttribute("data-state", "active");
  });

  it("resultado inicial é null — ResultBox não exibe título do resultado", () => {
    setup();
    // When result=null, ResultBox isVisible=false — the title h3 is not rendered
    expect(screen.queryByRole("heading", { name: /total estimado da rescisão/i })).not.toBeInTheDocument();
  });
});

describe("4.3 — onSubmitRescisao: atualiza result ao submeter formulário válido", () => {
  it("exibe resultado após submissão válida do módulo Rescisão", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);
    await waitFor(() => {
      expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
    }, { timeout: 10000 });
  }, 12000);

  it("resultado exibido contém valor monetário formatado em BRL", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);
    await waitFor(() => {
      expect(screen.getAllByText(/R\$\s*[\d.,]+/).length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  }, 12000);
});

describe("4.3 — onSubmitFerias: atualiza result ao submeter formulário válido", () => {
  it("exibe resultado após submissão válida do módulo Férias", async () => {
    const { user } = setup();
    await fillAndSubmitFerias(user);
    await waitFor(() => {
      // The ResultBox title heading for the Férias module
      expect(screen.getByRole("heading", { name: /total de férias/i })).toBeVisible();
    });
  });
});

describe("4.3 — onSubmitDecimo: atualiza result ao submeter formulário válido", () => {
  it("exibe resultado após submissão válida do módulo 13º", async () => {
    const { user } = setup();
    await fillAndSubmitDecimo(user);
    await waitFor(() => {
      // The ResultBox title heading for the 13º module
      expect(screen.getByRole("heading", { name: /13º salário proporcional/i })).toBeVisible();
    });
  });
});

describe("4.3 — Reset reativo: resultado limpo ao editar campos", () => {
  it("resultado desaparece ao editar campo após submissão bem-sucedida", async () => {
    const { user } = setup();
    await fillAndSubmitRescisao(user);

    await waitFor(() => {
      expect(screen.getByText(/total estimado da rescisão/i)).toBeVisible();
    }, { timeout: 10000 });

    // Edit a field — should clear result
    const salarioInput = screen.getByLabelText(/salário bruto/i);
    await user.clear(salarioInput);
    await user.type(salarioInput, "4000");

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /total estimado da rescisão/i })).not.toBeInTheDocument();
    });
  }, 15000);
});

describe("4.3 — onError: limpa resultado e foca primeiro campo inválido", () => {
  it("limpa resultado ao submeter com campo obrigatório vazio", async () => {
    const { user } = setup();

    // First get a valid result
    await fillAndSubmitRescisao(user);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /total estimado da rescisão/i })).toBeVisible();
    });

    // Clear mandatory field and resubmit
    const salarioInput = screen.getByLabelText(/salário bruto/i);
    await user.clear(salarioInput);
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /total estimado da rescisão/i })).not.toBeInTheDocument();
    });
  });

  it("foca o primeiro campo inválido ao submeter com validação falha", async () => {
    const { user } = setup();

    // Submit without filling any field
    await user.click(screen.getByRole("button", { name: /calcular rescisão/i }));

    await waitFor(() => {
      const salarioInput = screen.getByLabelText(/salário bruto/i);
      expect(document.activeElement).toBe(salarioInput);
    });
  });
});

describe("4.3 — result atualizado apenas em onSubmit (sem reatividade implícita durante digitação)", () => {
  it("digitar nos campos sem submeter não exibe resultado", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/salário bruto/i), "3000");
    await user.type(screen.getByLabelText(/anos de contrato/i), "2");

    // No submit — result should not appear
    expect(screen.queryByRole("heading", { name: /total estimado da rescisão/i })).not.toBeInTheDocument();
  });
});
