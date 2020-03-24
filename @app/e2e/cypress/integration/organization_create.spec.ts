/// <reference types="Cypress" />

context("Create organizations", () => {
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
    cy.getCy("layout-header-title").contains("Test Organization");
    cy.getCy("layout-header-titlelink")
      .invoke("attr", "href")
      .should("equal", "/o/test-organization");
  });

  it("handles conflicting organization name", () => {
    // Setup
    cy.login({
      next: "/",
      verified: true,
      orgs: [["Test Organization", "test-organization"]],
    });

    // Action
    cy.getCy("layout-dropdown-user").trigger("mouseover");
    cy.getCy("layout-link-create-organization").click();
    cy.url().should("equal", Cypress.env("ROOT_URL") + "/create-organization");
    cy.getCy("createorganization-input-name").type("Test Organization");
    cy.getCy("createorganization-slug-value").contains("test-organization");

    // Assertion
    cy.getCy("createorganization-hint-nameinuse").should("exist");
    cy.getCy("createorganization-button-create").click();
    cy.getCy("createorganization-alert-nuniq").should("exist");
  });
});
