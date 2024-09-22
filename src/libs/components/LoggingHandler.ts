import chalk from "chalk";
import { StatusMap } from "elysia";
import type Eli from "@Eli";

export default class LoggingHandler {
    public constructor(private readonly eli: Eli) {}

    public exec(): void {
        this.eli.eli.onAfterResponse(req => {
            const status = typeof req.set.status === "string" ? StatusMap[req.set.status] : req.set.status;
            const color = (status ?? 500) < 400 ? "green" : "red";
            this.eli.log.info(chalk[color]("\u25CF"), req.request.method, req.route, chalk[color](req.set.status));
        });
    }
}
