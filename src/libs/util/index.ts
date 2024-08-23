import { opendir } from "node:fs/promises";
import { join } from "node:path";

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
