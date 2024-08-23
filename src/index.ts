import "reflect-metadata";

import RouteRegister from "./libs/components/RouteRegister";
import path from "node:path";

const register = new RouteRegister()
const eli = await register.exec(path.join(import.meta.dirname, "./routes"));

eli.listen("8080");
