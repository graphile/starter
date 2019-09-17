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

  it("can add an email, verify it, make it primary, and delete original email", () => {
    // Setup
    cy.login({ next: "/settings/emails", verified: true });
    cy.contains("testuser@example.com").should("exist");
    cy.contains("(unverified)").should("not.exist");

    // Action
    cy.getCy("settingsemails-button-addemail").click();
    cy.getCy("settingsemails-input-email").type("newemail@example.com");
    cy.getCy("settingsemails-button-submit").click();

    // Assertion
    cy.contains("newemail@example.com").should("exist");
    cy.contains("(unverified)").should("exist");
  });
});
