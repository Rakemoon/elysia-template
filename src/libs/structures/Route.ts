import { type Handler } from "elysia";

export type RouteOptions = {
  prefix: string;
}

export type RouteReq = Parameters<Handler>[0];

export default abstract class Route {
  public constructor(
    public options: RouteOptions
  ) {}
}
