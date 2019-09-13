export {}; // Make this a module
declare global {
  namespace Cypress {
    interface Chainable {
      getCy: (name: string) => Chainable;
    }
  }
}
