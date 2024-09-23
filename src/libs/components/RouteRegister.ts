import path from "node:path/posix";
import chalk from "chalk";
import Elysia, { InvalidCookieSignature } from "elysia";
import type { DocumentDecoration } from "elysia";
import type Logging from "#components/Logging";
import { AuthLevel, RouteMetadata, TokenTypes } from "#constants/index";
import UserService from "#services/UserService";
import Route from "#structures/Route";
import type { Context } from "#structures/Route";
import { readdirRecursive } from "#util/index";

export default class RouteRegister {
    private cache: Route[] = [];

    public constructor(
        public log: Logging,
        public elysia: Elysia
    ) {
        Reflect.set(Route.prototype, "elysia", elysia);
    }

    private async authHandler(level: AuthLevel, ctx: Context) {
        const authorization = Reflect.get(ctx.headers, "authorization");
        if (!(authorization?.startsWith("Bearer ") ?? false) || authorization === undefined) throw new InvalidCookieSignature("Unauthorized Auth");
        const result = await ctx.jwt.verify(authorization.slice(7));
        if (result === false || result.type !== TokenTypes.Access) throw new InvalidCookieSignature("Unauthorized Auth");
        const userLevel = await new UserService(ctx).getUserLevel(result.sub ?? "no-id");
        if (userLevel < level) throw new InvalidCookieSignature("Unauthorized Auth");
        Reflect.set(ctx, "userId", result.sub);
    }

    private doAssignAuth(level: AuthLevel, eli: Elysia) {
        if (level !== AuthLevel.None) eli.onBeforeHandle(this.authHandler.bind(null, level) as never);
    }

    private getMethodLog(method: string) {
        switch (method) {
            case "get": return chalk.green("GET");
            case "post": return chalk.yellowBright("POST");
            case "delete": return chalk.red("DELETE");
            case "put": return chalk.blue("PUT");
            case "patch": return chalk.hex("#FF00FF")("PATCH");
            case "all": return `${chalk.red("A") + chalk.green("L") + chalk.blue("L")} 💅`;
            default: return chalk.blue(method);
        }
    }

    public async collectTags(dir: string): Promise<{ name: string; description: string; }[]> {
        const results: { name: string; description: string; }[] = [];
        for await (const ddir of readdirRecursive(dir)) {
            const mod = await import(ddir) as { default: new (...args: unknown[]) => any; };
            this.log.info(`${chalk.yellow("\u25CF")}\u2500\u253C`, chalk.underline.bgYellow.black("Importing"), chalk.bold(mod.default.name));
            if (Reflect.has(mod, "default") && mod.default.prototype instanceof Route) {
                const route = new (mod.default as (new () => Route))();
                this.cache.push(route);
                if (route.options.name !== undefined) {
                    results.push({
                        name: route.options.name,
                        description: route.options.description ?? ""
                    });
                }
            }
        }
        return results;
    }

    public exec(): typeof this.elysia {
        for (const route of this.cache) {
            const routes: Set<[key: string, method: string, path: string]> =
            Reflect.getMetadata(RouteMetadata.Register, route) as Set<[string, string, string]> | undefined ?? new Set();
            const validations: Map<string, any> = Reflect.getMetadata(RouteMetadata.Validation, route) as Map<string, any> | undefined ?? new Map<string, any>();
            const details: Map<string, any> = Reflect.getMetadata(RouteMetadata.Detail, route) as Map<string, any> | undefined ?? new Map<string, any>();
            const auths: Map<string, AuthLevel> = Reflect.getMetadata(RouteMetadata.AuthLevel, route) as Map<string, AuthLevel> | undefined ?? new Map<string, AuthLevel>();

            const eli = new Elysia();

            if (route.options.authLevel !== undefined) this.doAssignAuth(route.options.authLevel, eli);

            if (route.options.onBefore) eli.onBeforeHandle(ctx => route.options.onBefore?.(ctx as never));
            if (route.options.onAfter) eli.onAfterHandle(ctx => route.options.onAfter?.(ctx as never));

            for (const [key, method, pathname] of routes.values()) {
                const pathroute = path.join("/", route.options.prefix, pathname);
                let authLevel = route.options.authLevel;
                let beforeHandle;
                if (auths.has(key)) {
                    authLevel = auths.get(key);
                    if (authLevel !== undefined) beforeHandle = this.authHandler.bind(null, authLevel);
                }
                this.log.info("  \u251C\u2500\u2500", this.getMethodLog(method), chalk.bold(pathroute));
                if (method === "ws") {
                    eli[method](
                        pathroute,
                        {
                            ...route[key as keyof Route],
                            ...beforeHandle === undefined ? {} : { beforeHandle },
                            ...validations.get(key),
                            detail: {
                                ...details.get(key),
                                security: [authLevel === undefined ? {} : { "Auth Key": [] }]
                            } as DocumentDecoration,
                            tags: route.options.name === undefined ? [] : [route.options.name]
                        }
                    );
                } else {
                    eli[method as "get"](
                        pathroute,
                        (route[key as keyof Route] as Function).bind(route),
                        {
                            ...beforeHandle === undefined ? {} : { beforeHandle },
                            ...validations.get(key),
                            detail: {
                                ...details.get(key),
                                security: [authLevel === undefined ? {} : { "Auth Key": [] }]
                            } as DocumentDecoration,
                            tags: route.options.name === undefined ? [] : [route.options.name]
                        }
                    );
                }
            }
            this.elysia.use(eli);
        }
        return this.elysia;
    }
}
