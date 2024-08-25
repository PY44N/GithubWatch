export class ExitHandler {
  constructor(on_exit) {
    let callback = on_exit || (() => {});

    // do something when app is closing
    process.on(
      "exit",
      this.exitHandler.bind(null, { cleanup: true, callback })
    );

    // catches ctrl+c event
    process.on("SIGINT", this.exitHandler.bind(null, { exit: true, callback }));

    // catches "kill pid" (for example: nodemon restart)
    process.on(
      "SIGUSR1",
      this.exitHandler.bind(null, { exit: true, callback })
    );
    process.on(
      "SIGUSR2",
      this.exitHandler.bind(null, { exit: true, callback })
    );

    // catches uncaught exceptions
    process.on(
      "uncaughtException",
      this.exitHandler.bind(null, { exit: true, callback })
    );
  }

  exitHandler(options, exitCode) {
    if (options.cleanup) options.callback();
    // if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
  }
}
