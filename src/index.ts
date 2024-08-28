import "reflect-metadata";

import path from "node:path";
import Eli from "@Eli";
import { LoggingLevel } from "#constants/index";

const eli = new Eli({
  port: "8080",
  logLevel: LoggingLevel.Stdout,
  routePath: path.join(import.meta.dirname, "./routes"),
  title: "Inventory System",
  description: "Inventory management that just like you!",
  version: "1.0.0"
});

await eli.init();

eli.listen();
