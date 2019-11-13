/*
 * For a clean nodemon shutdown, we need to close all our sockets/etc otherwise
 * we might not come up cleanly again (inside nodemon).
 */

export type ShutdownAction = () => any;

function ignore() {}

export function makeShutdownActions(): ShutdownAction[] {
  const shutdownActions: ShutdownAction[] = [];

  function callShutdownActions(): Array<Promise<void> | void> {
    return shutdownActions.map(fn => {
      // Ensure that all actions are called, even if a previous action throws an error
      try {
        return fn();
      } catch (e) {
        return Promise.reject(e);
      }
    });
  }

  function gracefulShutdown(callback: () => void) {
    const promises = callShutdownActions();
    (async () => {
      try {
        await Promise.all(promises);
      } finally {
        // 250ms of sleep before finally shutting down, give things a moment to
        // clear up.
        setTimeout(callback, 250);
      }
    })();
  }

  process.once("SIGUSR2", () => {
    // Ignore further SIGUSR2 signals whilst we're processing
    process.on("SIGUSR2", ignore);
    gracefulShutdown(() => {
      // Re-trigger SIGUSR2 against ourselves cause our exit
      process.removeListener("SIGUSR2", ignore);
      process.kill(process.pid, "SIGUSR2");
    });
  });

  process.once("exit", () => {
    callShutdownActions();
  });

  return shutdownActions;
}
