import path from "node:path";
import { readFile } from "#util/index";
import Eli from "@Eli";

const { version } = await readFile<"json", { version: string; }>(path.join(import.meta.dirname, "../package.json"), "json");

const eli = new Eli({
    port: "8080",
    routePath: path.join(import.meta.dirname, "./routes"),
    title: "Inventory System",
    description: "Inventory management that just like you!",
    version
});

await eli.init();

eli.listen();
