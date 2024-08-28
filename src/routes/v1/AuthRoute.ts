import { ServiceNames } from "#constants/index";
import { AddDetail, ApplyOptions, Mount, UseValidate } from "#decorators/index";
import Route, { type Context } from "#structures/Route";
import AuthValidations from "#validations/AuthValidations";
import { InvalidCookieSignature } from "elysia";

@ApplyOptions({
  prefix: "/v1/auth",
  name: "Authorization",
  description: "Sometimes you need authorization in your life",
})
export default class extends Route {
  @Mount("POST", "login")
  @UseValidate(AuthValidations.login)
  @AddDetail({
    description: "Endpoint to Login",
    tags: ["Mewe"]
  })
  public async loginController(ctx: Context<AuthValidations.loginType>) {
    const { email, password } = ctx.body;
    const token = this.useService(ctx, ServiceNames.Token);
    const users = this.useService(ctx, ServiceNames.User);

    const user = await users.getUserByEmail(email);

    if (!user) throw new InvalidCookieSignature("failure", `user with email '${email}' not found.`);
    if (user.password !== password) throw new InvalidCookieSignature("failure", "wrong password!");

    return this.json(
      {
        user,
        access: await token.createAccess(user.id),
        refresh: await token.createRefresh(user.id)
      },
      "Succes Login"
    );
  }

  @Mount("POST", "register")
  @UseValidate(AuthValidations.register)
  public async registerController(ctx: Context<AuthValidations.registerType>) {
    const { username, email, password, fullname } = ctx.body;
    const users = this.useService(ctx, ServiceNames.User);
    await users.createUser({  username, email, password, fullname });
    if (!ctx.query.nextLogin) return this.json({}, "Success Registering User!");
    return this.loginController({ ...ctx, body: { password, email }, query: {}});
  }

  @Mount("DELETE", "delete")
  public async logoutController(ctx: Context) {
    return this.json({}, "Success Logout");
  }
}
