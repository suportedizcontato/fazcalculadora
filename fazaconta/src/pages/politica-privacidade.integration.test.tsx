import "@testing-library/jest-dom/vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import PoliticaPrivacidade from "./politica-privacidade";

describe("PoliticaPrivacidade", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    cleanup();
    document.title = originalTitle;
  });

  it("renderiza sem erros", () => {
    render(<PoliticaPrivacidade />);
  });

  it("contém exatamente um h1 com texto 'Política de Privacidade'", () => {
    render(<PoliticaPrivacidade />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Política de Privacidade");
  });

  it("contém as quatro seções h2 esperadas", () => {
    render(<PoliticaPrivacidade />);
    expect(screen.getByRole("heading", { level: 2, name: /coleta de dados/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /cookies/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /publicidade/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /direitos/i })).toBeDefined();
  });

  it("define document.title corretamente ao montar", () => {
    render(<PoliticaPrivacidade />);
    expect(document.title).toBe("Política de Privacidade | Fazaconta");
  });

  it("restaura document.title ao desmontar", () => {
    document.title = "Título Anterior";
    const { unmount } = render(<PoliticaPrivacidade />);
    expect(document.title).toBe("Política de Privacidade | Fazaconta");
    act(() => { unmount(); });
    expect(document.title).toBe("Título Anterior");
  });

  it("contém link externo para política do Google com rel noopener", () => {
    render(<PoliticaPrivacidade />);
    const googleLink = screen.getByRole("link", { name: /política de privacidade do google/i });
    expect(googleLink).toHaveAttribute("target", "_blank");
    expect(googleLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
