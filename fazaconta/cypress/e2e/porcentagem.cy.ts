describe("Calculadora de Porcentagem", () => {
  beforeEach(() => {
    cy.visit("/porcentagem");
  });

  // ── Tarefa 6.1 — Carga e modo padrão ─────────────────────────────────────

  it("carrega com o modo 'Quanto é X% de Y' pré-selecionado e seus campos visíveis", () => {
    cy.get('[data-cy="mode-btn-porcentagem-de"]').should("be.visible");
    cy.contains("label", "Percentual (%)").should("be.visible");
    cy.contains("label", "Valor base").should("be.visible");
  });

  it("exibe mensagens de erro ao calcular com campos obrigatórios vazios", () => {
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("have.length.at.least", 1);
    cy.get('[data-variant]').should("not.exist");
  });

  it("oculta o ResultBox ao modificar qualquer campo após exibição do resultado", () => {
    cy.get("#percentual").type("10");
    cy.get("#valorBase").type("200");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get("#percentual").type("{selectAll}20");
    cy.get('[data-variant]').should("not.exist");
  });

  // ── Tarefa 6.2 — Cálculo para cada modo de operação ──────────────────────────

  it("modo 'Quanto é X% de Y': 10% de 200 = 20,00 com explicação correta", () => {
    cy.get("#percentual").type("10");
    cy.get("#valorBase").type("200");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').within(() => {
      cy.contains("20,00").should("be.visible");
      cy.contains("10,00% de 200,00 é igual a 20,00").should("be.visible");
    });
  });

  it("modo 'Que percentual é A de B': A=30, B=150 → 20,00%", () => {
    cy.get('[data-cy="mode-btn-que-percentual"]').click();
    cy.get("#valorParcial").type("30");
    cy.get("#valorTotal").type("150");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').within(() => {
      cy.contains("20,00%").should("be.visible");
    });
  });

  it("modo 'Aumento percentual': 100 com 15% → valor final 115,00", () => {
    cy.get('[data-cy="mode-btn-aumento"]').click();
    cy.get("#valorOriginal").type("100");
    cy.get("#percentualAumento").type("15");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').within(() => {
      cy.contains("115,00").should("be.visible");
    });
  });

  it("modo 'Desconto percentual': 250 com 20% → valor final 200,00", () => {
    cy.get('[data-cy="mode-btn-desconto"]').click();
    cy.get("#valorOriginal").type("250");
    cy.get("#percentualDesconto").type("20");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').within(() => {
      cy.contains("200,00").should("be.visible");
    });
  });

  it("modo 'Variação percentual': inicial 80, final 100 → 25,00%", () => {
    cy.get('[data-cy="mode-btn-variacao"]').click();
    cy.get("#valorInicial").type("80");
    cy.get("#valorFinal").type("100");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').within(() => {
      cy.contains("25,00%").should("be.visible");
    });
  });

  // ── Tarefa 6.3 — Troca de modo e variante visual ──────────────────────────

  it("ao trocar de modo, os campos são limpos e o resultado anterior é ocultado", () => {
    // Calcula um resultado no modo padrão
    cy.get("#percentual").type("10");
    cy.get("#valorBase").type("200");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");

    // Troca de modo via data-cy
    cy.get('[data-cy="mode-btn-que-percentual"]').click();

    // Resultado anterior deve desaparecer
    cy.get('[data-variant]').should("not.exist");

    // Campos do novo modo devem estar vazios
    cy.get("#valorParcial").should("have.value", "");
    cy.get("#valorTotal").should("have.value", "");
  });

  it("ao trocar para outro modo e voltar, campos permanecem limpos", () => {
    // Troca para modo aumento usando data-cy
    cy.get('[data-cy="mode-btn-aumento"]').click();
    cy.get("#valorOriginal").should("have.value", "");
    cy.get("#percentualAumento").should("have.value", "");

    // Troca para modo desconto usando data-cy
    cy.get('[data-cy="mode-btn-desconto"]').click();
    cy.get("#valorOriginal").should("have.value", "");
    cy.get("#percentualDesconto").should("have.value", "");
  });

  it("exibe variante 'warning' quando a variação percentual é negativa", () => {
    cy.get('[data-cy="mode-btn-variacao"]').click();
    cy.get("#valorInicial").type("100");
    cy.get("#valorFinal").type("80");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').should("have.attr", "data-variant", "warning");
    cy.get('[data-variant]').within(() => {
      cy.contains("-20,00%").should("be.visible");
    });
  });
});
