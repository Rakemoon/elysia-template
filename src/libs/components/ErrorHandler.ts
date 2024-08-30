import Eli from "@Eli";;
import Route from "#structures/Route";
import type { ErrorHandler as ElysiaErrorHandler, } from "elysia";

export default class ErrorHandler {
  public constructor(private eli: Eli) {}

  private handler(ctx: Parameters<ElysiaErrorHandler>[0]) {
    switch(ctx.code) {
      case "UNKNOWN":
        this.eli.log.error(ctx.error);
        ctx.set.status = "Internal Server Error";
        return Route.prototype.json(null, "Unknown Error", "Internal Server Error");
      case "VALIDATION":
        ctx.set.status = "Bad Request";
        return Route.prototype.json({
          on: ctx.error.stack?.match(/"on"\: "(.+)"/)?.[1] ?? "unknown",
          summary: ctx.error.all.map(x => x.summary)
        }, "Validation Error", "Bad Request");
      case "NOT_FOUND":
        this.eli.log.error(ctx.error);
        ctx.set.status = "Not Found";
        return Route.prototype.json(null, ctx.error.message as "-Not Found Message- *Dont Use this as Equal Matcher" ?? "Route Not Found", "Not Found");
      case "PARSE":
        this.eli.log.error(ctx.error);
        ctx.set.status = "Bad Request";
        return Route.prototype.json(null, "Parse Error", "Bad Request");
      case "INTERNAL_SERVER_ERROR":
        this.eli.log.error(ctx.error);
        ctx.set.status = "Internal Server Error";
        return Route.prototype.json(null, "Internal Server Error", "Internal Server Error");
      case "INVALID_COOKIE_SIGNATURE":
        if (ctx.error.key === "failure") {
          ctx.set.status = "Bad Request";
          return Route.prototype.json(null, ctx.error.message as "-FAILURE MESSAGE!- *Dont Use this as Equal Matcher", "Bad Request");
        }
        if (ctx.error.key === "Unauthorized Auth") {
          ctx.set.status = "Unauthorized";
          return Route.prototype.json(null, "Unauthorized Please Login!", "Unauthorized");
        }
        this.eli.log.error(ctx.error);
        ctx.set.status = "Bad Request";
        return Route.prototype.json(null, "Invalid Cookie Signature", "Bad Request");
    }
  };

  public exec() {
    this.eli.eli.onError(this.handler.bind(this));
  }
}
