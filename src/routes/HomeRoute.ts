import { AddDetail, ApplyOptions, Mount } from "#decorators/index";
import Route from "#structures/Route";

@ApplyOptions({
  prefix: "/"
})
export default class HomeRoute extends Route {
  @Mount("ALL", "/")
  @AddDetail({ hide: true })
  public homeController() {
    return "hawwo!";
  }
}
