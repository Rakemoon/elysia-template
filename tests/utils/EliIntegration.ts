import path from "node:path";
import Eli from "@Eli";
import { readFile } from "#util/index";

const { version } = await readFile(path.join(import.meta.dirname, "../../package.json"), "json");

const EliTest = new Eli({
  port: "8080",
  routePath: path.join(import.meta.dirname, "../../src/routes"),
  title: "Inventory System Testing",
  description: "Test Suite for Inventory system",
  version,
});

await EliTest.init();

export default EliTest;
