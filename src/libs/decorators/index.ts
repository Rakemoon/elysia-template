import Route, { type RouteOptions } from "#structures/Route";
import { RouteMetadata } from "#constants/index";
import type { TSchema } from "elysia";

type Methods = "GET" | "POST" | "DELETE" | "PUT" | "PATCH" | "ALL";

export function Mount(method: Methods, path: string) {
  method = method.toLowerCase() as Methods;
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata(RouteMetadata.Register, target) ?? new Map<string, [string, string]>();
    result.set(path, [key, method]);
    Reflect.defineMetadata(RouteMetadata.Register, result, target);
  }
}

export function ApplyOptions(options: RouteOptions) {
  return (target: new (opt: RouteOptions) => any) => {
    return new Proxy(target, {
      construct: (ctx) => new ctx(options)
    });
  }
}

export function UseValidate(schema: {
  body?: TSchema,
  query?: TSchema,
  params?: TSchema,
}) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata(RouteMetadata.Validation, target) ?? new Map<string, typeof schema>();
    result.set(key, schema);
    Reflect.defineMetadata(RouteMetadata.Validation, result, target);
  }
}

//TODO:implement lifecycle hook
export function UseError() {}

export function UseBefore() {}

export function UseAfter() {}
