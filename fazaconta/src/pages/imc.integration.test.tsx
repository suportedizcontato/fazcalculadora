import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Imc from "./imc";

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
  render(<Imc />);
  const pesoInput = screen.getByLabelText(/peso/i);
  const alturaInput = screen.getByLabelText(/altura/i);
  const submitBtn = screen.getByRole("button", { name: /calcular/i });
  return { user, pesoInput, alturaInput, submitBtn };
}

describe("7.2 — Integração: validação e fluxo do formulário", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("exibe mensagens de erro em ambos os campos ao submeter vazio, sem mostrar resultado", async () => {
    const { user, submitBtn } = setup();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/peso é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/altura é obrigatório/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/classificação:/i)).not.toBeInTheDocument();
  });

  it("calcula o resultado correto ao inserir valores com vírgula como separador decimal", async () => {
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    await user.type(pesoInput, "70,5");
    await user.type(alturaInput, "1,75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/classificação:.*peso normal/i)).toBeInTheDocument();
    });
  });

  it("trata valor com ponto-decimal inicial (ex: .75) como 0.75", async () => {
    // .75 peso é inválido (< 0), mas queremos confirmar que a normalização ocorre.
    // Usamos .75 para altura: 0.75 m é inválido (muito baixo), então esperamos erro de valor implausível.
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    await user.type(pesoInput, "70");
    await user.type(alturaInput, ".75");
    await user.click(submitBtn);

    // .75 normalizes to 0.75 which is <= 0? No: 0.75 > 0 but is it > 3? No, 0.75 < 3.
    // 0.75 is valid for altura schema (> 0, <= 3.0, 2 decimal places).
    // IMC = 70 / (0.75 * 0.75) = 124.44 → Obesidade grau III
    await waitFor(() => {
      expect(screen.getByText(/classificação:.*obesidade grau iii/i)).toBeInTheDocument();
    });
  });

  it("exibe erro de valor implausível ao ultrapassar o limite de peso", async () => {
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    await user.type(pesoInput, "501");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/implausível/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/classificação:/i)).not.toBeInTheDocument();
  });

  it("exibe erro de precisão ao inserir mais de duas casas decimais", async () => {
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    await user.type(pesoInput, "70.123");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/decima|precisão/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/classificação:/i)).not.toBeInTheDocument();
  });

  it("mostra resultado com label e variante corretos ao submeter dados válidos", async () => {
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    await user.type(pesoInput, "70");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/classificação:.*peso normal/i)).toBeInTheDocument();
    });
    // Verifica o valor numérico do IMC
    expect(screen.getByText(/22[.,]86/)).toBeInTheDocument();
  });

  it("esconde o resultado imediatamente ao modificar um campo após exibição", async () => {
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    // Primeiro, obter um resultado
    await user.type(pesoInput, "70");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/classificação:.*peso normal/i)).toBeInTheDocument();
    });

    // Modificar o campo de peso
    await user.type(pesoInput, "5");

    await waitFor(() => {
      expect(screen.queryByText(/classificação:/i)).not.toBeInTheDocument();
    });
  });

  it("mantém o resultado oculto ao submeter dados inválidos após resultado anterior", async () => {
    const { user, pesoInput, alturaInput, submitBtn } = setup();

    // Primeira submissão válida
    await user.type(pesoInput, "70");
    await user.type(alturaInput, "1.75");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/classificação:.*peso normal/i)).toBeInTheDocument();
    });

    // Limpar peso e inserir valor inválido
    await user.clear(pesoInput);
    await user.type(pesoInput, "abc");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/número válido/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/classificação:/i)).not.toBeInTheDocument();
  });

  it("move o foco para o primeiro campo inválido ao submeter formulário com erros", async () => {
    const { user, submitBtn, pesoInput } = setup();

    await user.click(submitBtn);

    await waitFor(() => {
      expect(document.activeElement).toBe(pesoInput);
    });
  });
});
