
import { t } from "elysia";
import type { ParseType } from "#types/utility";

namespace UsersValidations {
  export const removes = {
    body: t.Optional(
      t.Array(
        t.String(), { description: "List of user id, if you leave it empty it will delete all users."}
      )
    )
  }

  export const retrieve = {
    query: t.Object({
      id: t.Optional(t.String({ description: "The user id"})) 
    })
  }

  export type removesType = ParseType<typeof removes>;
  export type retrieveType = ParseType<typeof retrieve>;
}

export default UsersValidations;
