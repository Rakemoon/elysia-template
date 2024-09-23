import { AddDetail, ApplyOptions, Mount } from "#decorators/index";
import Route from "#structures/Route";
import type { RouteOptions, WebsocketController } from "#structures/Route";

@ApplyOptions<RouteOptions>({
    prefix: "/"
})
export default class HomeRoute extends Route {
    @Mount("ALL", "/")
    @AddDetail({ hide: true })
    public homeController() {
        return "hawwo!";
    }

    @Mount("WS", "/")
    public wsController: WebsocketController = {
        open(ws) {
            ws.send(`Connection open with id: ${ws.id}`);
        },
        message(ws, message) {
            ws.send(message);
        },

        close(ws) {
            console.log(`Connection closed with id: ${ws.id}`);
        }
    };
}
