import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Agua from "./agua";

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
  render(<Agua />);
  const pesoInput = screen.getByLabelText(/peso/i);
  const submitBtn = screen.getByRole("button", { name: /calcular/i });
  return { user, pesoInput, submitBtn };
}

describe("Integração: Calculadora de Consumo de Água", () => {
  afterEach(() => {
    cleanup();
  });

  it("exibe mensagem de obrigatoriedade ao submeter campo vazio, sem mostrar resultado", async () => {
    const { user, submitBtn } = setup();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Informe o peso corporal")).toBeInTheDocument();
    });
    expect(screen.queryByText(/meta diária/i)).not.toBeInTheDocument();
  });

  it("exibe mensagem de formato ao submeter valor não numérico e foca no campo", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "abc");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Insira um número válido")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(pesoInput);
    });
  });

  it("exibe mensagem de intervalo ao submeter 15", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "15");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Peso fora do intervalo permitido (20 kg a 300 kg)")
      ).toBeInTheDocument();
    });
  });

  it("exibe mensagem de intervalo ao submeter 301", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "301");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Peso fora do intervalo permitido (20 kg a 300 kg)")
      ).toBeInTheDocument();
    });
  });

  it("exibe mensagem de precisão ao submeter '70,555'", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "70,555");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Máximo de 2 casas decimais permitidas")
      ).toBeInTheDocument();
    });
  });

  it("exibe resultado com ml, litros e copos ao submeter '70,5'", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "70,5");
    await user.click(submitBtn);

    // 70.5 * 35 = 2467.5 → Math.round = 2468 ml; 2468/1000 = 2.47 litros; 2468/250 ≈ 10 copos
    await waitFor(() => {
      expect(screen.getByText(/meta diária/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/2\.468|2468/)).toBeInTheDocument();
    expect(screen.getByText(/litros/i)).toBeInTheDocument();
    expect(screen.getByText(/copos/i)).toBeInTheDocument();
  });

  it("exibe aviso educativo após resultado válido", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "70");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/meta diária/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/variação individual|hidratação|médico|profissional/i)).toBeInTheDocument();
  });

  it("oculta resultado ao modificar o campo após exibição", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "70");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/meta diária/i)).toBeInTheDocument();
    });

    await user.type(pesoInput, "5");

    await waitFor(() => {
      expect(screen.queryByText(/meta diária/i)).not.toBeInTheDocument();
    });
  });

  it("oculta resultado ao submeter dados inválidos após resultado anterior", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.type(pesoInput, "70");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/meta diária/i)).toBeInTheDocument();
    });

    await user.clear(pesoInput);
    await user.type(pesoInput, "abc");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Insira um número válido")).toBeInTheDocument();
    });
    expect(screen.queryByText(/meta diária/i)).not.toBeInTheDocument();
  });

  it("ARIA: role='region' na área de resultado", () => {
    setup();
    expect(screen.getByRole("region", { name: /resultado do consumo/i })).toBeInTheDocument();
  });

  it("ARIA: role='alert' na mensagem de erro após submissão inválida", async () => {
    const { user, submitBtn } = setup();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("ARIA: aria-describedby conectado ao id correto na mensagem de erro", async () => {
    const { user, pesoInput, submitBtn } = setup();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Informe o peso corporal")).toBeInTheDocument();
    });

    expect(pesoInput).toHaveAttribute("aria-describedby", "peso-error");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "peso-error");
  });
});
