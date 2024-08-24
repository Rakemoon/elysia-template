import { t } from "elysia";
import type { ParseType } from "#types/utility";

namespace AuthValidations {
  export const login = {
    body: t.Object({
      identifier: t.String(),
      password: t.String(),
    })
  }

  export const register = {
    body: t.Object({
      username: t.String(),
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  }

  export type loginType = ParseType<typeof login>;
  export type registerType = ParseType<typeof register>;
}

export default AuthValidations;
