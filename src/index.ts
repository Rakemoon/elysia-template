import path from "node:path";
import Eli from "@Eli";
import { LoggingLevel } from "#constants/index";
import { readFile } from "#util/index";

const { version } = await readFile(path.join(import.meta.dirname, "../package.json"), "json");

const eli = new Eli({
  port: "8080",
  routePath: path.join(import.meta.dirname, "./routes"),
  title: "Inventory System",
  description: "Inventory management that just like you!",
  version,
});

await eli.init();

eli.listen();
