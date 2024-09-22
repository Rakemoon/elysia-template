import { Buffer } from "node:buffer";
import { opendir } from "node:fs/promises";
import path from "node:path";
import Bun from "bun";

export async function * readdirRecursive(dir: string): AsyncIterableIterator<string> {
    const items = await opendir(dir);
    for await (const item of items) {
        switch (true) {
            case item.isDirectory(): yield * readdirRecursive(path.join(dir, item.name)); break;
            case item.isFile(): yield path.join(dir, item.name); break;
            default: continue;
        }
    }
}

export async function readFile<Type extends "buffer" | "json" | "text", K = any>(dir: string, type: Type): Promise<Type extends "json" ? K
    : Type extends "text" ? string
        : Type extends "buffer" ? Buffer
            : never> {
    const operation = Bun.file(dir);
    switch (type) {
        case "json": return operation.json() as never;
        case "text": return operation.text() as never;
        case "buffer": return Buffer.from(await operation.arrayBuffer()) as never;
        default: return undefined as never;
    }
}

export async function writeFile(dir: string, data: ArrayBufferLike | Blob | globalThis.Bun.BlobPart[] | string): Promise<number> {
    return Bun.write(dir, data);
}

export async function createHash(password: string): Promise<string> {
    const result = await Bun.password.hash(password);

    return result;
}

export async function compareHash(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
}
