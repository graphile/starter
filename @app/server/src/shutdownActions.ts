/*
 * For a clean nodemon shutdown, we need to close all our sockets/etc otherwise
 * we might not come up cleanly again (inside nodemon).
 */

export type ShutdownAction = () => any;

export function makeShutdownActions(): ShutdownAction[] {
  const shutdownActions: ShutdownAction[] = [];

  async function gracefulShutdown(callback: () => void) {
    try {
      await Promise.all(shutdownActions.map(fn => fn()));
    } finally {
      // 250ms of sleep before finally shutting down, give things a moment to
      // clear up.
      setTimeout(callback, 250);
    }
  }

  process.once("SIGUSR2", () => {
    gracefulShutdown(() => {
      process.kill(process.pid, "SIGUSR2");
    });
  });

  return shutdownActions;
}
