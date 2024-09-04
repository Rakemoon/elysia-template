import Route, { type RouteOptions } from "#structures/Route";
import { AuthLevel, RouteMetadata } from "#constants/index";
import { InternalServerError, type DocumentDecoration, type TSchema } from "elysia";

type Methods = "GET" | "POST" | "DELETE" | "PUT" | "PATCH" | "ALL";

export function Mount(method: Methods, path: string) {
  method = method.toLowerCase() as Methods;
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata(RouteMetadata.Register, target) ?? new Set<[string, string, string]>();
    result.add([key, method, path]);
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

export function UseAuth(level: AuthLevel) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata(RouteMetadata.AuthLevel, target) ?? new Map<string, AuthLevel>();
    result.set(key, level);
    Reflect.defineMetadata(RouteMetadata.AuthLevel, result, target);
  }
}

export function AddDetail(detail: DocumentDecoration) {
  return (target: Route, key: string) => {
    const result: Map<string, typeof detail> = Reflect.getMetadata(RouteMetadata.Detail, target) ?? new Map();
    result.set(key, detail);
    Reflect.defineMetadata(RouteMetadata.Detail, result, target);
  }
}

export function CatchAllError(target: new (...args: any[]) => any) {
  const keys = Reflect.ownKeys(target.prototype);
  for (const key of keys) {
    const prop = Reflect.getOwnPropertyDescriptor(target.prototype, key);
    if (key === "constructor" || typeof prop?.value !== "function") continue;
    const fn = prop.value;
    prop.value = async function (...args: unknown[]) {
      try {
        return await fn.call(this, ...args);
      } catch(e) {
        const throwed = new InternalServerError(`${target.constructor.name}: ${(e as Error).message}`);
        Reflect.set(throwed, "cause", e);
        throw throwed;
      }
    }
    Reflect.defineProperty(target.prototype, key, prop);
  }
}

//TODO:implement lifecycle hook
export function UseError() {}

export function UseBefore() {}

export function UseAfter() {}
