import type Elysia from "elysia";
import type { AuthLevel } from "#constants/index";

export type WebsocketRouteOptions = {
    name?: string;
    description?: string;
    prefix: string;
    authLevel?: AuthLevel;
};

export type ElysiaWebsocketContext = Parameters<Elysia["ws"]>[1];

// TODO [>1]: Complete the websocket routing
export default abstract class WebsocketRoute {
    declare protected elysia: Elysia;
    public constructor(
        public options: WebsocketRouteOptions
    ) {}
}
