import cors from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import chalk from "chalk";
import Elysia from "elysia";
import ErrorHandler from "#components/ErrorHandler";
import Logging from "#components/Logging";
import LoggingHandler from "#components/LoggingHandler";
import RouteRegister from "#components/RouteRegister";
import { environtment, jwt as configJwt } from "#constants/env";
import { LoggingLevel } from "#constants/index";

import "reflect-metadata";
import EmailService from "#services/EmailService";

type EliOptions = {
    routePath: string;
    port: string;
    title: string;
    version: string;
    description: string;
};

export default class Eli {
    public log: Logging;
    public eli = new Elysia();
    public constructor(
        public options: EliOptions
    ) {
        this.log = new Logging(environtment === "development" ? LoggingLevel.Stdout : LoggingLevel.Silent);
    }

    public async init(): Promise<void> {
        if (environtment !== "test") await EmailService.initTransport(this.log);
        const regRoute = new RouteRegister(this.log, this.eli);

        // Registering Middleware
        new ErrorHandler(this).exec();
        if (this.log.level > LoggingLevel.Silent) new LoggingHandler(this).exec();

        this.eli.use(cors({
            origin: ["*"],
            methods: ["GET"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: false
        }));
        this.eli.use(jwt({ name: "jwt", secret: configJwt.secret }));
        this.eli.use(swagger({
            path: "docs",
            documentation: {
                info: {
                    title: this.options.title,
                    version: this.options.version,
                    description: this.options.description
                },
                tags: await regRoute.collectTags(this.options.routePath),
                components: {
                    securitySchemes: {
                        "Auth Key": {
                            type: "http",
                            scheme: "bearer",
                            bearerFormat: "JWT"
                        }
                    }
                }
            }
        }));

        // Registering routes
        regRoute.exec();
    }

    public listen(): void {
        this.eli.listen(this.options.port);
        this.log.info("🤩 Listening on port", chalk.blue(this.options.port));
    }
}
