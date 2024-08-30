import { LoggingLevel } from "#constants/index";

export default class Logging {
  public constructor(
    public level: LoggingLevel
  ) {}

  private get showStdout() {
    return this.level === LoggingLevel.Stdout;
  }

  public info(...args: unknown[]) {
    if (this.showStdout) return console.info(...args);
  }

  public error(...args: unknown[]) {
    if (this.showStdout || this.level === LoggingLevel.JustShowError) return console.error(...args);
  }

  public warn(...args: unknown[]) {
    if (this.showStdout) return console.error(...args);
  }
}
