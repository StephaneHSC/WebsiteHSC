"use client";

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { CloudUpload, CloseX, FileGlyph } from "@/components/icons/quote";
import { QUOTE_FILE_LIMITS } from "@/lib/constants";
import { validateFile } from "@/lib/forms/quoteForm";

export type FileDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function truncateName(name: string, limit = 24): string {
  if (name.length <= limit) return name;
  const ext = name.lastIndexOf(".") > 0 ? name.slice(name.lastIndexOf(".")) : "";
  const stem = name.slice(0, limit - ext.length - 1);
  return `${stem}…${ext}`;
}

export function FileDropzone({ files, onChange, error }: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setInlineError(null);
    const next = [...files];
    for (const f of Array.from(incoming)) {
      const result = validateFile(f, next);
      if (!result.ok) {
        setInlineError(result.reason);
        break;
      }
      next.push(f);
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setInlineError(null);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer?.files ?? null);
  };

  const onSelect = (event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files);

  const displayedError = inlineError ?? error;

  return (
    <div>
      <div className="mb-[10px] flex flex-wrap items-end justify-between gap-2">
        <span className="font-body text-text-muted-2 text-[10px] tracking-[0.04em] uppercase lg:text-[12px]">
          Attachments (Optional)
        </span>
        <span className="font-body text-text-muted-2 text-[10px] tracking-[0.02em] uppercase lg:text-[11px]">
          PDF, DOC, XLS, Images, CAD up to 10 MB total
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload attachments"
        className={cn(
          "focus-visible:ring-brand-red flex h-[100px] w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:h-[120px]",
          dragOver
            ? "border-brand-red bg-brand-red/5"
            : displayedError
              ? "border-brand-red"
              : "border-input-border hover:border-brand-red",
        )}
      >
        <CloudUpload className="text-input-placeholder mb-[8px] size-[32px] lg:size-[40px]" />
        <span className="font-body text-text-muted-2 text-center text-[13px] lg:text-[15px]">
          Drop files here, or{" "}
          <span className="text-brand-red underline-offset-2 hover:underline">click to browse</span>
        </span>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={QUOTE_FILE_LIMITS.allowedExtensions.join(",")}
          onChange={onSelect}
          className="sr-only"
        />
      </div>

      {files.length > 0 ? (
        <ul className="mt-[12px] flex flex-wrap gap-[8px]">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="bg-surface-alt border-input-border inline-flex items-center gap-[8px] rounded-full border px-[12px] py-[6px]"
            >
              <FileGlyph className="text-text-muted-2 size-[14px] shrink-0" />
              <span className="font-body text-ink text-[12px]">{truncateName(file.name)}</span>
              <span className="font-body text-text-muted-2 text-[11px]">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeAt(index)}
                className="text-text-muted-2 hover:text-brand-red flex size-[18px] items-center justify-center rounded-full"
              >
                <CloseX className="size-[12px]" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {displayedError ? (
        <span role="alert" className="text-brand-red font-body mt-[8px] block text-[12px]">
          {displayedError}
        </span>
      ) : null}
    </div>
  );
}
