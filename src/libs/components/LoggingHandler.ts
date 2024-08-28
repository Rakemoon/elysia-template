import type Eli from "@Eli";
import chalk from "chalk";

export default class LoggingHandler {
  public constructor (private eli: Eli) {}

  public exec() {
    this.eli.eli.onAfterResponse(req => {
      const color = req.set.status === "OK" || req.set.status === 200 ? "green" : "red"
      this.eli.log.info(chalk[color]("\u25cf"), req.request.method, req.route, chalk[color](req.set.status));
    });
  }
}
