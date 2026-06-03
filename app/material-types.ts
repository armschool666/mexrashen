import type { ImportedFile } from "./file-utils";

export type AdminEntry = {
  id: string;
  title: string;
  sectionSlug: string;
  sectionTitle: string;
  pageSlug: string;
  pageTitle: string;
  body: string;
  date: string;
  files: ImportedFile[];
};

export type UploadFile = ImportedFile & {
  name?: string;
  size?: number;
};

export function parseFileLinks(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [text, ...urlParts] = line.split("|").map((item) => item.trim());
      const href = urlParts.join("|") || text;
      return {
        text: urlParts.length > 0 ? text : "",
        href,
      };
    });
}

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

export function isImageFile(href: string): boolean {
  const ext = href.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTENSIONS.has(`.${ext}`) : false;
}
