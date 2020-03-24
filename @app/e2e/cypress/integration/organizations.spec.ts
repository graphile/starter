/// <reference types="Cypress" />

context("Organizations", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));
  beforeEach(() => cy.serverCommand("clearTestOrganizations"));

  it("can create an organization", () => {
    // Setup
    cy.login({ next: "/", verified: true });

    // Action
    cy.getCy("layout-dropdown-user").trigger("mouseover");
    cy.getCy("layout-link-create-organization").click();
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/create-organization");
    cy.getCy("createorganization-input-name").type("Test Organization");
    cy.getCy("createorganization-slug-value").contains("test-organization");
    cy.getCy("createorganization-button-create").click();

    // Assertion
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/o/test-organization");
  });
});
