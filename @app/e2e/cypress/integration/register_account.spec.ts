/// <reference types="Cypress" />

context("RegisterAccount", () => {
  it("can navigate to registration page", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL"));

    // Action
    cy.getCy("header-login-button").click();
    cy.getCy("loginpage-button-register").click();

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/register?next=%2F");
    cy.getCy("registerpage-name-label").should("exist");
  });

  it("requires the form be filled", () => {
    // Setup
    cy.visit(Cypress.env("ROOT_URL") + "/register");

    // Action
    cy.getCy("registerpage-submit-button").click();

    // Assertions
    cy.getCy("registerpage-name-label").should("exist");
    cy.contains("input your name");
    cy.contains("input your passphrase");
  });

  context("Account creation", () => {
    beforeEach(() => cy.serverCommand("clearTestUsers"));

    it("enables account creation", () => {
      // Setup
      cy.visit(Cypress.env("ROOT_URL") + "/register");
      cy.getCy("header-login-button").should("not.exist"); // No login button on register page

      // Action
      cy.getCy("registerpage-input-name").type("Test User");
      cy.getCy("registerpage-input-username").type("testuser");
      cy.getCy("registerpage-input-email").type("test.user@example.com");
      cy.getCy("registerpage-input-password").type("Really Good Password");
      cy.getCy("registerpage-input-password2").type("Really Good Password");
      cy.getCy("registerpage-submit-button").click();

      // Assertions
      cy.url().should("equal", Cypress.env("ROOT_URL") + "/"); // Should be on homepage
      cy.getCy("header-login-button").should("not.exist");
      cy.getCy("layout-dropdown-user").should("contain", "Test User"); // Should be logged in
    });

    it("prevents creation if username is in use", () => {
      // Setup
      cy.serverCommand("createUser", { username: "testuser" });
      cy.visit(Cypress.env("ROOT_URL") + "/register");

      // Action
      cy.getCy("registerpage-input-name").type("Test User");
      cy.getCy("registerpage-input-username").type("testuser");
      cy.getCy("registerpage-input-email").type("test.user@example.com");
      cy.getCy("registerpage-input-password").type("Really Good Password");
      cy.getCy("registerpage-input-password2").type("Really Good Password");
      cy.getCy("registerpage-submit-button").click();

      // Assertions
      cy.contains("account with this username").should("exist");
      cy.getCy("header-login-button").should("not.exist"); // No login button on register page
    });
  });
});
