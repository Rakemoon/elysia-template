import { type AuthLevel, ServiceNames } from "#constants/index";
import type { JWTPayloadSpec } from "@elysiajs/jwt";
import { StatusMap, type Handler } from "elysia";
import TokenService from "../services/TokenService";
import UserService from "../services/UserService";

export type RouteOptions = {
  name?: string;
  description?: string;
  prefix: string;
  authLevel?: AuthLevel;
  onBefore?: <T extends Context>(req: T) => unknown;
  onAfter?: <T extends Context>(req: T) => unknown;
}

type EliReq = Parameters<Handler>[0] & {
  jwt: {
    verify(jwt?: string): Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
    sign(morePayload: Record<string, string | number> & JWTPayloadSpec): Promise<string>
  }
}

export type Context<T extends object = {}> = {
  [k in keyof EliReq]
  : k extends keyof T 
  ? T[k] 
  : EliReq[k]
};

export default abstract class Route {
  public constructor(
    public options: RouteOptions
  ) {}

  public json<Data extends object>(data: Data, message = "", status: keyof StatusMap = "OK") {
    return {
      status: StatusMap[status],
      message,
      data
    }
  }

  protected useService<Name extends ServiceNames>(ctx: Context<any>, name: Name)
  : [
      TokenService,
      UserService
    ][Name] {
    switch (name) {
      case ServiceNames.Token: return new TokenService(ctx) as never;
      case ServiceNames.User: return new UserService(ctx) as never;
      default: return new TokenService(ctx) as never;
    }
  }
}
