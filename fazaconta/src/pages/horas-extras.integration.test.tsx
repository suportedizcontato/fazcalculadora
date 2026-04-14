import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HorasExtrasPage from "./horas-extras";

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

async function fillAndSubmit(overrides: Record<string, string> = {}) {
  const user = userEvent.setup();
  render(<HorasExtrasPage />);

  fireEvent.change(screen.getByLabelText(/salário bruto/i), {
    target: { value: overrides.salario ?? "3000" },
  });

  if (overrides.horasExtrasUteis !== undefined) {
    fireEvent.change(
      screen.getByLabelText(/horas extras em dias úteis/i),
      { target: { value: overrides.horasExtrasUteis } }
    );
  }
  if (overrides.horasExtrasFeriado !== undefined) {
    fireEvent.change(
      screen.getByLabelText(/horas extras em domingos\/feriados/i),
      { target: { value: overrides.horasExtrasFeriado } }
    );
  }
  if (overrides.horasNoturnas !== undefined) {
    fireEvent.change(
      screen.getByLabelText(/horas noturnas \(22h–5h\)/i),
      { target: { value: overrides.horasNoturnas } }
    );
  }
  if (overrides.horasExtrasNoturnas !== undefined) {
    fireEvent.change(
      screen.getByLabelText(/horas extras noturnas em dias úteis/i),
      { target: { value: overrides.horasExtrasNoturnas } }
    );
  }

  await user.click(screen.getByRole("button", { name: /calcular horas extras/i }));
  return user;
}

// ─── Task 5.1: campos obrigatórios e estrutura do formulário ──────────────────

