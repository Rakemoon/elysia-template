import Eli from "@Eli";;
import Route from "#structures/Route";

export default class ErrorHandler {
  public constructor(private eli: Eli) {}

  public exec() {
    this.eli.eli.onError(req => {
      switch(req.code) {
        case "UNKNOWN":
          this.eli.log.error(req.error);
          req.set.status = "Internal Server Error";
          return Route.prototype.json({}, "Unknown Error", "Internal Server Error");
        case "VALIDATION":
          req.set.status = "Bad Request";
          return Route.prototype.json({
            on: req.error.stack?.match(/"on"\: "(.+)"/)?.[1] ?? "unknown",
            summary: req.error.all.map(x => x.summary)
          }, "Validation Error", "Bad Request");
        case "NOT_FOUND":
          this.eli.log.error(req.error);
          req.set.status = "Not Found";
          return Route.prototype.json({}, req.error.message ?? "Route Not Found", "Not Found");
        case "PARSE":
          this.eli.log.error(req.error);
          req.set.status = "Bad Request";
          return Route.prototype.json({}, "Parse Error", "Bad Request");
        case "INTERNAL_SERVER_ERROR":
          this.eli.log.error(req.error);
          req.set.status = "Internal Server Error";
          return Route.prototype.json({}, "Internal Server Error", "Internal Server Error");
        case "INVALID_COOKIE_SIGNATURE":
          if (req.error.key === "failure") {
            req.set.status = "Bad Request";
            return Route.prototype.json({}, req.error.message, "Bad Request");
          }
          if (req.error.key === "Unauthorized Auth") {
            req.set.status = "Unauthorized";
            return Route.prototype.json({}, "Unauthorized Please Login!", "Unauthorized");
          }
          this.eli.log.error(req.error);
          req.set.status = "Bad Request";
          return Route.prototype.json({}, "Invalid Cookie Signature", "Bad Request");
      }
    });
  }
}
