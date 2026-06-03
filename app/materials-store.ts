import type { AdminEntry } from "./material-types";
import { createJsonStore } from "./json-store";

const store = createJsonStore<AdminEntry[]>("materials.json", []);

export const readMaterials = () => store.read();
export const writeMaterials = (entries: AdminEntry[]) => store.write(entries);
export const updateMaterials = store.update;
