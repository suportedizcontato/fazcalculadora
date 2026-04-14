import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Layout } from "./layout";

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ["/", () => {}],
}));

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
