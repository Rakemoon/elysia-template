import type { JWTPayloadSpec } from "@elysiajs/jwt";
import { StatusMap } from "elysia";
import type Elysia from "elysia";
import type { Handler } from "elysia";
import { ServiceNames } from "#constants/index";
import type { AuthLevel } from "#constants/index";
import EmailService from "#services/EmailService";
import TokenService from "#services/TokenService";
import UserService from "#services/UserService";

export type RouteOptions = {
    name?: string;
    description?: string;
    prefix: string;
    authLevel?: AuthLevel;
    onBefore?<T extends Context>(req: T): unknown;
    onAfter?<T extends Context>(req: T): unknown;
};

type EliReq = Parameters<Handler>[0] & {
    jwt: {
        verify(jwt?: string): Promise<false | (JWTPayloadSpec & Record<string, number | string>)>;
        sign(morePayload: JWTPayloadSpec & Record<string, number | string>): Promise<string>;
    };
    userId?: string;
};

export type Context<T extends object = {}> = {
    [k in keyof EliReq]: k extends keyof T
        ? T[k]
        : EliReq[k]
};

export default abstract class Route {
    declare protected elysia: Elysia;
    public constructor(
        public options: RouteOptions = { prefix: "_no_prefixes_" }
    ) {}

    public json
    <Data,
        Message extends string = "",
        Status extends keyof StatusMap = "OK">(data: Data, message?: Message, status?: Status) {
        return {
            status: StatusMap[status ?? "OK"] as typeof status extends undefined ? 200 : StatusMap[Status],
            message: message as typeof message extends undefined ? "" : Message,
            data
        };
    }

    protected useService<Name extends ServiceNames>(ctx: Context<any>, name: Name): [
        TokenService,
        UserService,
        EmailService
    ][Name] {
        switch (name) {
            case ServiceNames.Token: return new TokenService(ctx) as never;
            case ServiceNames.User: return new UserService(ctx) as never;
            case ServiceNames.Email: return new EmailService(ctx) as never;
            default: return new TokenService(ctx) as never;
        }
    }
}
