"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";

import {
  archiveDocument,
  getDocuments,
  type Document,
} from "@/lib/api";

import { documentColumns } from "./columns";

function formatSize(bytes: number | null) {
  if (!bytes) return "-";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function DocumentTable() {
  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [documentType, setDocumentType] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDocuments = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const response =
          await getDocuments(token, {
            search: search.trim() || undefined,
            status: status || undefined,
            document_type:
              documentType || undefined,
          });

        setDocuments(response.documents);
      } catch (err) {
        console.error(
          "Failed to load documents:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load documents.",
        );
      } finally {
        setLoading(false);
      }
    },
    [search, status, documentType],
  );

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleArchive(
    document: Document,
  ) {
    const confirmed = window.confirm(
      `Archive "${document.document_name}"?`,
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      await archiveDocument(
        token,
        document.id,
      );

      await loadDocuments();
    } catch (err) {
      console.error(
        "Failed to archive document:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to archive document.",
      );
    }
  }

  const filteredDocuments = useMemo(() => {
    /*
     * Backend already handles search.
     * This fallback keeps the table responsive
     * if the backend returns a broader result.
     */
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return documents;
    }

    return documents.filter((document) =>
      [
        document.document_name,
        document.document_type,
        document.file_name,
        document.customer_name,
        document.group_name,
        document.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [documents, search]);

  const totalSize = useMemo(
    () =>
      filteredDocuments.reduce(
        (total, document) =>
          total + (document.file_size || 0),
        0,
      ),
    [filteredDocuments],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Documents
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer and group documents.
          </p>
        </div>

        <Link
          href="/advisor-dashboard/documents/new"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Upload Document
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Documents
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {filteredDocuments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Active
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {
              filteredDocuments.filter(
                (document) =>
                  document.status === "ACTIVE",
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Storage
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {formatSize(totalSize)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_200px_auto]">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search documents, customers, groups..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All Statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="ARCHIVED">
              Archived
            </option>
          </select>

          <select
            value={documentType}
            onChange={(event) =>
              setDocumentType(event.target.value)
            }
            className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          >
            <option value="">
              All Document Types
            </option>

            <option value="KYC">KYC</option>
            <option value="PAN">PAN</option>
            <option value="AADHAAR">
              Aadhaar
            </option>
            <option value="BANK">Bank</option>
            <option value="INVESTMENT">
              Investment
            </option>
            <option value="AGREEMENT">
              Agreement
            </option>
            <option value="TAX">Tax</option>
            <option value="INSURANCE">
              Insurance
            </option>
            <option value="RISK_ASSESSMENT">
              Risk Assessment
            </option>
            <option value="OTHER">
              Other
            </option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setDocumentType("");
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <EnterpriseTable
          columns={documentColumns}
          data={filteredDocuments}
          loading={loading}
          emptyMessage="No documents found."
        />
      </div>
    </div>
  );
}