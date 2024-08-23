import Route from "#structures/Route";
import Elysia from "elysia";
import { readdirRecursive } from "../util";

export default class RouteRegister {
  public async exec(dir: string) {
    const elysia = new Elysia();
    for await (const d of readdirRecursive(dir)) {
      console.log("Importing", d);
      const mod = await import(d);
      if (Reflect.has(mod, "default")) {
        if (mod.default?.prototype instanceof Route) {
          console.log("Detected Constructor");
          const eli = new (mod.default as (new () => Route))();
          const routes: Map<string, [key: string, method: string]> = Reflect.getMetadata("route:register", eli) ?? new Map();
          const elinew = new Elysia();
          for (const [path, [key, method]] of routes.entries()) {
            elinew[method as "get"](`${eli.options.prefix}${path}`, eli[key as keyof Route]);
          }
          elysia.use(elinew);
        }
      }
    }
    return elysia;
  }
}
