/// <reference types="Cypress" />

context("Verify email", () => {
  beforeEach(() => cy.serverCommand("clearTestUsers"));
  it("can open verification link", () => {
    // Setup
    cy.serverCommand("createUser", {
      username: "testuser",
    }).as("createUserResult");

    // Action
    cy.get("@createUserResult").then(
      ({ userEmailId, verificationToken }: any) => {
        const url = `${Cypress.env("ROOT_URL")}/verify?id=${encodeURIComponent(
          String(userEmailId)
        )}&token=${encodeURIComponent(verificationToken)}`;
        cy.visit(url);
      }
    );

    // Assertion
    cy.contains("Email Verified").should("exist");
  });
});
