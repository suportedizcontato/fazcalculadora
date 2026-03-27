describe("Calculadora de Consumo de Água", () => {
  beforeEach(() => {
    cy.visit("/consumo-agua");
  });

  // ── Tarefa 4.1 — Validação ────────────────────────────────────────────────

  it("exibe o campo de peso corporal", () => {
    cy.contains("label", "Seu peso corporal").should("be.visible");
    cy.get("#peso").should("be.visible");
  });

  it("exibe erro de obrigatoriedade ao submeter campo vazio e mantém ResultBox oculto", () => {
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("contain.text", "Informe o peso corporal");
    cy.get('[data-variant]').should("not.exist");
  });

  it("exibe erro para peso abaixo de 20 kg", () => {
    cy.get("#peso").type("19");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("contain.text", "20 kg");
  });

  it("exibe erro para peso acima de 300 kg", () => {
    cy.get("#peso").type("301");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("contain.text", "300 kg");
  });

  // ── Tarefa 4.2 — Cálculo e UX ─────────────────────────────────────────────

  it("calcula 2450 ml e 2,45 L para 70 kg", () => {
    cy.get("#peso").type("70");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("be.visible");
    cy.get('[role="region"]').should("contain.text", "2.450");
    cy.get('[role="region"]').should("contain.text", "2,45");
  });

  it("normaliza vírgula como separador decimal e executa o cálculo para 80,5 kg", () => {
    cy.get("#peso").type("80,5");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("be.visible");
    // 80.5 * 35 = 2817.5 → round → 2818 ml
    cy.get('[role="region"]').should("contain.text", "2.818");
  });

  it("oculta ResultBox ao modificar o campo após exibição do resultado", () => {
    cy.get("#peso").type("70");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get("#peso").type("{selectAll}80");
    cy.get('[data-variant]').should("not.exist");
  });

  it("submete o formulário pressionando Enter com foco no campo peso", () => {
    cy.get("#peso").type("70");
    cy.get("#peso").focus().type("{enter}");
    cy.get('[role="region"]').should("contain.text", "2.450");
  });
});
