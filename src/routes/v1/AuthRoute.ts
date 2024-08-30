import { ServiceNames } from "#constants/index";
import { AddDetail, ApplyOptions, Mount, UseValidate } from "#decorators/index";
import Route, { type Context } from "#structures/Route";
import { compareHash } from "#util/index";
import AuthValidations from "#validations/AuthValidations";

@ApplyOptions({
  prefix: "/v1/auth",
  name: "Authorization",
  description: "Sometimes you need authorization in your life",
})
export default class AuthRoute extends Route {
  @Mount("POST", "login")
  @UseValidate(AuthValidations.login)
  @AddDetail({  description: "Endpoint to Login" })
  public async loginController(ctx: Context<AuthValidations.loginType>) {
    const { email, password } = ctx.body;
    const token = this.useService(ctx, ServiceNames.Token);
    const users = this.useService(ctx, ServiceNames.User);

    const user = await users.getUserByEmail(email);

    if (!user) {
      ctx.set.status = "Bad Request";
      return this.json(null, "Users Not Found", "Bad Request");
    }

    const isPasswordCorrect = await compareHash(password, user.password);
    if (!isPasswordCorrect) {
      ctx.set.status = "Unauthorized";
      return this.json(null, "Wrong Password", "Unauthorized");
    }

    return this.json(
      {
        user,
        access: await token.createAccess(user.id),
        refresh: await token.createRefresh(user.id)
      },
      "Success Login"
    );
  }

  @Mount("POST", "register")
  @UseValidate(AuthValidations.register)
  @AddDetail({ description: "Endpoint to registering the user" })
  public async registerController(ctx: Context<AuthValidations.registerType>) {
    const { username, email, password, fullname } = ctx.body;
    const users = this.useService(ctx, ServiceNames.User);
    
    if (await users.isEmailExist(email)) {
      ctx.set.status = "Conflict";
      return this.json(null, "Email Already Taken", "Conflict");
    }

    await users.createUser({  username, email, password, fullname });
    ctx.set.status = "Created";
    if (!ctx.query.nextLogin) return this.json({}, "Success Registering User!", "Created");
    return this.loginController({ ...ctx, body: { password, email }, query: {}});
  }
}
