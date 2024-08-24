import { ApplyOptions, Mount, UseValidate } from "#decorators/index";
import Route, { type Context } from "#structures/Route";
import { t } from "elysia";

@ApplyOptions({ prefix: "/v1/users" })
export default class extends Route {
  @Mount("GET", "/")
  @UseValidate({
    query: t.Object({
      id: t.Number()
    })
  })
  public controllerGetUserId(ctx: Context<{ query: { id: number }}>) {
    return this.json([ctx.query.id], "Users Retrieved");
  }
}
