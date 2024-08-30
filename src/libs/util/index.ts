import { opendir } from "node:fs/promises";
import { join } from "node:path";
import Bun from "bun";

export async function *readdirRecursive(dir: string): AsyncIterableIterator<string> {
  const items = await opendir(dir);
  for await (const item of items) {
    switch(true) {
      case item.isDirectory(): yield *readdirRecursive(join(dir, item.name)); break;
      case item.isFile(): yield join(dir, item.name); break;
      default: continue;
    }
  }
}

export async function readFile
<Type extends "json" | "text" | "buffer">
(dir: string, type: Type)
: Promise<Type extends "json" ? any
: Type extends "text" ? string
: Type extends "buffer" ? Buffer
: never>
{
  const operation = Bun.file(dir);
  switch(type) {
    case "json": return operation.json() as never;
    case "text": return operation.text() as never;
    case "buffer": return Buffer.from(await operation.arrayBuffer()) as never;
    default: return undefined as never;
  }
}

export async function writeFile(dir: string, data: Blob | NodeJS.TypedArray | ArrayBufferLike | string | globalThis.Bun.BlobPart[]) {
  return Bun.write(dir, data);
}

export async function createHash(password: string) {
  const result = await Bun.password.hash(password);

  return result;
}

export async function compareHash(password: string, hash: string) {
  return Bun.password.verify(password, hash);
}
