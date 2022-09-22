/// <reference types="Cypress" />

export {};

const PASSWORD = "MyPassword1";

context("Subscriptions", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));

  it("can log in; current user subscription works", () => {
    // Setup
    cy.serverCommand("createUser", {
      username: "testuser",
      name: "Test User",
      verified: false,
      password: PASSWORD,
    });
    cy.visit(Cypress.env("ROOT_URL") + "/login");
    cy.getCy("loginpage-button-withusername").click();
    cy.getCy("header-login-button").should("not.exist"); // No login button on login page

    // Action
    cy.getCy("loginpage-input-username").type("testuser");
    cy.getCy("loginpage-input-password").type(PASSWORD);
    cy.getCy("loginpage-button-submit").click();

    // Assertion
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/"); // Should be on homepage
    cy.getCy("header-login-button").should("not.exist"); // Should be logged in
    cy.getCy("layout-dropdown-user").should("contain", "Test User"); // Should be logged in

    // Subscription
    cy.getCy("header-unverified-warning").should("exist");
    cy.wait(1000); // allow the websocket to reconnect
    cy.serverCommand("verifyUser");
    cy.getCy("header-unverified-warning").should("not.exist");
  });

  it("can start on an already logged-in session; current user subscription works", () => {
    // Setup
    cy.login({ next: "/", verified: false });

    // Subscription
    cy.getCy("header-unverified-warning").should("exist");
    cy.wait(1000); // allow the websocket to reconnect
    cy.serverCommand("verifyUser");
    cy.getCy("header-unverified-warning").should("not.exist");
  });

  it("can register; current user subscription works", () => {
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

    // Subscription
    cy.getCy("header-unverified-warning").should("exist");
    cy.wait(1000); // allow the websocket to reconnect
    cy.serverCommand("verifyUser");
    cy.getCy("header-unverified-warning").should("not.exist");
  });
});
