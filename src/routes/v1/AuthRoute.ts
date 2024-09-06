import { AuthLevel, ServiceNames, TokenTypes } from "#constants/index";
import { AddDetail, ApplyOptions, Mount, UseAuth, UseValidate } from "#decorators/index";
import Route, { type Context, type RouteOptions } from "#structures/Route";
import { compareHash } from "#util/index";
import AuthValidations from "#validations/AuthValidations";

@ApplyOptions<RouteOptions>({
  prefix: "/v1/auth",
  name: "Authorization",
  description: "Sometimes you need authorization in your life",
})
export default class AuthRoute extends Route {
  @Mount("POST", "login")
  @UseValidate(AuthValidations.login)
  @AddDetail({ description: "Endpoint to Login" })
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
    
    try {
      await users.createUser({  username, email, password, fullname });
      ctx.set.status = "Created";
      if (!ctx.query.nextLogin) return this.json({}, "Success Registering User!", "Created");
      return this.loginController({ ...ctx, body: { password, email }, query: {}});
    } catch(e) {
      if ((e as { cause: { code: string }}).cause.code === "23505") {
        ctx.set.status = "Conflict";
        return this.json(null, "Email Already Taken", "Conflict");
      } else {
        throw e;
      }
    }
  }

  @Mount("POST", "verification-email")
  @UseAuth(AuthLevel.User)
  @UseValidate(AuthValidations.createVerificationEmail)
  @AddDetail({ description: "This endpoint will send an email verification to user who access this endpoint" })
  public async createVerificationEmailController(ctx: Context<AuthValidations.createVerificationEmailType>) {
    const users = this.useService(ctx, ServiceNames.User);
    const mailer = this.useService(ctx, ServiceNames.Email);
    const tokens = this.useService(ctx, ServiceNames.Token);

    const result = await users.getPlainUser(ctx.userId!);
    const token = await tokens.createVerificationEmail(result!.id);
    await mailer.sendVerificationMail(result!.email, ctx.body.link, token.token);
    return this.json(null, "Success Sending email!");
  }

  @Mount("PUT", "verification-email")
  @UseValidate(AuthValidations.doVerificationEmail)
  @AddDetail({ description: "This enpoint will verify verification email token" })
  public async doVerificationEmailController(ctx: Context<AuthValidations.doVerificationEmailType>) {
    const users = this.useService(ctx, ServiceNames.User);
    try {
      const payload = await ctx.jwt.verify(ctx.body.token);
      if (!payload || payload.type !== TokenTypes.EmailVerification || !payload.sub) throw "NotFound";
      await users.updateUser(payload.sub, { emailVerified: true });
      return this.json(null, "Success verify the email");
    } catch (e) {
      if (e === "NotFound") {
        ctx.set.status = "Not Found";
        return this.json(null, "Token Not Found", "Not Found");
      }
      throw e;
    }
  }

  @Mount("POST", "forgot-password")
  @UseValidate(AuthValidations.createForgotPassword)
  @AddDetail({ description: "This endpoint will send an forgot password email" })
  public async createForgotPasswordController(ctx: Context<AuthValidations.createForgotPasswordType>) {
    const users = this.useService(ctx, ServiceNames.User);
    const emails = this.useService(ctx, ServiceNames.Email);
    const tokens = this.useService(ctx, ServiceNames.Token);
    const user = await users.getUserByEmail(ctx.body.email);
    if (!user) {
      ctx.set.status = "Not Found";
      return this.json(null, "User Not Found", "Not Found");
    }
    const token = await tokens.createResetPassword(user.id);
    emails.sendForgotPasswordMail(user.email, ctx.body.link, token.token);
    return this.json(null, "Success sending forgot password email");
  }

  @Mount("PUT", "forgot-password")
  @UseValidate(AuthValidations.doForgotPassword)
  @AddDetail({ description: "This endpoint will verify forgot password" })
  public async doForgotPasswordController(ctx: Context<AuthValidations.doForgotPasswordType>) {
    const users = this.useService(ctx, ServiceNames.User);
    try {
      const payload = await ctx.jwt.verify(ctx.body.token);
      if (!payload || payload.type !== TokenTypes.ResetPassword || !payload.sub) throw "NotFound";
      await users.updateUser(payload.sub, { password: ctx.body.password });
      return this.json(null, "Success verify the email");
    } catch (e) {
      if (e === "NotFound") {
        ctx.set.status = "Not Found";
        return this.json(null, "Token Not Found", "Not Found");
      }
      throw e;
    }
  }

  @Mount("POST", "refresh-access")
  @UseValidate(AuthValidations.refreshAuthToken)
  @AddDetail({ description: "This endpoint to refersh jwt auth" })
  public async refreshAcessTokenController(ctx: Context<AuthValidations.refreshAuthTokenType>) {
    const tokens = this.useService(ctx, ServiceNames.Token);
    try {
      const payload = await ctx.jwt.verify(ctx.body.token);
      if (!payload || payload.type !== TokenTypes.Refresh || !payload.sub) throw "NotFound";
      const token = await tokens.createAccess(payload.sub);
      return this.json(token, "Sucess generate acess token");
    } catch (e) {
      if (e === "NotFound") {
        ctx.set.status = "Not Found";
        return this.json(null, "Token Not Found", "Not Found");
      }
      throw e;
    }
  }
}
