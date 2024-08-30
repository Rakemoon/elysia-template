import Logging from "#components/Logging";
import RouteRegister from "#components/RouteRegister";
import Elysia from "elysia";
import { LoggingLevel } from "#constants/index";
import { jwt } from "@elysiajs/jwt";
import ErrorHandler from "#components/ErrorHandler";
import LoggingHandler from "#components/LoggingHandler";
import chalk from "chalk";
import { swagger } from "@elysiajs/swagger";

import "reflect-metadata";
import { environtment } from "#constants/env";

type EliOptions = {
  routePath: string;
  port: string;
  title: string;
  version: string;
  description: string;
}

export default class Eli {
  public log: Logging;
  public eli: Elysia;
  public constructor(
    public options: EliOptions,
  ) {
    this.log = new Logging(environtment === "development" ? LoggingLevel.Stdout : LoggingLevel.Silent);
    this.eli = new Elysia();
  }

  public async init() {
    const regRoute = new RouteRegister(this.log, this.eli);

    //Registering Middleware
    new ErrorHandler(this).exec();
    if (this.log.level > LoggingLevel.Silent) new LoggingHandler(this).exec();

    this.eli.use(jwt({ name: "jwt", secret: "Oh-My-JWT" }));
    this.eli.use(swagger({ path: "docs", documentation: {
        info: {
          title: this.options.title,
          version: this.options.version,
          description: this.options.description,
        },
        tags: (await regRoute.collectTags(this.options.routePath)),
        components: {
          securitySchemes: {
            ["Auth Key"]: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            }
          }
        }
      }}));

    // Registering routes
    await regRoute.exec();

  }

  public listen() {
    this.eli.listen(this.options.port);
    this.log.info("🤩 Listening on port", chalk.blue(this.options.port));
  }
}