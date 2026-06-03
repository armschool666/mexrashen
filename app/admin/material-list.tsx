"use client";

import { useMemo } from "react";
import { sections } from "../data";
import type { AdminEntry } from "../material-types";
import { adminStrings as s } from "./admin-strings";
import { MaterialPreviewCard } from "./material-preview-card";

interface Props {
  entries: AdminEntry[];
  selectedSectionSlug: string;
  selectedPageSlug: string;
  showOnlySelectedPage: boolean;
  searchQuery: string;
  previewId: string | null;
  onToggleShowOnly: (value: boolean) => void;
  onSearch: (value: string) => void;
  onEdit: (entry: AdminEntry) => void;
  onTogglePreview: (id: string | null) => void;
  onRemove: (entry: AdminEntry) => void;
}

function pageLocation(entry: AdminEntry): string {
  const section = sections.find((sec) => sec.slug === entry.sectionSlug);
  const page = section?.links.find((p) => p.slug === entry.pageSlug);
  return `${section?.title ?? entry.sectionTitle} / ${page?.title ?? entry.pageTitle}`;
}

export function MaterialList({
  entries,
  selectedSectionSlug,
  selectedPageSlug,
  showOnlySelectedPage,
  searchQuery,
  previewId,
  onToggleShowOnly,
  onSearch,
  onEdit,
  onTogglePreview,
  onRemove,
}: Props) {
  const visibleEntries = useMemo(() => {
    let result = showOnlySelectedPage
      ? entries.filter(
          (entry) =>
            entry.sectionSlug === selectedSectionSlug &&
            entry.pageSlug === selectedPageSlug,
        )
      : entries;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.body.toLowerCase().includes(q) ||
          entry.sectionTitle.toLowerCase().includes(q) ||
          entry.pageTitle.toLowerCase().includes(q),
      );
    }
    return result;
  }, [entries, selectedPageSlug, selectedSectionSlug, showOnlySelectedPage, searchQuery]);

  const selectedSection = sections.find((sec) => sec.slug === selectedSectionSlug);
  const selectedPage = selectedSection?.links.find((p) => p.slug === selectedPageSlug);

  return (
    <div className="admin-list">
      <div className="admin-search">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={s.searchPlaceholder}
          className="admin-search-input"
          aria-label={s.searchAriaLabel}
        />
      </div>
      <div className="admin-list-header">
        <div>
          <h2>{s.listHeading}</h2>
          <p>
            {showOnlySelectedPage
              ? `${selectedSection?.title ?? ""} / ${selectedPage?.title ?? ""}`
              : s.allPages}
          </p>
        </div>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showOnlySelectedPage}
            onChange={(e) => onToggleShowOnly(e.target.checked)}
          />
          {s.onlySelectedPage}
        </label>
      </div>

      {visibleEntries.length === 0 ? (
        <p className="empty-files">{s.noEntriesForFilter}</p>
      ) : null}

      {visibleEntries.map((entry) => (
        <article className="admin-item" key={entry.id}>
          <span className="admin-item-location">{pageLocation(entry)}</span>
          <h3>{entry.title}</h3>
          <p>{entry.body}</p>
          <small>{entry.date}</small>

          {entry.files.length > 0 ? (
            <div className="file-list admin-file-list">
              {entry.files.map((file) => (
                <a
                  href={file.href}
                  key={`${entry.id}-${file.href}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📄 {file.text}
                </a>
              ))}
            </div>
          ) : (
            <p className="empty-files" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>
              {s.noFiles}
            </p>
          )}

          <div className="admin-item-actions">
            <button type="button" onClick={() => onEdit(entry)}>
              {s.edit}
            </button>
            <button
              type="button"
              onClick={() => onTogglePreview(previewId === entry.id ? null : entry.id)}
              className="secondary-button"
            >
              {previewId === entry.id ? s.previewClose : s.previewOpen}
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => onRemove(entry)}
            >
              {s.remove}
            </button>
          </div>

          {previewId === entry.id && (
            <div className="admin-inline-preview">
              <p className="file-chips-label">{s.inlinePreviewHint}</p>
              <MaterialPreviewCard entry={entry} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
