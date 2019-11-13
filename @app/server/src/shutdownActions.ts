/*
 * For a clean nodemon shutdown, we need to close all our sockets/etc otherwise
 * we might not come up cleanly again (inside nodemon).
 */

export type ShutdownAction = () => any;

export function makeShutdownActions(): ShutdownAction[] {
  const shutdownActions: ShutdownAction[] = [];

  function gracefulShutdown(callback: () => void) {
    const promises = shutdownActions.map(fn => fn());
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
    gracefulShutdown(() => {
      process.kill(process.pid, "SIGUSR2");
    });
  });

  process.once("exit", () => {
    shutdownActions.map(fn => fn());
  });

  return shutdownActions;
}
