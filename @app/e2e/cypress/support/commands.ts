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

type Chainable<Subject = any> = Cypress.Chainable<Subject>;

type User = {
  id: string;
  username: string;
  name: string;
  is_admin: boolean;
  is_verified: boolean;
};

function getCy(cyName: string): Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-cy=${cyName}]`);
}

/**
 * Deletes all users with username starting 'test'.
 */
function serverCommand(command: "clearTestUsers"): Chainable<{
  success: true;
}>;

/**
 * Deletes all organizations with slug starting 'test'.
 */
function serverCommand(command: "clearTestOrganizations"): Chainable<{
  success: true;
}>;

/**
 * Creates a verified or unverified user, bypassing all safety checks.
 * Redirects to `next`.
 *
 * Default values:
 *
 * - username: `testuser`
 * - email: `${username}@example.com`
 * - verified: false
 * - name: `${username}`
 * - password: `TestUserPassword`
 * - next: `/`
 */
function serverCommand(
  command: "createUser",
  payload: {
    username?: string;
    email?: string;
    verified?: boolean;
    name?: string;
    password?: string;
    next?: string;
  }
): Chainable<{
  user: User;
  userEmailId: string;
  verificationToken: string | null;
}>;

/**
 * Gets the secrets for the specified email, allowing Cypress to perform email
 * validation. If unspecified, email defaults to `testuser@example.com`.
 */
function serverCommand(
  command: "getEmailSecrets",
  payload?: { email?: string }
): Chainable<{
  user_email_id: string;
  verification_token: string | null;
}>;

// The actual implementation of the 'serverCommand' function.
function serverCommand(command: string, payload?: any): any {
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
  orgs?: [[string, string] | [string, string, boolean]];
}): Chainable<Window> {
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
