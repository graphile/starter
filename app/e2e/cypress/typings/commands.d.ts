export {}; // Make this a module

declare global {
  namespace Cypress {
    interface Chainable {
      getCy: (name: string) => Chainable;
      serverCommand(command: "clearTestUsers"): Chainable;
      serverCommand(
        command: "createUser",
        payload: {
          username?: string;
          name?: string;
          verified?: boolean;
          password?: string;
        }
      ): Chainable;
      serverCommand(
        command: "getEmailSecrets",
        payload?: { email?: string }
      ): Chainable;
      login(payload?: {
        next?: string;
        username?: string;
        name?: string;
        verified?: boolean;
        password?: string;
      }): Chainable;
    }
  }
}
