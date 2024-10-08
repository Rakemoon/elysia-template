/* eslint-disable typescript/no-unnecessary-condition */
/* eslint-disable typescript/strict-boolean-expressions */
import path from "node:path/posix";
import { URLSearchParams } from "node:url";
import type ErrorHandler from "#components/ErrorHandler";
import { RouteMetadata } from "#constants/index";
import type Route from "#structures/Route";
import type { Context } from "#structures/Route";
import type Eli from "@Eli";

type TestResponse<Body> = Omit<Response, "body" | "json" | "text"> & { bodyResult: Body; };

type GetCredentials<T> = T extends (ctx: Context<infer C>) => any
    ? C
    : never;

export default class RouteTest<BaseRoute extends Route> {
    public declare _controllerTypes: Pick<BaseRoute, {
        [k in keyof BaseRoute]-?: k extends keyof Route ? never
            : BaseRoute[k] extends (ctx: Context<any>) => any ? k : never;
    }[keyof BaseRoute]>;

    public declare _errorResponse: ReturnType<ErrorHandler["handler"]>;

    public routes = new Map<string, [path: string, method: string]>();

    public constructor(
        protected eli: Eli,
        protected base: BaseRoute
    ) {
        const registerData: Set<[string, string, string]> = (Reflect.getMetadata(RouteMetadata.Register, this.base) ?? new Set()) as never;
        for (const [key, method, pathness] of registerData.values()) {
            this.routes.set(key, [
                `http://${path.join("localhost", this.base.options.prefix, pathness)}`,
                method
            ]);
        }
    }

    public async req
    <Controller extends keyof typeof this._controllerTypes>(controller: Controller,
        credentials?: Partial<GetCredentials<typeof this._controllerTypes[Controller]> & { authorization: string; }>): Promise<
            TestResponse<
                typeof this._errorResponse | (typeof this._controllerTypes[Controller] extends (ctx: Context<any>) => infer Return
                    ? Return extends PromiseLike<infer R>
                        ? R
                        : Return
                    : never)
            >> {
        const pathroute = this.routes.get(controller as string);
        if (!pathroute) throw new ReferenceError(`'${this.base.constructor.name}#${String(controller)}' doesnt invoked by @Mount decorator!`);
        let url = pathroute[0];
        const init: RequestInit = {
            method: pathroute[1] === "all" ? "get" : pathroute[1]
        };

        if (credentials) {
            const body = Reflect.get(credentials, "body");
            const params = Reflect.get(credentials, "params");
            const query = Reflect.get(credentials, "query");
            const authorization = Reflect.get(credentials, "authorization");

            if (authorization) {
                init.headers ??= {};
                (init.headers as Record<string, string>).Authorization = authorization;
            }

            if (body) {
                init.body = JSON.stringify(body);
                init.headers ??= {};
                (init.headers as Record<string, string>)["Content-Type"] = "application/json";
            }

            // eslint-disable-next-line guard-for-in
            if (params) for (const key in params) url = url.replace(`:${key}`, params[key] as string);
            if (query) url += `?${new URLSearchParams(query).toString()}`;
        }

        const response = await this.eli.eli.handle(new Request(url, init));
        let result = await response.text();
        try {
            result = JSON.parse(result) as never;
        } finally {
            Reflect.set(response, "bodyResult", result);
        }
        return response as never;
    }
}
