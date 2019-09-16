export { }; // Make this a module
type ServerCommands = "clearTestUsers";

declare global {
  namespace Cypress {
    interface Chainable {
      getCy: (name: string) => Chainable;
      serverCommand: (command: ServerCommands) => Chainable;
    }
  }
}
