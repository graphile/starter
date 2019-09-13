/// <reference types="Cypress" />

context("HomePage", () => {
  it("renders correctly", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL"));

    // Action

    // Assertions
    cy.getCy("header-login-button").should("exist");
    cy.getCy("homepage-header").should("exist");
  });
});
