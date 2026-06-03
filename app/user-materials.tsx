import { getTranslations } from "next-intl/server";
import { groupFilesByYear, type ImportedFile } from "./file-utils";
import { isImageFile } from "./material-types";
import { readMaterials } from "./materials-store";

function FileOrImage({ file, entryId }: { file: ImportedFile; entryId: string }) {
  if (isImageFile(file.href)) {
    return (
      <figure className="material-image" key={`${entryId}-${file.href}`}>
        <a href={file.href} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={file.href} alt={file.text || ""} loading="lazy" />
        </a>
      </figure>
    );
  }
  return (
    <a
      href={file.href}
      target="_blank"
      rel="noreferrer"
      key={`${entryId}-${file.href}`}
    >
      {file.text}
    </a>
  );
}

export async function UserMaterials({
  sectionSlug,
  pageSlug,
}: {
  sectionSlug: string;
  pageSlug: string;
}) {
  const t = await getTranslations("userMaterials");
  const entries = await readMaterials();
  const pageEntries = entries.filter(
    (entry) => entry.sectionSlug === sectionSlug && entry.pageSlug === pageSlug,
  );

  return (
    <section className="section-wrap">
      {pageEntries.length === 0 ? (
        <p className="no-materials-hint">{t("noMaterials")}</p>
      ) : null}
      <div className="material-list">
        {pageEntries.map((entry) => {
          const imageFiles = entry.files.filter((f) => isImageFile(f.href));
          const otherFiles = entry.files.filter((f) => !isImageFile(f.href));
          return (
            <article className="material-card" key={entry.id}>
              <div>
                <span className="material-date">{entry.date}</span>
                <h4>{entry.title}</h4>
                <p>{entry.body}</p>
              </div>
              {imageFiles.length > 0 ? (
                <div className="material-images">
                  {imageFiles.map((file) => (
                    <FileOrImage file={file} entryId={entry.id} key={`${entry.id}-${file.href}`} />
                  ))}
                </div>
              ) : null}
              {otherFiles.length > 0 ? (
                <div className="year-file-groups">
                  {groupFilesByYear(otherFiles).map(([year, files]) => (
                    <div className="year-file-group" key={year}>
                      <strong>{year}</strong>
                      <div className="file-list">
                        {files.map((file) => (
                          <FileOrImage file={file} entryId={entry.id} key={`${entry.id}-${file.href}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
