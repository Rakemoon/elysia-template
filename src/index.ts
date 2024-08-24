import "reflect-metadata";

import path from "node:path";
import Eli from "@Eli";
import { LoggingLevel } from "#constants/index";

const eli = new Eli({
  port: "8080",
  logLevel: LoggingLevel.Stdout,
  routePath: path.join(import.meta.dirname, "./routes")
});

await eli.init();

eli.listen();