describe("HorasExtrasPage — validação do formulário (Task 5.1)", () => {
  it("exibe erro quando salário está vazio e formulário é submetido", async () => {
    const user = userEvent.setup();
    render(<HorasExtrasPage />);

    await user.click(screen.getByRole("button", { name: /calcular horas extras/i }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("exibe aviso de salário abaixo do mínimo sem bloquear cálculo", async () => {
    render(<HorasExtrasPage />);

    // Type a salary below the minimum (R$ 1.518)
    fireEvent.change(screen.getByLabelText(/salário bruto/i), {
      target: { value: "1000" },
    });

    // Warning should appear without submitting
    expect(
      await screen.findByText(/abaixo do mínimo/i)
    ).toBeInTheDocument();
  });

  it("aviso de salário abaixo do mínimo não bloqueia o cálculo", async () => {
    await fillAndSubmit({ salario: "1000", horasExtrasUteis: "10" });

    // Result should still render despite the warning
    expect(
      await screen.findByText(/total de horas extras/i)
    ).toBeInTheDocument();
  });

  it("formulário tem campos de jornada diária e dias por semana", () => {
    render(<HorasExtrasPage />);
    expect(screen.getByLabelText(/jornada diária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dias por semana/i)).toBeInTheDocument();
  });

  it("formulário tem todos os cinco campos de horas", () => {
    render(<HorasExtrasPage />);
    expect(screen.getByLabelText(/horas extras em dias úteis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/horas extras em domingos\/feriados/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/horas noturnas \(22h–5h\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/horas extras noturnas em dias úteis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/horas extras noturnas em domingos\/feriados/i)).toBeInTheDocument();
  });
});

// ─── Task 5.2: resultado com subtotais e resumo textual ───────────────────────

describe("HorasExtrasPage — resultado (Task 5.2)", () => {
  it("submissão com salário válido e horas preenchidas exibe o total", async () => {
    await fillAndSubmit({ horasExtrasUteis: "10" });

    expect(
      await screen.findByText(/total de horas extras/i)
    ).toBeInTheDocument();
  });

  it("edge case: todos os campos de horas em zero exibe total R$ 0,00", async () => {
    // Submit with default zero values for all hours fields
    const user = userEvent.setup();
    render(<HorasExtrasPage />);
    fireEvent.change(screen.getByLabelText(/salário bruto/i), {
      target: { value: "3000" },
    });
    await user.click(screen.getByRole("button", { name: /calcular horas extras/i }));

    // ResultBox should appear (isVisible=true after submit)
    expect(await screen.findByText(/total de horas extras/i)).toBeInTheDocument();
    // Multiple R$ 0,00 may appear (ResultBox value + ResultDetailBlock item); use getAllByText
    const zeros = await screen.findAllByText(/R\$\s*0,00/);
    expect(zeros.length).toBeGreaterThan(0);
  });

  it("exibe subtotal de HE dias úteis quando horasExtrasUteis > 0", async () => {
    await fillAndSubmit({ horasExtrasUteis: "10" });

    // ResultDetailBlock shows "HE dias úteis (adicional 50%)"
    expect(
      await screen.findByText(/HE dias úteis.*50%/i)
    ).toBeInTheDocument();
  });

  it("exibe subtotal de HE domingos/feriados quando horasExtrasFeriado > 0", async () => {
    await fillAndSubmit({ horasExtrasFeriado: "5" });

    expect(
      await screen.findByText(/HE domingos.*100%/i)
    ).toBeInTheDocument();
  });

  it("exibe subtotal de adicional noturno quando horasNoturnas > 0", async () => {
    await fillAndSubmit({ horasNoturnas: "8" });

    // ResultDetailBlock renders label "Adicional noturno (20%)" in a <span>
    // Use getAllByText because the static table also contains related text
    const items = await screen.findAllByText(/adicional noturno \(20%\)/i);
    expect(items.length).toBeGreaterThan(0);
  });

  it("exibe resumo narrativo de horas extras após cálculo", async () => {
    await fillAndSubmit({ horasExtrasUteis: "10" });

    // buildNarrativeHorasExtras returns "10h extra(s) em dias úteis (50%): R$ 259,64"
    // This specific format with "10h extra(s)" is unique to the narrative (not the static table)
    const narratives = await screen.findAllByText(/10h extra\(s\) em dias úteis/i);
    expect(narratives.length).toBeGreaterThan(0);
  });

  it("exibe nota sobre hora noturna reduzida (52min30s) após cálculo", async () => {
    await fillAndSubmit({ horasNoturnas: "4" });

    // ResultBox must appear first (result is set)
    await screen.findByText(/total de horas extras/i);
    // The nota is inside a <div> with "Hora noturna reduzida:" in a <strong> + rest in text node
    const container = document.body;
    expect(container.textContent?.toLowerCase()).toContain("hora noturna reduzida");
  });

  it("exibe disclaimer legal estático após cálculo", async () => {
    await fillAndSubmit({ horasExtrasUteis: "5" });

    expect(
      await screen.findByText(/consulte.*especialista.*trabalhista/i)
    ).toBeInTheDocument();
  });

  it("resultado é resetado ao alterar o salário após cálculo", async () => {
    const user = userEvent.setup();
    render(<HorasExtrasPage />);

    // First submit
    fireEvent.change(screen.getByLabelText(/salário bruto/i), {
      target: { value: "3000" },
    });
    fireEvent.change(screen.getByLabelText(/horas extras em dias úteis/i), {
      target: { value: "10" },
    });
    await user.click(screen.getByRole("button", { name: /calcular horas extras/i }));
    // ResultDetailBlock shows the item label "HE dias úteis (adicional 50%)"
    expect(await screen.findByText(/HE dias úteis \(adicional 50%\)/i)).toBeInTheDocument();

    // Change salary — result should reset (isVisible becomes false)
    fireEvent.change(screen.getByLabelText(/salário bruto/i), {
      target: { value: "4000" },
    });

    // ResultDetailBlock should no longer be visible — item "HE dias úteis (adicional 50%)" gone
    expect(screen.queryByText(/HE dias úteis \(adicional 50%\)/i)).not.toBeInTheDocument();
  });
});
