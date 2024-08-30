import { TypeCheck, TypeCompiler, t } from "elysia/type-system";
import chalk from "chalk";

enum environtmentEnv {
  Production = "production",
  Development = "development",
  Test = "test"
}

const environtmentCompiler = TypeCompiler.Compile(t.Enum(environtmentEnv));
const stringCompiler = TypeCompiler.Compile(t.String());
const numberCompiler = TypeCompiler.Compile(t.Number());

let errCount = 0;

function compile<C extends TypeCheck<any>>(compiler: C, key: keyof NodeJS.ProcessEnv, def?: ReturnType<C["Encode"]>): ReturnType<C["Encode"]> {
  const value = Reflect.get(process.env, key);
  try {
    for (const e of compiler.Errors(value)) throw e;
    return compiler.Encode(value);
  } catch (e) {
    if (def) return def;
    errCount++;
    const schema = Reflect.get(compiler, "schema");
    console.info(
      chalk.bgRed.black(" ENV "),
      chalk.bold.yellow(key), chalk.red((e as Error).message),
      chalk.blue(`(${schema[Object.getOwnPropertySymbols(schema)[0]]}, ${schema.type ?? schema.anyOf.map((x: { const: string }) => x.const)})`),
    );
    return undefined as never;
  }
}


export const jwt = {
  secret: compile(stringCompiler, "JWT_SECRET"),
  expireDays: compile(numberCompiler, "JWT_EXPIRATION_DAYS", 1),
  expireMinutes: compile(numberCompiler, "JWT_EXPIRATION_MINUTES", 30),
}
export const environtment: "production" | "development" | "test" = compile(environtmentCompiler, "NODE_ENV") as never;

if (errCount) process.exit(1);