import { AuthLevel, ServiceNames } from "#constants/index";
import { AddDetail, ApplyOptions, Mount, UseValidate } from "#decorators/index";
import Route, { type Context } from "#structures/Route";
import UsersValidations from "#validations/UsersValidations";

@ApplyOptions({
  prefix: "/v1/users",
  name: "Users",
  description: "Users CRUD, only `Admin` who can access this",
  authLevel: AuthLevel.Admin,
})
export default class UsersRoute extends Route {

  async #controllerGetById(ctx: Context<UsersValidations.getsType>) {
    const users = this.useService(ctx, ServiceNames.User);
    const data = await users.getPlainUser(ctx.query.id!);
    if (!data) {
      ctx.set.status = "Not Found";
      return this.json(null, "User Not Found", "Not Found");
    }
    return this.json(data, "Single Users Retrieved");
  }

  @Mount("GET", "/")
  @AddDetail({ description: "To get user data user" })
  @UseValidate(UsersValidations.gets)
  public async controllerGetUsers(ctx: Context<UsersValidations.getsType>) {
    if (ctx.query.id) return this.#controllerGetById(ctx);
    const users = this.useService(ctx, ServiceNames.User);
    return this.json(await users.getAllUser(), "Users Retrieved");
  }

  @Mount("POST", "/")
  @UseValidate(UsersValidations.creates)
  @AddDetail({ description: "To create users" })
  public async controllerCreateUsers(ctx: Context<UsersValidations.createsType>) {
    const users = this.useService(ctx, ServiceNames.User);
    await users.createManyUsers(...ctx.body);
    return this.json(null, "Users Creation Success", "Created");
  }

  @Mount("PATCH", "/")
  @UseValidate(UsersValidations.updates)
  @AddDetail({ description: "To update users" })
  public async controllerUpdateUsers(ctx: Context<UsersValidations.updateType>) {
    const users = this.useService(ctx, ServiceNames.User);
    users.updateUserMany(...ctx.body);
    return this.json(null, "Update User Success");
  }

  @Mount("DELETE", "/")
  @AddDetail({ description: "To remove user" })
  @UseValidate(UsersValidations.removes)
  public async controllerDeleteUsers(ctx: Context<UsersValidations.removesType>) {
    const users = this.useService(ctx, ServiceNames.User);
    await users.deleteUsers(ctx.body);
    return this.json(null, "Success Deleting Users");
  }
}
