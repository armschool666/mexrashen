export type ImportedFile = {
  href: string;
  text: string;
};

export function getFileYear(file: ImportedFile): string {
  const value = `${file.text} ${decodeURIComponent(file.href)}`;
  return value.match(/20\d{2}/)?.[0] ?? "—";
}

export function groupFilesByYear(files: ImportedFile[]): [string, ImportedFile[]][] {
  const groups = files.reduce<Record<string, ImportedFile[]>>((result, file) => {
    const year = getFileYear(file);
    result[year] = result[year] ?? [];
    result[year].push(file);
    return result;
  }, {});

  return Object.entries(groups).sort(([yearA], [yearB]) => {
    if (yearA === "—") return 1;
    if (yearB === "—") return -1;
    return Number(yearB) - Number(yearA);
  });
}
