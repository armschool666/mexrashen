import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

/**
 * Атомарное чтение/запись JSON-файла как единого источника данных.
 *
 * - Запись идёт во временный файл, затем атомарно переименовывается
 *   в целевой → процесс не может оставить файл «полуизменённым».
 * - На уровне модуля держим очередь промисов по пути файла: пока
 *   предыдущая запись/чтение не закончилось, следующая ждёт.
 *   Это спасает от race condition «read-modify-write».
 */

const dataDir = path.join(process.cwd(), "data");

const locks = new Map<string, Promise<unknown>>();

function withLock<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(filePath) ?? Promise.resolve();
  const next = previous.then(task, task);
  locks.set(
    filePath,
    next.catch(() => undefined),
  );
  return next;
}

async function atomicWrite(filePath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(tmp, contents, "utf8");
  await rename(tmp, filePath);
}

export interface JsonStore<T> {
  read(): Promise<T>;
  write(value: T): Promise<void>;
  update(mutator: (current: T) => T | Promise<T>): Promise<T>;
}

export function createJsonStore<T>(fileName: string, fallback: T): JsonStore<T> {
  const filePath = path.join(dataDir, fileName);

  async function readRaw(): Promise<T> {
    try {
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  async function writeRaw(value: T): Promise<void> {
    await atomicWrite(filePath, JSON.stringify(value, null, 2));
  }

  return {
    read: () => withLock(filePath, readRaw),
    write: (value) => withLock(filePath, () => writeRaw(value)),
    update: (mutator) =>
      withLock(filePath, async () => {
        const current = await readRaw();
        const next = await mutator(current);
        await writeRaw(next);
        return next;
      }),
  };
}
