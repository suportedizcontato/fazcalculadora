describe("Calculadora Trabalhista CLT", () => {
  beforeEach(() => {
    cy.visit("/rescisao-clt");
  });

  // ── Utilidade: preenche o formulário de rescisão com valores padrão ──────────

  function preencheRescisaoBase() {
    cy.get("#r-salario").type("300000"); // formatSalarioInput → 3.000,00
    cy.get("#r-anos").type("1");
    cy.get("#r-meses").clear();
    cy.get("#r-dias").type("30");
    cy.get("#r-meses13").type("1");
  }

  // ── Tarefa 7.1 — Carga e módulo padrão ───────────────────────────────────────

  it("carrega com o módulo Rescisão CLT pré-selecionado e seus campos visíveis", () => {
    cy.get('[data-cy="module-tab-rescisao"]').should("be.visible");
    cy.contains("label", "Salário Bruto (R$)").should("be.visible");
    cy.contains("label", "Tipo de desligamento").should("be.visible");
    cy.contains("label", "Dias trabalhados no mês atual (1–31)").should("be.visible");
  });

  it("exibe mensagens de validação ao calcular com campos obrigatórios vazios no módulo Rescisão", () => {
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("have.length.at.least", 1);
    cy.get('[data-variant]').should("not.exist");
  });

  it("exibe mensagens de validação ao calcular com campos obrigatórios vazios no módulo Férias", () => {
    cy.get('[data-cy="module-tab-ferias"]').click();
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("have.length.at.least", 1);
    cy.get('[data-variant]').should("not.exist");
  });

  it("exibe mensagens de validação ao calcular com campos obrigatórios vazios no módulo 13º Salário", () => {
    cy.get('[data-cy="module-tab-decimo"]').click();
    cy.get("button[type=submit]").click();
    cy.get('[role="alert"]').should("have.length.at.least", 1);
    cy.get('[data-variant]').should("not.exist");
  });

  it("oculta o bloco de resultado ao modificar qualquer campo após exibição", () => {
    // Preenche formulário mínimo de rescisão para gerar resultado
    cy.get("#r-salario").type("300000"); // formatSalarioInput → 3.000,00
    cy.get("#r-anos").type("1");
    cy.get("#r-meses").clear();
    cy.get("#r-dias").type("30");
    cy.get("#r-meses13").type("1");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");

    // Modificar campo oculta o resultado
    cy.get("#r-dias").clear().type("15");
    cy.get('[data-variant]').should("not.exist");
  });

  // ── Tarefa 7.2 — Cenários do módulo Rescisão CLT ─────────────────────────────

  it("calcula verbas rescisórias para demissão sem justa causa e exibe total estimado", () => {
    // tipoDesligamento padrão já é "sem-justa-causa"
    preencheRescisaoBase();
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    // Total estimado: 3000 (saldo) + 0 (férias, mesesAquisitivos=0) + 250 (13º/1 mês) + 1152 (multa FGTS 40%) = 4402
    cy.get('[data-variant]').should("contain.text", "R$");
    cy.get('[data-variant]').should("contain.text", "4.402");
  });

  it("inclui linha de multa FGTS no detalhamento para demissão sem justa causa", () => {
    preencheRescisaoBase();
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.contains("Multa FGTS").should("be.visible");
  });

  it("não exibe linha de multa FGTS para pedido de demissão", () => {
    // Trocar para pedido de demissão
    cy.get("#r-tipo").click();
    cy.contains('[role="option"]', "Pedido de demissão").click();
    preencheRescisaoBase();
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.contains("Multa FGTS").should("not.exist");
    // Total: 3000 + 0 + 250 = 3250
    cy.get('[data-variant]').should("contain.text", "3.250");
  });

  it("exibe nota de estimativa bruta junto ao resultado de rescisão", () => {
    preencheRescisaoBase();
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.contains("INSS").should("be.visible");
    cy.contains("IRRF").should("be.visible");
  });

  // ── Tarefa 7.3 — Cenários dos módulos Férias e 13º Salário ───────────────────

  it("calcula férias proporcionais no módulo Férias e exibe R$ no resultado", () => {
    cy.get('[data-cy="module-tab-ferias"]').click();
    cy.get("#f-salario").type("300000"); // formatSalarioInput → 3.000,00
    cy.get("#f-meses").type("6");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    cy.get('[data-variant]').should("contain.text", "R$");
  });

  it("calcula 13º proporcional de R$ 1.500,00 para salário 3000 e 6 meses", () => {
    cy.get('[data-cy="module-tab-decimo"]').click();
    cy.get("#d-salario").type("300000"); // formatSalarioInput → 3.000,00
    cy.get("#d-meses").type("6");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");
    // (3000/12) × 6 = 1500,00
    cy.get('[data-variant]').should("contain.text", "1.500");
  });

  it("limpa campos e oculta resultado ao trocar de módulo", () => {
    // Gera resultado no módulo 13º
    cy.get('[data-cy="module-tab-decimo"]').click();
    cy.get("#d-salario").type("300000");
    cy.get("#d-meses").type("6");
    cy.get("button[type=submit]").click();
    cy.get('[data-variant]').should("be.visible");

    // Trocar para módulo Férias oculta resultado e limpa campos
    cy.get('[data-cy="module-tab-ferias"]').click();
    cy.get('[data-variant]').should("not.exist");
    cy.get("#f-salario").should("have.value", "");
    cy.get("#f-meses").should("have.value", "");
  });
});
