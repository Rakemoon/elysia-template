import { StatusMap, type Handler } from "elysia";

export type RouteOptions = {
  prefix: string;
  onBefore?: <T extends Context>(req: T) => unknown;
  onAfter?: <T extends Context>(req: T) => unknown;
}

type EliReq = Parameters<Handler>[0];

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

  public json(data: object, message = "", status: keyof StatusMap = "OK") {
    return {
      status: StatusMap[status],
      message,
      data
    }
  }
}
