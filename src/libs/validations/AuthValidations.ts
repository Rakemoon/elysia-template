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
      username: t.String(),
      fullname: t.String(),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    }),
    query: t.Object({
      nextLogin: t.Boolean({ default: false })
    }),
  }

  export type loginType = ParseType<typeof login>;
  export type registerType = ParseType<typeof register>;
}

export default AuthValidations;
