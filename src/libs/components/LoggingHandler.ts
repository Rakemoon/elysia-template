import type Eli from "@Eli";
import chalk from "chalk";
import { StatusMap } from "elysia";

export default class LoggingHandler {
  public constructor (private eli: Eli) {}

  public exec() {
    this.eli.eli.onAfterResponse(req => {
      let status = typeof req.set.status === "string" ? StatusMap[req.set.status] : req.set.status;
      const color = (status ?? 500) < 400 ? "green" : "red"
      this.eli.log.info(chalk[color]("\u25cf"), req.request.method, req.route, chalk[color](req.set.status));
    });
  }
}
