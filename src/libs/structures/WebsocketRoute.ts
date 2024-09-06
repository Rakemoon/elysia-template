import type { AuthLevel } from "#constants/index";
import type Elysia from "elysia";

export type WebsocketRouteOptions = {
  name?: string;
  description?: string;
  prefix: string;
  authLevel?: AuthLevel;
}

export type ElysiaWebsocketContext = Parameters<Elysia['ws']>[1];

// TODO: Complete the websocket routing
export default abstract class WebsocketRoute {
  declare protected elysia: Elysia;
  public constructor(
    public options: WebsocketRouteOptions
  ) {}

  static Mount(name: string, ctx: ElysiaWebsocketContext) {
    return <T>(target: T, key: string) => {
      key;
      ctx;
      target;
    }
  }
}
