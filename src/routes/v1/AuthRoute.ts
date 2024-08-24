import { ApplyOptions, Mount, UseValidate } from "#decorators/index";
import Route, { type Context } from "#structures/Route";
import AuthValidations from "#validations/AuthValidations";

@ApplyOptions({ prefix: "/v1/auth" })
export default class extends Route {
  @Mount("POST", "/login")
  @UseValidate(AuthValidations.login)
  public loginController(req: Context<AuthValidations.loginType>) {
    return `Hello ${req.body.identifier} your password is ${req.body.password}`;
  }

  @Mount("POST", "/register")
  @UseValidate(AuthValidations.register)
  public registerController(req: Context<AuthValidations.registerType>) {
    return `Hewwo`;
  }
}
