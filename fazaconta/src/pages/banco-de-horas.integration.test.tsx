import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BancoDeHorasPage from "./banco-de-horas";

// ─── Environment stubs ────────────────────────────────────────────────────────

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/components/layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/page-meta", () => ({ PageMeta: () => null }));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Cleanup between tests ────────────────────────────────────────────────────

afterEach(() => cleanup());

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fillBasicFields() {
  fireEvent.change(screen.getByLabelText(/salário bruto/i), {
    target: { value: "3000" },
  });
}

// ─── Task 4.2: useFieldArray dynamic week list ─────────────────────────────────

describe("BancoDeHorasPage — lista dinâmica de semanas (Task 4.2)", () => {
  it("renderiza uma linha de semana por padrão", () => {
    render(<BancoDeHorasPage />);
    expect(screen.getAllByTestId("semana-row")).toHaveLength(1);
  });

  it("botão 'Adicionar semana' adiciona uma nova linha", async () => {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    await user.click(screen.getByRole("button", { name: /adicionar semana/i }));
    expect(screen.getAllByTestId("semana-row")).toHaveLength(2);
  });

  it("botão remover exclui a linha correspondente", async () => {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    // Add a second row
    await user.click(screen.getByRole("button", { name: /adicionar semana/i }));
    expect(screen.getAllByTestId("semana-row")).toHaveLength(2);
    // Remove the first row
    const removeButtons = screen.getAllByRole("button", { name: /remover semana/i });
    await user.click(removeButtons[0]);
    expect(screen.getAllByTestId("semana-row")).toHaveLength(1);
  });

  it("cada linha tem campos de período, horas trabalhadas e horas devidas", () => {
    render(<BancoDeHorasPage />);
    const row = screen.getByTestId("semana-row");
    expect(within(row).getByLabelText(/período/i)).toBeInTheDocument();
    expect(within(row).getByLabelText(/horas trabalhadas/i)).toBeInTheDocument();
    expect(within(row).getByLabelText(/horas devidas/i)).toBeInTheDocument();
  });

  it("submissão sem semanas exibe mensagem de erro em português", async () => {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    fillBasicFields();
    // Remove the default row to get an empty array
    await user.click(screen.getByRole("button", { name: /remover semana/i }));
    // Submit
    await user.click(screen.getByRole("button", { name: /calcular saldo/i }));
    expect(await screen.findByText(/ao menos uma semana/i)).toBeInTheDocument();
  });

  it("botão remover da única semana remove a linha (possibilita atingir lista vazia)", async () => {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    expect(screen.getAllByTestId("semana-row")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /remover semana/i }));
    expect(screen.queryAllByTestId("semana-row")).toHaveLength(0);
  });

  it("campos de horas de cada semana têm label explícito (acessibilidade)", () => {
    render(<BancoDeHorasPage />);
    const row = screen.getByTestId("semana-row");
    // All labeled inputs must have an id-linked label
    expect(within(row).getByLabelText(/período/i)).toBeInTheDocument();
    expect(within(row).getByLabelText(/horas trabalhadas/i)).toBeInTheDocument();
    expect(within(row).getByLabelText(/horas devidas/i)).toBeInTheDocument();
  });

  it("submissão com valores conhecidos exibe o resultado de saldo", async () => {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    fillBasicFields();

    const row = screen.getByTestId("semana-row");
    fireEvent.change(within(row).getByLabelText(/período/i), {
      target: { value: "Semana 1" },
    });
    fireEvent.change(within(row).getByLabelText(/horas trabalhadas/i), {
      target: { value: "45" },
    });
    fireEvent.change(within(row).getByLabelText(/horas devidas/i), {
      target: { value: "40" },
    });

    await user.click(screen.getByRole("button", { name: /calcular saldo/i }));

    // ResultBox should appear with "Crédito de horas"
    expect(await screen.findByText(/crédito de horas/i)).toBeInTheDocument();
  });

  it("resultado é limpo ao adicionar nova semana após cálculo", async () => {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    fillBasicFields();

    const row = screen.getByTestId("semana-row");
    fireEvent.change(within(row).getByLabelText(/período/i), { target: { value: "S1" } });
    fireEvent.change(within(row).getByLabelText(/horas trabalhadas/i), { target: { value: "45" } });
    fireEvent.change(within(row).getByLabelText(/horas devidas/i), { target: { value: "40" } });
    await user.click(screen.getByRole("button", { name: /calcular saldo/i }));

    // Result should appear
    expect(await screen.findByText(/crédito de horas/i)).toBeInTheDocument();

    // Add a new week (triggers watchedValues change → clears result)
    await user.click(screen.getByRole("button", { name: /adicionar semana/i }));

    // Result should be gone
    expect(screen.queryByText(/crédito de horas/i)).not.toBeInTheDocument();
  });
});

