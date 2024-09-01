import { t } from "elysia";
import type { ParseType } from "#types/utility";

namespace AuthValidations {
  export const login = {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  }

  export const register = {
    body: t.Object({
      username: t.String({ minLength: 4, maxLength: 20 }),
      fullname: t.String({ minLength: 8 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }, { maxProperties: 4 }),
    query: t.Object({
      nextLogin: t.Boolean({ default: false })
    }),
  }
  export const createVerificationEmail = {
    body: t.Object({
      link: t.String({
        format: "uri",
        description: "an url to send an email to user. please provide the `$TOKEN` to replace it with jwt token",
        examples: "http://example.your.front/emailverif/$TOKEN"
      })
    })
  }

  export const doVerificationEmail = {
    body: t.Object({
      token: t.String({ description: "a jwt token to verify the email" })
    })
  }

  export const createForgotPassword = {
    body: t.Object({
      email: t.String({ format: "email", description: "an email to send the url" }),
      link: t.String({
        format: "uri",
        description: "an url to send an email to user. please provide the `$TOKEN` to replace it with jwt token",
        examples: "http://example.your.front/forgorpassword/$TOKEN"
      })
    })
  }

  export const doForgotPassword = {
    body: t.Object({
      password: t.String({ minLength: 8, description: "The new users password" }),
      token: t.String({ description: "a jwt tokent to verify the forgot password section" })
    })
  }

  export type loginType = ParseType<typeof login>;
  export type registerType = ParseType<typeof register>;
  export type createVerificationEmailType = ParseType<typeof createVerificationEmail>;
  export type doVerificationEmailType = ParseType<typeof doVerificationEmail>;
  export type createForgotPasswordType = ParseType<typeof createForgotPassword>;
  export type doForgotPasswordType = ParseType<typeof doForgotPassword>;
}

export default AuthValidations;
