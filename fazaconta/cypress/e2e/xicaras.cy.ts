describe("Conversor de Xícaras", () => {
  beforeEach(() => {
    cy.visit("/conversao-xicaras");
  });

  // ── Tarefa 5.1 — Validação ────────────────────────────────────────────────

  it("exibe o campo de quantidade de xícaras", () => {
    cy.contains("label", "Quantidade de xícaras").should("be.visible");
    cy.get("#xicaras").should("be.visible");
  });

  it("exibe erro 'Informe a quantidade de xícaras.' ao submeter campo vazio", () => {
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("have.text", "Informe a quantidade de xícaras.");
    cy.get('[data-variant]').should("not.exist");
  });

  it("exibe erro 'O valor deve ser maior que zero.' para valor zero", () => {
    cy.get("#xicaras").type("0");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("have.text", "O valor deve ser maior que zero.");
  });

  it("exibe erro 'O valor deve ser maior que zero.' para valor negativo", () => {
    cy.get("#xicaras").type("-1");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("have.text", "O valor deve ser maior que zero.");
  });

  it("exibe erro 'Use no máximo duas casas decimais.' para valor com mais de 2 casas decimais", () => {
    cy.get("#xicaras").type("1.555");
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.get('[role="alert"]').should("have.text", "Use no máximo duas casas decimais.");
  });

  // ── Tarefa 5.2 — Cálculo e UX ─────────────────────────────────────────────

  it("calcula 480 ml para 2 xícaras", () => {
    cy.get("#xicaras").type("2");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("be.visible");
    cy.get('[role="region"]').should("contain.text", "480");
    cy.get('[role="region"]').should("contain.text", "2,4");
  });

  it("normaliza vírgula como separador decimal e calcula 120 ml para 0,5 xícaras", () => {
    cy.get("#xicaras").type("0,5");
    cy.get("button[type=submit]").click();
    cy.get('[role="region"]').should("be.visible");
    cy.get('[role="region"]').should("contain.text", "120");
  });

  it("exibe o aviso educativo sobre variação de medidas junto ao resultado", () => {
    cy.get("#xicaras").type("1");
    cy.get("button[type=submit]").click();
    cy.contains("Medidas culinárias podem variar").should("be.visible");
  });

  it("oculta ResultBox ao modificar o campo após exibição do resultado", () => {
    cy.get("#xicaras").type("2");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get("#xicaras").type("{selectAll}3");
    cy.get('[data-variant]').should("not.exist");
  });
});
