import process from "node:process";
import chalk from "chalk";
import type { TypeCheck } from "elysia/type-system";
import { TypeCompiler, t } from "elysia/type-system";
import type SMTPConnection from "nodemailer/lib/smtp-connection";

enum environtmentEnv {
    Production = "production",
    Development = "development",
    Test = "test"
}

const environtmentCompiler = TypeCompiler.Compile(t.Enum(environtmentEnv));
const stringCompiler = TypeCompiler.Compile(t.String());
const numberCompiler = TypeCompiler.Compile(t.Number());

let errCount = 0;

// eslint-disable-next-line no-undef
function compile<C extends TypeCheck<any>>(compiler: C, key: keyof NodeJS.ProcessEnv, def?: ReturnType<C["Encode"]>): ReturnType<C["Encode"]> {
    let value: number | string | undefined = Reflect.get(process.env, key);
    if (value !== undefined && compiler === numberCompiler) value = Number(value);
    try {
        // eslint-disable-next-line no-unreachable-loop, typescript/no-throw-literal
        for (const err of compiler.Errors(value)) throw err;
        return compiler.Encode(value) as never;
    } catch (error) {
        if (def !== undefined) return def as never;
        errCount++;
        const schema = Reflect.get(compiler, "schema");
        console.info(
            chalk.bgRed.black(" ENV "),
            chalk.bold.yellow(key),
            chalk.red((error as Error).message),
            // eslint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
            chalk.blue(`(${schema[Object.getOwnPropertySymbols(schema)[0]]}, ${schema.type ?? schema.anyOf.map((x: { const: string; }) => x.const)})`)
        );
        return undefined as never;
    }
}

export const jwt = {
    secret: compile(stringCompiler, "JWT_SECRET"),
    expireDays: compile(numberCompiler, "JWT_EXPIRATION_DAYS", 1),
    expireMinutes: compile(numberCompiler, "JWT_EXPIRATION_MINUTES", 30)
};
export const environtment: "development" | "production" | "test" = compile(environtmentCompiler, "NODE_ENV") as never;

export const email = {
    smtp: {
        host: compile(stringCompiler, "SMTP_HOST"),
        port: compile(numberCompiler, "SMTP_PORT"),
        auth: {
            user: compile(stringCompiler, "SMTP_USERNAME"),
            pass: compile(stringCompiler, "SMTP_PASSWORD")
        }
    } satisfies SMTPConnection.Options,
    from: compile(stringCompiler, "EMAIL_FROM")
};

if (errCount) process.exit(1);
