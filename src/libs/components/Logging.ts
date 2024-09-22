import { LoggingLevel } from "#constants/index";

export default class Logging {
    public constructor(
        public level: LoggingLevel
    ) {}

    private get showStdout() {
        return this.level === LoggingLevel.Stdout;
    }

    public info(...args: unknown[]): void {
        if (this.showStdout) { console.info(...args); }
    }

    public error(...args: unknown[]): void {
        if (this.showStdout || this.level === LoggingLevel.JustShowError) { console.error(...args); }
    }

    public warn(...args: unknown[]): void {
        if (this.showStdout) { console.error(...args); }
    }
}
