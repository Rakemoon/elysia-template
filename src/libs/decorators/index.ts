import { InternalServerError } from "elysia";
import type { DocumentDecoration, TSchema } from "elysia";
import type { AuthLevel } from "#constants/index";
import { RouteMetadata } from "#constants/index";
import type Route from "#structures/Route";

import "reflect-metadata";

type Methods = "ALL" | "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export function Mount(method: Methods, path: string) {
    const em = method.toLowerCase() as Methods;
    return (target: Route, key: string): void => {
        const result: Set<[string, string, string]> = (Reflect.getMetadata(RouteMetadata.Register, target) ?? new Set()) as never;
        result.add([key, em, path]);
        Reflect.defineMetadata(RouteMetadata.Register, result, target);
    };
}

export function ApplyOptions<Options>(options: Options) {
    return <Class extends object>(target: new (option: Options, ...rest: unknown[]) => Class): typeof target => new Proxy(target, {
        construct: (Ctx, rest: unknown[]) => new Ctx(options, ...rest)
    });
}

export function UseValidate(schema: {
    body?: TSchema;
    query?: TSchema;
    params?: TSchema;
}) {
    return (target: Route, key: string): void => {
        const result: Map<string, typeof schema> = (Reflect.getMetadata(RouteMetadata.Validation, target) ?? new Map()) as never;
        result.set(key, schema);
        Reflect.defineMetadata(RouteMetadata.Validation, result, target);
    };
}

export function UseAuth(level: AuthLevel) {
    return (target: Route, key: string): void => {
        const result: Map<string, AuthLevel> = (Reflect.getMetadata(RouteMetadata.AuthLevel, target) ?? new Map()) as never;
        result.set(key, level);
        Reflect.defineMetadata(RouteMetadata.AuthLevel, result, target);
    };
}

export function AddDetail(detail: DocumentDecoration) {
    return (target: Route, key: string): void => {
        const result: Map<string, typeof detail> = (Reflect.getMetadata(RouteMetadata.Detail, target) ?? new Map()) as never;
        result.set(key, detail);
        Reflect.defineMetadata(RouteMetadata.Detail, result, target);
    };
}

export function CatchAllError<T extends object>(target: new (...args: any[]) => T): void {
    const keys = Reflect.ownKeys(target.prototype as never);
    for (const key of keys) {
        const prop = Reflect.getOwnPropertyDescriptor(target.prototype, key);
        if (key === "constructor" || typeof prop?.value !== "function") continue;
        const fn = prop.value as (...args: unknown[]) => Promise<unknown>;
        // eslint-disable-next-line func-names
        prop.value = async function (...args: unknown[]) {
            try {
                return await fn.call(this, ...args);
            } catch (error) {
                const throwed = new InternalServerError(`${target.constructor.name}: ${(error as Error).message}`);
                Reflect.set(throwed, "cause", error);
                throw throwed;
            }
        };
        Reflect.defineProperty(target.prototype as never, key, prop);
    }
}
