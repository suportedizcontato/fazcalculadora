import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Layout } from "./layout";

afterEach(() => {
  cleanup();
});

describe("Layout — rodapé", () => {
  it("exibe link 'Política de Privacidade' no rodapé apontando para /politica-de-privacidade", () => {
    render(<Layout><div /></Layout>);
    const link = screen.getByRole("link", { name: /política de privacidade/i });
    expect(link).toHaveAttribute("href", "/politica-de-privacidade");
  });
});
