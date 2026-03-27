import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Xicaras from "./xicaras";

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
  render(<Xicaras />);
  const xicarasInput = screen.getByLabelText(/xícaras/i);
  const submitBtn = screen.getByRole("button", { name: /converter/i });
  return { user, xicarasInput, submitBtn };
}

describe("Integração: Conversor de Xícaras", () => {
  afterEach(() => {
    cleanup();
  });

  // Task 5: aria-live region and educational disclaimer
  describe("Task 5 — Região ARIA permanente e aviso educativo", () => {
    it("região aria-live='polite' está sempre presente no DOM (sem resultado)", () => {
      setup();
      const region = screen.getByRole("region", { name: /resultado da conversão/i });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute("aria-live", "polite");
    });

    it("aviso educativo (XICARAS_DISCLAIMER) aparece apenas quando há resultado", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      // Before calculation — disclaimer must not be visible
      expect(screen.queryByText(/medidas culinárias podem variar/i)).not.toBeInTheDocument();

      // Calculate
      await user.type(xicarasInput, "2");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/medidas culinárias podem variar/i)).toBeInTheDocument();
      });
    });

    it("aviso educativo desaparece ao editar o campo após cálculo", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "2");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/medidas culinárias podem variar/i)).toBeInTheDocument();
      });

      // Edit field — disclaimer should disappear
      await user.type(xicarasInput, "3");

      await waitFor(() => {
        expect(screen.queryByText(/medidas culinárias podem variar/i)).not.toBeInTheDocument();
      });
    });

    it("resultado exibe ml e copos com formatação correta", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "2");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/480/)).toBeInTheDocument();
        // The unit "ml" appears as a <span> child inside the result value
        expect(screen.getAllByText(/\bml\b/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // Task 6.1: Valid submission and comma normalization flows
  describe("Task 6.1 — Fluxos de submissão válida e normalização", () => {
    it("submissão com valor inteiro exibe resultado em ml e copos", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "2");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/480/)).toBeInTheDocument();
        expect(screen.getAllByText(/\bml\b/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/2[,.]4 copos/i)).toBeInTheDocument();
      });
    });

    it("submissão com vírgula como separador decimal exibe conversão correta", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "1,5");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/360/)).toBeInTheDocument();
        expect(screen.getByText(/1[,.]8 copos/i)).toBeInTheDocument();
      });
    });

    it("submissão com fracionário válido 0.25 exibe 60 ml", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "0.25");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/60/)).toBeInTheDocument();
        expect(screen.getAllByText(/\bml\b/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("região aria-live='polite' está sempre presente no DOM mesmo sem resultado", () => {
      setup();
      const region = screen.getByRole("region", { name: /resultado da conversão/i });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute("aria-live", "polite");
    });
  });

  // Task 6.2: Validation flows and error messages
  describe("Task 6.2 — Fluxos de validação e mensagens de erro", () => {
    it("submissão sem preencher → mensagem 'Informe a quantidade de xícaras.'", async () => {
      const { user, submitBtn } = setup();

      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Informe a quantidade de xícaras.")).toBeInTheDocument();
      });
    });

    it("valor zero → mensagem 'O valor deve ser maior que zero.'", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "0");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("O valor deve ser maior que zero.")).toBeInTheDocument();
      });
    });

    it("valor negativo → mensagem 'O valor deve ser maior que zero.'", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "-1");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("O valor deve ser maior que zero.")).toBeInTheDocument();
      });
    });

    it("valor acima do máximo → mensagem 'O valor excede o máximo permitido (9999 xícaras).'", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "10000");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText("O valor excede o máximo permitido (9999 xícaras).")
        ).toBeInTheDocument();
      });
    });

    it("valor com mais de duas casas decimais → mensagem 'Use no máximo duas casas decimais.'", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      await user.type(xicarasInput, "1.123");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Use no máximo duas casas decimais.")).toBeInTheDocument();
      });
    });

    it("mensagem de erro exibida possui role='alert'", async () => {
      const { user, submitBtn } = setup();

      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("somente uma mensagem de erro é exibida por vez (prioridade determinística)", async () => {
      const { user, submitBtn } = setup();

      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getAllByRole("alert")).toHaveLength(1);
      });
    });
  });

  // Task 6.3: Reset result when editing
  describe("Task 6.3 — Reset de resultado ao editar", () => {
    it("área de resultado desaparece ao editar o campo após cálculo", async () => {
      const { user, xicarasInput, submitBtn } = setup();

      // Calculate a valid result first
      await user.type(xicarasInput, "2");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/480/)).toBeInTheDocument();
      });

      // Edit the field — result area should disappear
      await user.type(xicarasInput, "3");

      await waitFor(() => {
        expect(screen.queryByText(/480/)).not.toBeInTheDocument();
      });
    });
  });

  // Task 4: ARIA attributes on input and error message
  describe("Task 4 — Acessibilidade: atributos ARIA no campo e mensagem de erro", () => {
    it("campo de entrada possui aria-describedby='xicaras-error'", () => {
      const { xicarasInput } = setup();
      expect(xicarasInput).toHaveAttribute("aria-describedby", "xicaras-error");
    });

    it("mensagem de erro possui id='xicaras-error' e role='alert'", async () => {
      const { user, submitBtn } = setup();

      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Informe a quantidade de xícaras.")).toBeInTheDocument();
      });

      const errorEl = screen.getByRole("alert");
      expect(errorEl).toHaveAttribute("id", "xicaras-error");
    });

    it("label mantém associação correta com o campo via htmlFor", () => {
      setup();
      const label = screen.getByText(/quantidade de xícaras/i);
      expect(label).toHaveAttribute("for", "xicaras");
    });

    it("campo de entrada é do tipo text com inputMode='decimal'", () => {
      const { xicarasInput } = setup();
      expect(xicarasInput).toHaveAttribute("type", "text");
      expect(xicarasInput).toHaveAttribute("inputMode", "decimal");
    });
  });
});
