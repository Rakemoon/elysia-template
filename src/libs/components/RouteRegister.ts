import Elysia from "elysia";
import Route from "#structures/Route";
import { readdirRecursive } from "#util/index";
import { RouteMetadata } from "#constants/index";
import type Logging from "#components/Logging";
import path from "node:path/posix";

export default class RouteRegister {
  public constructor(
    public log: Logging,
    public elysia: Elysia,
  ) {}

  public async exec(dir: string) {
    for await (const d of readdirRecursive(dir)) {
      const mod = await import(d);
      if (Reflect.has(mod, "default")) {
        if (mod.default?.prototype instanceof Route) {
          this.log.info("Importing", mod.default.name);
          const route = new (mod.default as (new () => Route))();
          const routes: Map<string, [key: string, method: string]> = Reflect.getMetadata(RouteMetadata.Register, route) ?? new Map();
          const validations: Map<string, any> = Reflect.getMetadata(RouteMetadata.Validation, route) ?? new Map();
          const eli = new Elysia();

          if (route.options.onBefore) eli.onBeforeHandle(route.options.onBefore);
          if (route.options.onAfter) eli.onAfterHandle(route.options.onAfter);

          for (const [pathname, [key, method]] of routes.entries()) {
            eli[method as "get"](
              path.join("/", route.options.prefix, pathname), 
              (route[key as keyof Route] as Function).bind(route), 
              validations.get(key) ?? {});
          }
          this.elysia.use(eli);
        }
      }
    }
    return this.elysia;
  }
}
