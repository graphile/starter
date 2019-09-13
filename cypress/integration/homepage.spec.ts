/// <reference types="Cypress" />

context("HomePage", () => {
  it("loads", () => {
    cy.visit(Cypress.env("ROOT_URL"));
  });
});
