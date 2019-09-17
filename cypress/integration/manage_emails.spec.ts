/// <reference types="Cypress" />

context("Manage emails", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));

  it("can navigate to manage emails page", () => {
    // Setup
    cy.login({ next: "/", verified: true });

    // Action
    cy.getCy("layout-dropdown-user").trigger("mouseover");
    cy.getCy("layout-link-settings").click();
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/settings");
    cy.getCy("settingslayout-link-emails").click();

    // Assertion
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/settings/emails");
  });
});
