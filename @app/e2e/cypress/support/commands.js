// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("getCy", cyName => {
  return cy.get(`[data-cy=${cyName}]`);
});

Cypress.Commands.add("serverCommand", (command, payload) => {
  const url = `${Cypress.env(
    "ROOT_URL"
  )}/cypressServerCommand?command=${encodeURIComponent(command)}${
    payload ? `&payload=${encodeURIComponent(JSON.stringify(payload))}` : ""
  }`;
  // GET the url, and return the response body (JSON is parsed automatically)
  return cy.request(url).its("body");
});

Cypress.Commands.add("login", payload => {
  cy.visit(
    Cypress.env("ROOT_URL") +
      `/cypressServerCommand?command=login&payload=${encodeURIComponent(
        JSON.stringify(payload)
      )}`
  );
});
