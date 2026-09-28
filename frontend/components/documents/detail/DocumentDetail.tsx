"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  archiveDocument,
  getDocument,
  type Document,
} from "@/lib/api";

type Props = {
  documentId: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function formatDate(
  value: string | null,
) {
  if (!value) return "-";

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatSize(
  bytes: number | null,
) {
  if (!bytes) return "-";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

function getDocumentUrl(
  fileUrl: string,
) {
  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  return `${API_BASE_URL.replace(
    /\/$/,
    "",
  )}/${fileUrl.replace(/^\//, "")}`;
}

function getFileIcon(
  fileType: string | null,
) {
  const type =
    fileType?.toLowerCase() || "";

  if (type.includes("pdf")) {
    return "📕";
  }

  if (type.includes("image")) {
    return "🖼️";
  }

  if (
    type.includes("word") ||
    type.includes("document")
  ) {
    return "📝";
  }

  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("csv")
  ) {
    return "📊";
  }

  return "📄";
}

export default function DocumentDetail({
  documentId,
}: Props) {
  const [document, setDocument] =
    useState<Document | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDocument = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "finplan_token",
          );

        if (!token) {
          setError("Please login.");
          return;
        }

        const response =
          await getDocument(
            token,
            documentId,
          );

        setDocument(response);
      } catch (err) {
        console.error(
          "Failed to load document:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load document.",
        );
      } finally {
        setLoading(false);
      }
    },
    [documentId],
  );

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  async function handleArchive() {
    if (!document) return;

    const confirmed =
      window.confirm(
        `Archive "${document.document_name}"?`,
      );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem(
          "finplan_token",
        );

      if (!token) {
        setError("Please login.");
        return;
      }

      const updated =
        await archiveDocument(
          token,
          document.id,
        );

      setDocument(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to archive document.",
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-40 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/advisor-dashboard/documents"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to Documents
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/advisor-dashboard/documents"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to Documents
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
          Document not found.
        </div>
      </div>
    );
  }

  const documentUrl =
    document.file_url
      ? getDocumentUrl(
          document.file_url,
        )
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/advisor-dashboard/documents"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Documents
          </Link>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              {getFileIcon(
                document.file_type,
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {document.document_name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {document.document_type}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    document.status ===
                    "ACTIVE"
                      ? "bg-green-50 text-green-700"
                      : document.status ===
                          "ARCHIVED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/advisor-dashboard/documents/${document.id}/edit`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>

          {document.status !==
            "ARCHIVED" && (
            <button
              type="button"
              onClick={handleArchive}
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* File card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
              {getFileIcon(
                document.file_type,
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {document.file_name ||
                  document.document_name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {document.file_type ||
                  "Unknown file type"}{" "}
                ·{" "}
                {formatSize(
                  document.file_size,
                )}
              </p>
            </div>
          </div>

          {documentUrl && (
            <div className="flex gap-2">
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Open Document
              </a>

              <a
                href={documentUrl}
                download={
                  document.file_name ||
                  document.document_name
                }
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Document Information
          </h2>

          <dl className="mt-5 divide-y divide-gray-100">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">
                Type
              </dt>

              <dd className="text-right text-sm font-medium text-gray-900">
                {document.document_type ||
                  "-"}
              </dd>
            </div>

            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">
                Status
              </dt>

              <dd className="text-right text-sm font-medium text-gray-900">
                {document.status}
              </dd>
            </div>

            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">
                File Type
              </dt>

              <dd className="max-w-[60%] truncate text-right text-sm font-medium text-gray-900">
                {document.file_type ||
                  "-"}
              </dd>
            </div>

            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">
                Size
              </dt>

              <dd className="text-right text-sm font-medium text-gray-900">
                {formatSize(
                  document.file_size,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">
                Created
              </dt>

              <dd className="text-right text-sm font-medium text-gray-900">
                {formatDate(
                  document.created_at,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">
                Updated
              </dt>

              <dd className="text-right text-sm font-medium text-gray-900">
                {formatDate(
                  document.updated_at,
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Customer / Group */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Customer / Group
          </h2>

          <dl className="mt-5 divide-y divide-gray-100">
            <div className="py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Customer
              </dt>

              <dd className="mt-1 text-sm font-medium text-gray-900">
                {document.customer_name ||
                  "-"}
              </dd>
            </div>

            <div className="py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Group
              </dt>

              <dd className="mt-1 text-sm font-medium text-gray-900">
                {document.group_name ||
                  "-"}
              </dd>
            </div>

            <div className="py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Document ID
              </dt>

              <dd className="mt-1 text-sm font-medium text-gray-900">
                #{document.id}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Description */}
      {document.description && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
            {document.description}
          </p>
        </div>
      )}

      {/* Notes */}
      {document.notes && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Notes
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
            {document.notes}
          </p>
        </div>
      )}
    </div>
  );
}