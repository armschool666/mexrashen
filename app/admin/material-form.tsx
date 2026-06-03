"use client";

import { useEffect } from "react";
import { sections } from "../data";
import type { ImportedFile } from "../file-utils";
import type { AdminEntry } from "../material-types";
import { adminStrings as s } from "./admin-strings";
import { MaterialPreviewCard } from "./material-preview-card";

export type FormState = {
  title: string;
  sectionSlug: string;
  pageSlug: string;
  body: string;
  files: string;
};

interface Props {
  form: FormState;
  onFormChange: (form: FormState) => void;
  editingId: string | null;
  keptFiles: ImportedFile[];
  onRemoveKeptFile: (file: ImportedFile) => void;
  isSaving: boolean;
  message: string;
  savedEntry: AdminEntry | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
}

export function MaterialForm({
  form,
  onFormChange,
  editingId,
  keptFiles,
  onRemoveKeptFile,
  isSaving,
  message,
  savedEntry,
  onSubmit,
  onCancelEdit,
}: Props) {
  const selectedSection =
    sections.find((section) => section.slug === form.sectionSlug) ?? sections[0];
  const selectedPage =
    selectedSection.links.find((page) => page.slug === form.pageSlug) ??
    selectedSection.links[0];

  // Warn before leaving with unsaved form data
  useEffect(() => {
    const hasData = form.title.trim() || form.body.trim() || form.files.trim();
    if (!hasData) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [form.title, form.body, form.files]);

  const previewHref = `/hy/section/${selectedSection.slug}/${selectedPage.slug}`;

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <fieldset>
        <legend>{s.step1Legend}</legend>
        <label>
          {s.sectionLabel}
          <select
            value={form.sectionSlug}
            onChange={(e) => {
              const next = sections.find((sec) => sec.slug === e.target.value) ?? sections[0];
              onFormChange({
                ...form,
                sectionSlug: next.slug,
                pageSlug: next.links[0].slug,
              });
            }}
          >
            {sections.map((section) => (
              <option value={section.slug} key={section.slug}>
                {section.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          {s.pageLabel}
          <select
            value={form.pageSlug}
            onChange={(e) => onFormChange({ ...form, pageSlug: e.target.value })}
          >
            {selectedSection.links.map((page) => (
              <option value={page.slug} key={page.slug}>
                {page.title}
              </option>
            ))}
          </select>
        </label>
        <a className="preview-link" href={previewHref} target="_blank">
          {s.previewSelectedPage}
        </a>
      </fieldset>

      <fieldset>
        <legend>{s.step2Legend}</legend>
        <label>
          {s.titleLabel}
          <input
            value={form.title}
            onChange={(e) => onFormChange({ ...form, title: e.target.value })}
            placeholder={s.titlePlaceholder}
          />
        </label>
        <label>
          {s.bodyLabel}
          <textarea
            value={form.body}
            onChange={(e) => onFormChange({ ...form, body: e.target.value })}
            placeholder={s.bodyPlaceholder}
            rows={6}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>{s.step3Legend}</legend>

        {editingId && keptFiles.length > 0 && (
          <div className="file-chips-section">
            <p className="file-chips-label">{s.existingFilesLabel}</p>
            <div className="file-chips">
              {keptFiles.map((file) => (
                <span className="file-chip" key={file.href}>
                  <a href={file.href} target="_blank" rel="noreferrer">
                    {file.text || s.fileChipFallback}
                  </a>
                  <button
                    type="button"
                    className="file-chip-remove"
                    title={s.removeFileTitle}
                    onClick={() => onRemoveKeptFile(file)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <label className="upload-box">
          <strong>{editingId ? s.uploadNewFiles : s.uploadFiles}</strong>
          <span>{s.uploadHint}</span>
          <input name="uploadFiles" type="file" multiple />
        </label>
        <label>
          {s.manualLinksLabel}
          <textarea
            value={form.files}
            onChange={(e) => onFormChange({ ...form, files: e.target.value })}
            placeholder={s.manualLinksPlaceholder}
            rows={4}
          />
        </label>
      </fieldset>

      <p className="admin-hint">
        {s.willAppearAt}{" "}
        <a href={previewHref} target="_blank" className="admin-page-link">
          /section/{selectedSection.slug}/{selectedPage.slug}
        </a>
      </p>
      {message ? <p className="admin-hint">{message}</p> : null}

      <div className="admin-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? s.saving : editingId ? s.updateButton : s.addButton}
        </button>
        {editingId ? (
          <button type="button" className="secondary-button" onClick={onCancelEdit}>
            {s.cancel}
          </button>
        ) : null}
      </div>

      {savedEntry && !editingId && (
        <div className="admin-save-preview">
          <p className="admin-hint" style={{ marginBottom: "0.5rem" }}>
            {s.savedPreviewHint}{" "}
            <a
              href={`/hy/section/${savedEntry.sectionSlug}/${savedEntry.pageSlug}`}
              target="_blank"
              className="admin-page-link"
            >
              {s.viewOnSite}
            </a>
          </p>
          <MaterialPreviewCard entry={savedEntry} />
        </div>
      )}
    </form>
  );
}