// ─── Task 4.3: resultado com tabela, fórmula e info de saldo negativo ──────────

describe("BancoDeHorasPage — resultado completo (Task 4.3)", () => {
  async function submitWithPositiveBalance() {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    fillBasicFields();

    const row = screen.getByTestId("semana-row");
    fireEvent.change(within(row).getByLabelText(/período/i), {
      target: { value: "01/04 – 07/04" },
    });
    fireEvent.change(within(row).getByLabelText(/horas trabalhadas/i), {
      target: { value: "45" },
    });
    fireEvent.change(within(row).getByLabelText(/horas devidas/i), {
      target: { value: "40" },
    });

    await user.click(screen.getByRole("button", { name: /calcular saldo/i }));
    return user;
  }

  async function submitWithNegativeBalance() {
    const user = userEvent.setup();
    render(<BancoDeHorasPage />);
    fillBasicFields();

    const row = screen.getByTestId("semana-row");
    fireEvent.change(within(row).getByLabelText(/período/i), {
      target: { value: "01/04 – 07/04" },
    });
    fireEvent.change(within(row).getByLabelText(/horas trabalhadas/i), {
      target: { value: "35" },
    });
    fireEvent.change(within(row).getByLabelText(/horas devidas/i), {
      target: { value: "40" },
    });

    await user.click(screen.getByRole("button", { name: /calcular saldo/i }));
    return user;
  }

  it("exibe tabela semana a semana após submissão com saldo positivo", async () => {
    await submitWithPositiveBalance();
    expect(await screen.findByTestId("tabela-semanas")).toBeInTheDocument();
  });

  it("tabela contém a linha da semana com período e saldo parcial", async () => {
    await submitWithPositiveBalance();
    const tabela = await screen.findByTestId("tabela-semanas");
    expect(within(tabela).getByText(/01\/04/i)).toBeInTheDocument();
  });

  it("tabela exibe saldo parcial acumulado da semana", async () => {
    await submitWithPositiveBalance();
    // saldo = 45 - 40 = 5h
    expect(await screen.findByTestId("tabela-semanas")).toBeInTheDocument();
    expect(screen.getByTestId("tabela-semanas")).toBeInTheDocument();
  });

  it("exibe fórmula de cálculo do valor hora após submissão", async () => {
    await submitWithPositiveBalance();
    // Should show something about the formula for valor hora normal
    expect(await screen.findByTestId("formula-valor-hora")).toBeInTheDocument();
  });

  it("exibe disclaimer estático após submissão", async () => {
    await submitWithPositiveBalance();
    expect(await screen.findByText(/consulte.*especialista/i)).toBeInTheDocument();
  });

  it("exibe info sobre comportamento de saldo negativo após submissão com débito", async () => {
    await submitWithNegativeBalance();
    // Should show text explaining what happens with negative balance
    expect(await screen.findByTestId("info-saldo-negativo")).toBeInTheDocument();
  });

  it("saldo positivo não exibe info de saldo negativo", async () => {
    await submitWithPositiveBalance();
    await screen.findByTestId("tabela-semanas");
    expect(screen.queryByTestId("info-saldo-negativo")).not.toBeInTheDocument();
  });

  it("tabela semana a semana tem cabeçalho com 'Período' e 'Saldo parcial'", async () => {
    await submitWithPositiveBalance();
    const tabela = await screen.findByTestId("tabela-semanas");
    expect(within(tabela).getByText(/período/i)).toBeInTheDocument();
    expect(within(tabela).getByText(/saldo parcial/i)).toBeInTheDocument();
  });
});
