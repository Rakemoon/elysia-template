import Logging from "#components/Logging";
import RouteRegister from "#components/RouteRegister";
import Elysia from "elysia";
import type { LoggingLevel } from "./constants";
import Route from "#structures/Route";
import chalk from "chalk";

type EliOptions = {
  routePath: string;
  logLevel: LoggingLevel;
  port: string;
}

export default class Eli {
  public log: Logging;
  public eli: Elysia;
  public constructor(
    public options: EliOptions,
  ) {
    this.log = new Logging(this.options.logLevel);
    this.eli = new Elysia();
  }

  public async init() {
    //Registering Middleware
    this.eli.onError(req => {
      switch(req.code) {
        case "UNKNOWN":
          this.log.error(req.error);
          req.set.status = "Internal Server Error";
          return Route.prototype.json({}, "Unknown Error", "Internal Server Error");
        case "VALIDATION":
          req.set.status = "Bad Request";
          return Route.prototype.json({
            on: req.error.stack?.match(/"on"\: "(.+)"/)?.[1] ?? "unknown",
            summary: req.error.all.map(x => x.summary)
          }, "Validation Error", "Bad Request");
        case "NOT_FOUND":
          this.log.error(req.error);
          req.set.status = "Not Found";
          return Route.prototype.json({}, "Route Not Found", "Not Found");
        case "PARSE":
          this.log.error(req.error);
          req.set.status = "Bad Request";
          return Route.prototype.json({}, "Parse Error", "Bad Request");
        case "INTERNAL_SERVER_ERROR":
          this.log.error(req.error);
          req.set.status = "Internal Server Error";
          return Route.prototype.json({}, "Internal Server Error", "Internal Server Error");
        case "INVALID_COOKIE_SIGNATURE":
          this.log.error(req.error);
          req.set.status = "Bad Request";
          return Route.prototype.json({}, "Invalid Cookie Signature", "Bad Request");
      }
    });

    this.eli.onAfterResponse(req => {
      const color = req.set.status === "OK" || req.set.status === 200 ? "green" : "red"
      this.log.info(chalk[color]("\u25cf"), req.request.method, req.route, chalk[color](req.set.status));
    });

    // Registering routes
    await new RouteRegister(this.log, this.eli).exec(this.options.routePath);

  }

  public listen() {
    this.eli.listen(this.options.port);
    this.log.info("Listening on port", this.options.port);
  }
}
