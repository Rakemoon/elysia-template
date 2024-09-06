import { AddDetail, ApplyOptions, Mount } from "#decorators/index";
import Route, { type RouteOptions } from "#structures/Route";

@ApplyOptions<RouteOptions>({
  prefix: "/",
})
export default class HomeRoute extends Route {
  @Mount("ALL", "/")
  @AddDetail({ hide: true })
  public homeController() {
    return "hawwo!";
  }
}
