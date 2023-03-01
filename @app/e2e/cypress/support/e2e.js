// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on("uncaught:exception", (err) => {
  // This error can be ignored: https://stackoverflow.com/a/50387233/2067611
  // > This error means that ResizeObserver was not able to deliver
  // > all observations within a single animation frame.
  // > It is benign (your site will not break).
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
});
