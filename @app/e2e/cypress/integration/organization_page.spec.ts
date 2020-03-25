/// <reference types="Cypress" />

context("Organization page", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));
  beforeEach(() => cy.serverCommand("clearTestOrganizations"));

  it("renders for owner", () => {
    // Setup
    cy.login({
      next: "/o/test-organization",
      verified: true,
      orgs: [["Test Organization", "test-organization"]],
    });

    // Action

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/o/test-organization");
    cy.getCy("layout-header-title").contains("Test Organization");
    cy.getCy("layout-header-titlelink")
      .invoke("attr", "href")
      .should("equal", "/o/test-organization");
    cy.getCy("organizationpage-button-settings").should("exist");
  });

  it("renders 404 for logged out user", () => {
    // Setup
    cy.login({
      next: "/o/test-organization",
      verified: true,
      orgs: [["Test Organization", "test-organization"]],
    });
    cy.visit(Cypress.env("ROOT_URL") + "/logout");
    cy.visit(Cypress.env("ROOT_URL") + "/o/test-organization");

    // Action

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/o/test-organization");
    cy.getCy("fourohfour-div").should("exist");
  });

  it("renders without settings link for non-owner member", () => {
    // Setup
    cy.login({
      next: "/o/test-organization",
      verified: true,
      orgs: [["Test Organization", "test-organization", false]],
    });

    // Action

    // Assertions
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/o/test-organization");
    cy.getCy("layout-header-title").contains("Test Organization");
    cy.getCy("layout-header-titlelink")
      .invoke("attr", "href")
      .should("equal", "/o/test-organization");
    cy.getCy("organizationpage-button-settings").should("not.exist");
  });
});
