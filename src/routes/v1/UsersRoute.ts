import { AuthLevel, ServiceNames } from "#constants/index";
import { AddDetail, ApplyOptions, Mount, UseValidate } from "#decorators/index";
import Route, { type Context } from "#structures/Route";
import UsersValidations from "#validations/UsersValidations";
import { NotFoundError } from "elysia";

@ApplyOptions({
  prefix: "/v1/users",
  name: "Users",
  description: "Users CRUD, only `Admin` who can access this",
  authLevel: AuthLevel.Admin,
})
export default class extends Route {
  @Mount("GET", "/")
  @AddDetail({ description: "To retrieve user" })
  @UseValidate(UsersValidations.retrieve)
  public async controllerGetUsers(ctx: Context<UsersValidations.retrieveType>) {
    if (ctx.query.id) return this.controllerGetById(ctx);
    const users = this.useService(ctx, ServiceNames.User);
    return this.json(await users.getAllUser(), "Users Retrieved");
  }

  public async controllerGetById(ctx: Context<UsersValidations.retrieveType>) {
    const users = this.useService(ctx, ServiceNames.User);
    const data = await users.getPlainUser(ctx.query.id!);
    if (!data) throw new NotFoundError("User Not Found");
    return this.json(data, "Users Retrieved");
  }

  @Mount("DELETE", "/")
  @AddDetail({ description: "To remove user"})
  @UseValidate(UsersValidations.removes)
  public async contollerDeleteUsers(ctx: Context<UsersValidations.removesType>) {
    const users = this.useService(ctx, ServiceNames.User);
    await users.deleteUsers(ctx.body);
    return this.json({}, "Success Deleting Users");
  }
}
