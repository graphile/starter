/*
 * For a clean nodemon shutdown, we need to close all our sockets/etc otherwise
 * we might not come up cleanly again (inside nodemon).
 */

export type ShutdownAction = () => void | Promise<void>;

function ignore() {}

export function makeShutdownActions(): ShutdownAction[] {
  const shutdownActions: ShutdownAction[] = [];

  let shutdownActionsCalled = false;
  function callShutdownActions(): Array<Promise<void> | void> {
    if (shutdownActionsCalled) {
      return [];
    }
    shutdownActionsCalled = true;
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
    if (promises.length === 0) {
      return callback();
    }

    let called = false;
    function callbackOnce() {
      if (!called) {
        called = true;
        callback();
      }
    }

    // Guarantee the callback will be called
    const guaranteeCallback = setTimeout(callbackOnce, 3000);
    guaranteeCallback.unref();

    (async () => {
      try {
        await Promise.all(promises);
      } finally {
        // Sleep before finally shutting down, give things a moment to
        // clear up (particularly the inspector port)
        setTimeout(callbackOnce, 250);
      }
    })();
  }

  process.once("SIGHUP", () => {
    // Ignore further SIGHUP signals whilst we're processing
    process.on("SIGHUP", ignore);
    gracefulShutdown(() => {
      process.kill(process.pid, "SIGHUP");
      process.exit(1);
    });
  });

  process.once("exit", () => {
    callShutdownActions();
  });

  return shutdownActions;
}
