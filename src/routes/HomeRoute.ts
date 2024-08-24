import { ApplyOptions, Mount } from "#decorators/index";
import Route from "#structures/Route";

@ApplyOptions({
  prefix: "/"
})
export default class extends Route {
  @Mount("ALL", "/")
  public homeController() {
    return "hawwo!";
  }
}
