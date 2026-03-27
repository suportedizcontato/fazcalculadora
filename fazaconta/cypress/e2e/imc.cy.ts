describe("Calculadora de IMC", () => {
  beforeEach(() => {
    cy.visit("/imc");
  });

  // ── Tarefa 3.1 — Validação ────────────────────────────────────────────────

  it("exibe os campos Peso (kg) e Altura (m)", () => {
    cy.contains("label", "Peso (kg)").should("be.visible");
    cy.contains("label", "Altura (m)").should("be.visible");
  });

  it("exibe erros ao submeter formulário vazio e mantém ResultBox oculto", () => {
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("have.length.at.least", 2);
    cy.get('[data-variant]').should("not.exist");
  });

  it("exibe erro para peso zero", () => {
    cy.get("#peso").type("0");
    cy.get("#altura").type("1.75");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
  });

  it("exibe erro para peso negativo", () => {
    cy.get("#peso").type("-10");
    cy.get("#altura").type("1.75");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
  });

  it("exibe mensagem de valor implausível para peso > 500 kg", () => {
    cy.get("#peso").type("501");
    cy.get("#altura").type("1.75");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("contain.text", "implausível");
  });

  // ── Tarefa 3.2 — Cálculo e classificação ─────────────────────────────────

  it("calcula IMC 22,86 e classifica como Peso normal para 70 kg e 1,75 m", () => {
    cy.get("#peso").type("70");
    cy.get("#altura").type("1,75");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("be.visible");
    cy.get('[role="region"]').should("contain.text", "22.86");
    cy.get('[role="region"]').should("contain.text", "Peso normal");
  });

  it("classifica como Abaixo do peso para 50 kg e 1,70 m", () => {
    cy.get("#peso").type("50");
    cy.get("#altura").type("1,70");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("contain.text", "Abaixo do peso");
  });

  it("classifica como Sobrepeso para 85 kg e 1,75 m", () => {
    cy.get("#peso").type("85");
    cy.get("#altura").type("1,75");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("contain.text", "Sobrepeso");
  });

  it("classifica como Obesidade grau I para 110 kg e 1,70 m", () => {
    cy.get("#peso").type("110");
    cy.get("#altura").type("1,70");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("contain.text", "Obesidade grau I");
  });

  it("exibe ResultBox com variante success para Peso normal", () => {
    cy.get("#peso").type("70");
    cy.get("#altura").type("1,75");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant="success"]').should("be.visible");
  });

  it("exibe ResultBox com variante danger para Obesidade grau I", () => {
    cy.get("#peso").type("110");
    cy.get("#altura").type("1,70");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant="danger"]').should("be.visible");
  });

  // ── Tarefa 3.3 — UX ──────────────────────────────────────────────────────

  it("oculta ResultBox ao modificar campo após exibição do resultado", () => {
    cy.get("#peso").type("70");
    cy.get("#altura").type("1,75");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get("#peso").type("{selectAll}80");
    cy.get('[data-variant]').should("not.exist");
  });

  it("submete o formulário pressionando Enter com foco no campo peso", () => {
    cy.get("#peso").type("70");
    cy.get("#altura").type("1,75");
    cy.get("#peso").focus().type("{enter}");
    cy.get('[role="region"]').should("contain.text", "22.86");
  });

  it("aceita vírgula como separador decimal e normaliza corretamente", () => {
    cy.get("#peso").type("70");
    cy.get("#altura").type("1,75");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("contain.text", "22.86");
  });
});
