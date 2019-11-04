// ***********************************************
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

/// <reference types="Cypress" />

type Chainable = Cypress.Chainable;

function getCy(cyName: string): Chainable {
  return cy.get(`[data-cy=${cyName}]`);
}

function serverCommand(command: "clearTestUsers"): Chainable;
function serverCommand(
  command: "createUser",
  payload: {
    username?: string;
    name?: string;
    verified?: boolean;
    password?: string;
  }
): Chainable;
function serverCommand(
  command: "getEmailSecrets",
  payload?: { email?: string }
): Chainable;
function serverCommand(command: string, payload?: any): Chainable {
  const url = `${Cypress.env(
    "ROOT_URL"
  )}/cypressServerCommand?command=${encodeURIComponent(command)}${
    payload ? `&payload=${encodeURIComponent(JSON.stringify(payload))}` : ""
  }`;
  // GET the url, and return the response body (JSON is parsed automatically)
  return cy.request(url).its("body");
}

function login(payload?: {
  next?: string;
  username?: string;
  name?: string;
  verified?: boolean;
  password?: string;
}): Chainable {
  return cy.visit(
    Cypress.env("ROOT_URL") +
      `/cypressServerCommand?command=login&payload=${encodeURIComponent(
        JSON.stringify(payload)
      )}`
  );
}

Cypress.Commands.add("getCy", getCy);
Cypress.Commands.add("serverCommand", serverCommand);
Cypress.Commands.add("login", login);

export {}; // Make this a module so we can `declare global`

declare global {
  namespace Cypress {
    interface Chainable {
      getCy: typeof getCy;
      serverCommand: typeof serverCommand;
      login: typeof login;
    }
  }
}
