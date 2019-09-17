/// <reference types="Cypress" />

const PASSWORD = "MyPassword1";

context("Login", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));

  it("can log in", () => {
    // Setup
    cy.serverCommand("createUser", {
      username: "testuser",
      name: "Test User",
      verified: true,
      password: PASSWORD,
    });
    cy.visit(Cypress.env("ROOT_URL") + "/login");

    // Action
    cy.getCy("loginpage-input-username").type("testuser");
    cy.getCy("loginpage-input-password").type(PASSWORD);
    cy.getCy("loginpage-button-submit").click();

    // Assertion
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/"); // Should be on homepage
    cy.getCy("header-login-button").should("not.exist"); // Should be logged in
    cy.getCy("layout-dropdown-user").should("contain", "Test User"); // Should be logged in
  });
});
