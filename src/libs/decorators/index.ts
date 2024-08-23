import Route, { type RouteOptions } from "../structures/Route";

export function GetFactory(path: string) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata("route:register", target) ?? new Map<string, [string, string]>();
    result.set(path, [key, "get"]);
    Reflect.defineMetadata("route:register", result, target);
  }
}

export function PostFactory(path: string) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata("route:register", target) ?? new Map<string, [string, string]>();
    result.set(path, [key, "post"]);
    Reflect.defineMetadata("route:register", result, target);
  }
}

export function DeleteFactory(path: string) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata("route:register", target) ?? new Map<string, [string, string]>();
    result.set(path, [key, "delete"]);
    Reflect.defineMetadata("route:register", result, target);
  }
}

export function PatchFactory(path: string) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata("route:register", target) ?? new Map<string, [string, string]>();
    result.set(path, [key, "delete"]);
    Reflect.defineMetadata("route:register", result, target);
  }
}

export function PutFactory(path: string) {
  return (target: Route, key: string) => {
    const result = Reflect.getMetadata("route:register", target) ?? new Map<string, [string, string]>();
    result.set(path, [key, "delete"]);
    Reflect.defineMetadata("route:register", result, target);
  }
}

export function ApplyOptions(options: RouteOptions) {
  return (target: new (opt: RouteOptions) => any) => {
    return new Proxy(target, {
      construct: (ctx) => new ctx(options)
    })
  }
}
