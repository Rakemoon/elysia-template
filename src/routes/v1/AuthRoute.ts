import { ApplyOptions, GetFactory, PostFactory } from "#decorators/index";
import Route, { type RouteReq } from "#structures/Route";

@ApplyOptions({ prefix: "/auth" })
export default class extends Route {
  @GetFactory("/login")
  public login(req: RouteReq) {
    return "helo login";
  }

  @GetFactory("/register")
  public register(req: RouteReq) {
    return "helo register";
  }

  @GetFactory("/logout")
  public logout(req: RouteReq) {
    return "helo logout";
  }
}
