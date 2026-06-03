import { list, put } from "@vercel/blob";

const locks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  const next = previous.then(task, task);
  locks.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

export interface JsonStore<T> {
  read(): Promise<T>;
  write(value: T): Promise<void>;
  update(mutator: (current: T) => T | Promise<T>): Promise<T>;
}

export function createJsonStore<T>(fileName: string, fallback: T): JsonStore<T> {
  const blobPath = `data/${fileName}`;

  async function readRaw(): Promise<T> {
    try {
      const { blobs } = await list({ prefix: blobPath, limit: 1 });
      const blob = blobs[0];
      if (!blob) return fallback;
      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) return fallback;
      return (await response.json()) as T;
    } catch {
      return fallback;
    }
  }

  async function writeRaw(value: T): Promise<void> {
    await put(blobPath, JSON.stringify(value, null, 2), {
      access: "public",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
  }

  return {
    read: () => withLock(blobPath, readRaw),
    write: (value) => withLock(blobPath, () => writeRaw(value)),
    update: (mutator) =>
      withLock(blobPath, async () => {
        const current = await readRaw();
        const next = await mutator(current);
        await writeRaw(next);
        return next;
      }),
  };
}
