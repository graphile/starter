/// <reference types="Cypress" />

context("RegisterAccount", () => {
  it("can navigate to registration page", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL"));

    // Action
    cy.getCy("header-login-button").click();
    cy.getCy("loginpage-register-button").click();

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/register");
    cy.getCy("registerpage-name-label").should("exist");
  });

  it("requires the form be filled", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL") + "/register");

    // Action
    cy.getCy("registerpage-submit-button").click();

    // Assertions
    cy.getCy("registerpage-name-label").should("exist");
    cy.contains("Registration failed");
    cy.contains("input your name");
    cy.contains("input your password");
  });

  it("enables account creation", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL") + "/register");

    // Action
    cy.getCy("registerpage-input-name").type("Test User");
    cy.getCy("registerpage-input-username").type("testuser");
    cy.getCy("registerpage-input-email").type("test.user@example.com");
    cy.getCy("registerpage-input-password").type("Really Good Password");
    cy.getCy("registerpage-input-password2").type("Really Good Password");
    cy.getCy("registerpage-submit-button").click();

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/"); // Should be on homepage
    cy.getCy("header-login-button").should("not.exist"); // Should be logged in
  });
});
