import Elysia, { InvalidCookieSignature, type DocumentDecoration } from "elysia";
import Route, { type Context } from "#structures/Route";
import { readdirRecursive } from "#util/index";
import { AuthLevel, RouteMetadata, TokenTypes } from "#constants/index";
import type Logging from "#components/Logging";
import path from "node:path/posix";
import UserService from "#services/UserService";
import chalk from "chalk";

export default class RouteRegister {

  private cache: Route[] = [];

  public constructor(
    public log: Logging,
    public elysia: Elysia,
  ) {}

  private async authHandler(level: AuthLevel, ctx: Context) {
    const authorization = Reflect.get(ctx.headers, "authorization"); 
    if (!authorization || !authorization.startsWith("Bearer ")) throw new InvalidCookieSignature("Unauthorized Auth");
    const result = await (ctx as Context).jwt.verify(authorization.slice(7));
    if (!result || result.type !== TokenTypes.Access) throw new InvalidCookieSignature("Unauthorized Auth");
    const userLevel = await new UserService(ctx as Context).getUserLevel(result.sub ?? "no-id");
    if (userLevel === undefined || userLevel < level) throw new InvalidCookieSignature("Unauthorized Auth");
    Reflect.set(ctx, "userId", result.sub);
  }

  private doAssignAuth(level: AuthLevel, eli: Elysia) {
    if (level !== AuthLevel.None) eli.onBeforeHandle(this.authHandler.bind(null, level) as never);
  }

  private getMethodLog(method: string) {
    switch(method) {
      case "get": return chalk.green("GET");
      case "post": return chalk.yellowBright("POST");
      case "delete": return chalk.red("DELETE");
      case "put": return chalk.blue("PUT");
      case "patch": return chalk.hex("#FF00FF")("PATCH");
      case "all": return chalk.red("A") + chalk.green("L") + chalk.blue("L") + " 💅";
    }
  }

  public async collectTags(dir: string) {
    const results: { name: string; description: string }[] = [];
    for await (const d of readdirRecursive(dir)) {
      const mod = await import(d);
      this.log.info(chalk.yellow("\u25cf") + "\u2500\u253c", chalk.underline.bgYellow.black("Importing"), chalk.bold(mod.default.name));
      if (Reflect.has(mod, "default")) {
        if (mod.default?.prototype instanceof Route) {
          const route = new (mod.default as (new () => Route))();
          this.cache.push(route);
          if (route.options.name) results.push({
            name: route.options.name,
            description: route.options.description ?? "",
          });
        }
      }
    }
    return results;
  }

  public async exec() {
    for (const route of this.cache) {
      const routes: Set<[key: string, method: string, path: string]> = Reflect.getMetadata(RouteMetadata.Register, route) ?? new Set();
      const validations: Map<string, any> = Reflect.getMetadata(RouteMetadata.Validation, route) ?? new Map();
      const details: Map<string, any> = Reflect.getMetadata(RouteMetadata.Detail, route) ?? new Map();
      const auths: Map<string, AuthLevel> = Reflect.getMetadata(RouteMetadata.AuthLevel, route) ?? new Map();

      const eli = new Elysia();

      if (route.options.authLevel) this.doAssignAuth(route.options.authLevel, eli);

      if (route.options.onBefore) eli.onBeforeHandle(route.options.onBefore as any);
      if (route.options.onAfter) eli.onAfterHandle(route.options.onAfter as any);


      for (const [key, method, pathname] of routes.values()) {
        const pathroute = path.join("/", route.options.prefix, pathname);
        let authLevel = route.options.authLevel;
        let beforeHandle;
        if (auths.has(key)) {
          authLevel = auths.get(key);
          if (authLevel) beforeHandle = this.authHandler.bind(null, authLevel);
        }
        this.log.info("  \u251c\u2500\u2500", this.getMethodLog(method), chalk.bold(pathroute));
        eli[method as "get"](
          pathroute,
          (route[key as keyof Route] as Function).bind(route), 
          {
            ...(beforeHandle !== undefined ? { beforeHandle: beforeHandle } : {}),
            ...(validations.get(key) ?? {}),
            detail: {
              ...(details.get(key) ?? {}),
              security: [authLevel ? { ["Auth Key"]: [] } : {}],
            } as DocumentDecoration,
            tags: route.options.name ? [route.options.name] : [],
          }
        );
      }
      this.elysia.use(eli);
    }
    return this.elysia;
  }
}
