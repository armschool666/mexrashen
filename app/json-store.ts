import { BlobNotFoundError, head, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";

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
  const cacheTag = `blob-json:${blobPath}`;

  async function readRaw(): Promise<T> {
    try {
      const blob = await head(blobPath);
      const url = new URL(blob.url);
      url.searchParams.set("v", blob.etag);
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to read ${blobPath}: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BlobNotFoundError) return fallback;
      throw error;
    }
  }

  const readCached = unstable_cache(readRaw, ["blob-json", blobPath], {
    tags: [cacheTag],
    revalidate: 86400,
  });

  async function writeRaw(value: T): Promise<void> {
    await put(blobPath, JSON.stringify(value, null, 2), {
      access: "public",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    revalidateTag(cacheTag, { expire: 0 });
  }

  return {
    read: () => withLock(blobPath, readCached),
    write: (value) => withLock(blobPath, () => writeRaw(value)),
    update: (mutator) =>
      withLock(blobPath, async () => {
        const current = await readCached();
        const next = await mutator(current);
        await writeRaw(next);
        return next;
      }),
  };
}
