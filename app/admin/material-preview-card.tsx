"use client";

import { groupFilesByYear } from "../file-utils";
import type { AdminEntry } from "../material-types";

/** Renders a material card exactly as it appears on the public page. */
export function MaterialPreviewCard({ entry }: { entry: AdminEntry }) {
  return (
    <article className="material-card material-card--preview">
      <div>
        <span className="material-date">{entry.date}</span>
        <h4>{entry.title}</h4>
        <p>{entry.body}</p>
      </div>
      {entry.files.length > 0 ? (
        <div className="year-file-groups">
          {groupFilesByYear(entry.files).map(([year, files]) => (
            <div className="year-file-group" key={year}>
              <strong>{year}</strong>
              <div className="file-list">
                {files.map((file) => (
                  <a
                    href={file.href}
                    target="_blank"
                    rel="noreferrer"
                    key={`${entry.id}-${file.href}`}
                  >
                    {file.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
