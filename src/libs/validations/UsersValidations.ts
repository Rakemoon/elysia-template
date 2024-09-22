import { t } from "elysia";
import type { ParseType } from "#types/utility";

export const removes = {
    body: t.Optional(
        t.Array(
            t.String({ format: "uuid" }), { description: "List of user id, if you leave it empty it will delete all users." }
        )
    )
};

export const gets = {
    query: t.Object({
        id: t.Optional(t.String({ description: "The user id", format: "uuid" }))
    })
};

export const creates = {
    body: t.Array(
        t.Required(
            t.Object({
                username: t.String({ minLength: 4, maxLength: 20 }),
                fullname: t.String({ minLength: 8 }),
                password: t.String({ minLength: 8 }),
                email: t.String({ format: "email" }),
                role: t.Enum({
                    admin: "admin",
                    user: "user"
                }, { default: "user" })
            })
        )
        , { description: "Array containing users data" }
    )
};

export const updates = {
    body: t.Array(
        t.Object({
            id: t.String({ format: "uuid" }),
            username: t.Optional(t.String({ minLength: 4, maxLength: 20 })),
            fullname: t.Optional(t.String({ minLength: 8 })),
            password: t.Optional(t.String({ minLength: 8 })),
            email: t.Optional(t.String({ format: "email" })),
            role: t.Optional(
                t.Enum({
                    admin: "admin",
                    user: "user"
                })
            )
        }, { minProperties: 2, description: "Array containing users data to update" })
    )
};

export type removesType = ParseType<typeof removes>;
export type getsType = ParseType<typeof gets>;
export type createsType = ParseType<typeof creates>;
export type updateType = ParseType<typeof updates>;

