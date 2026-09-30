"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getClients,
  getGroups,
  getDocument,
  updateDocument,
  uploadDocument,
  type Client,
  type Group,
} from "@/lib/api";

type Props = {
  mode: "create" | "edit";
  documentId?: number;
};

const DOCUMENT_TYPES = [
  "KYC",
  "PAN",
  "AADHAAR",
  "BANK",
  "INVESTMENT",
  "AGREEMENT",
  "TAX",
  "INSURANCE",
  "RISK_ASSESSMENT",
  "OTHER",
];

function formatFileSize(bytes: number) {
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

function getFileIcon(file: File | null) {
  if (!file) return "📄";

  const type = file.type.toLowerCase();

  if (type.includes("pdf")) return "📕";
  if (type.includes("image")) return "🖼️";
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

export default function DocumentForm({
  mode,
  documentId,
}: Props) {
  const router = useRouter();

  const [documentType, setDocumentType] =
    useState("KYC");

  const [description, setDescription] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [customerId, setCustomerId] =
    useState("");

  const [groupId, setGroupId] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [groupSearch, setGroupSearch] =
    useState("");

  const [customers, setCustomers] =
    useState<Client[]>([]);

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [existingFileName, setExistingFileName] =
    useState("");

  const [loading, setLoading] =
    useState(mode === "edit");

  const [loadingOptions, setLoadingOptions] =
    useState(mode === "create");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);

  /*
   * Load customers/groups for create mode.
   */
  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const [clientsResponse, groupsResponse] =
          await Promise.all([
            getClients(token, {
              page_size: 100,
              page: 1,
            }),
            getGroups(token),
          ]);

        setCustomers(
          clientsResponse.clients ?? [],
        );

        setGroups(
          groupsResponse.groups ?? [],
        );
      } catch (err) {
        console.error(
          "Failed to load document options:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load customers and groups.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [mode]);

  /*
   * Load existing document for edit mode.
   */
  useEffect(() => {
    if (mode !== "edit") {
      return;
    }

    if (documentId === undefined) {
      setError("Document ID is missing.");
      setLoading(false);
      return;
    }

    async function loadDocument() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const [document, clientsResponse, groupsResponse] =
          await Promise.all([
            getDocument(token, documentId!),
            getClients(token, {
              page_size: 100,
              page: 1,
            }),
            getGroups(token),
          ]);

        setCustomers(
          clientsResponse.clients ?? [],
        );

        setGroups(groupsResponse.groups ?? []);

        setDocumentType(
          document.document_type || "OTHER",
        );

        setDescription(
          document.description || "",
        );

        setNotes(document.notes || "");

        setCustomerId(
          document.customer_id
            ? String(document.customer_id)
            : "",
        );

        setGroupId(
          document.customer_group_id
            ? String(document.customer_group_id)
            : "",
        );

        setExistingFileName(
          document.file_name ||
            document.document_name ||
            "",
        );
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
    }

    loadDocument();
  }, [mode, documentId]);

  /*
   * Search customers locally after loading them.
   */
  const filteredCustomers = useMemo(() => {
    const value =
      customerSearch.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.customer_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [customers, customerSearch]);

  /*
   * Search groups locally.
   */
  const filteredGroups = useMemo(() => {
    const value =
      groupSearch.trim().toLowerCase();

    if (!value) {
      return groups;
    }

    return groups.filter((group) =>
      [
        group.group_name,
        group.group_code,
        group.group_type,
        group.head_customer_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [groups, groupSearch]);

  const selectedCustomer = customers.find(
    (customer) =>
      String(customer.id) === customerId,
  );

  const selectedGroup = groups.find(
    (group) =>
      String(group.id) === groupId,
  );

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setError("");
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0] ?? null;

    if (!file) return;

    setSelectedFile(file);
    setError("");
  }

  function clearFile() {
    setSelectedFile(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      if (!customerId && !groupId) {
        setError(
          "Please select either a customer or a group.",
        );
        return;
      }

      if (mode === "create") {
        if (!selectedFile) {
          setError(
            "Please select a document file.",
          );
          return;
        }

        const created =
          await uploadDocument(token, {
            customer_id: customerId
              ? Number(customerId)
              : null,

            customer_group_id: groupId
              ? Number(groupId)
              : null,

            document_type: documentType,

            description:
              description.trim() || null,

            notes:
              notes.trim() || null,

            file: selectedFile,
          });

        router.push(
          `/advisor-dashboard/documents/${created.id}`,
        );

        return;
      }

      if (!documentId) {
        setError("Document ID is missing.");
        return;
      }

      /*
       * Edit currently updates metadata only.
       *
       * File replacement can be added later as a
       * separate backend endpoint without pretending
       * that the existing update endpoint handles files.
       */
      await updateDocument(
        token,
        documentId,
        {
          customer_id: customerId
            ? Number(customerId)
            : null,
          customer_group_id: groupId
            ? Number(groupId)
            : null,
          document_type: documentType,
          description:
            description.trim() || null,
          notes:
            notes.trim() || null,
        },
      );

      router.push(
        `/advisor-dashboard/documents/${documentId}`,
      );
    } catch (err) {
      console.error(
        "Failed to save document:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save document.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || loadingOptions) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-32 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      {/* Header */}
      <div>
        <Link
          href="/advisor-dashboard/documents"
          className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Documents
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
          {mode === "create"
            ? "Upload Document"
            : "Edit Document"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {mode === "create"
            ? "Upload and attach a document to a customer or group."
            : "Update the document information."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        {/* Basic information */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900">
            Document Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the document category and attach it
            to the appropriate customer or group.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* Document Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Document Type
              </label>

              <select
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Customer
              </label>

              <input
                value={
                  selectedCustomer
                    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                    : customerSearch
                }
                onChange={(event) => {
                  setCustomerSearch(
                    event.target.value,
                  );
                  setCustomerId("");
                }}
                placeholder="Search customer..."
                disabled={Boolean(groupId)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
              />

              {!groupId &&
                customerSearch &&
                !selectedCustomer && (
                  <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No customers found.
                      </div>
                    ) : (
                      filteredCustomers.map(
                        (customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setCustomerId(
                                String(customer.id),
                              );
                              setCustomerSearch("");
                            }}
                            className="block w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {
                                customer.first_name
                              }{" "}
                              {
                                customer.last_name
                              }
                            </div>

                            <div className="mt-0.5 text-xs text-gray-500">
                              {customer.customer_code}
                              {customer.email
                                ? ` · ${customer.email}`
                                : ""}
                            </div>
                          </button>
                        ),
                      )
                    )}
                  </div>
                )}

              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerId("");
                    setCustomerSearch("");
                  }}
                  className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  Clear customer
                </button>
              )}
            </div>

            {/* Group */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Group
              </label>

              <input
                value={
                  selectedGroup
                    ? selectedGroup.group_name
                    : groupSearch
                }
                onChange={(event) => {
                  setGroupSearch(
                    event.target.value,
                  );
                  setGroupId("");
                }}
                placeholder="Search group..."
                disabled={Boolean(customerId)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
              />

              {!customerId &&
                groupSearch &&
                !selectedGroup && (
                  <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {filteredGroups.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No groups found.
                      </div>
                    ) : (
                      filteredGroups.map(
                        (group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => {
                              setGroupId(
                                String(group.id),
                              );
                              setGroupSearch("");
                            }}
                            className="block w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {group.group_name}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-500">
                              {group.group_code}
                              {group.group_type
                                ? ` · ${group.group_type}`
                                : ""}
                            </div>
                          </button>
                        ),
                      )
                    )}
                  </div>
                )}

              {selectedGroup && (
                <button
                  type="button"
                  onClick={() => {
                    setGroupId("");
                    setGroupSearch("");
                  }}
                  className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  Clear group
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
            Select either a customer or a group. A
            document cannot be attached to both.
          </div>
        </div>

        {/* File upload */}
        {mode === "create" && (
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Document File
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              PDF, images, Word, Excel, CSV and text
              files up to 25 MB.
            </p>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() =>
                setDragActive(false)
              }
              onDrop={handleDrop}
              className={`mt-5 rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragActive
                  ? "border-gray-500 bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {!selectedFile ? (
                <>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
                    ↑
                  </div>

                  <p className="mt-4 text-sm font-medium text-gray-900">
                    Drop your file here
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    or choose a file from your computer
                  </p>

                  <label className="mt-5 inline-flex cursor-pointer rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
                    Choose File

                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    />
                  </label>
                </>
              ) : (
                <div className="mx-auto flex max-w-xl items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
                    {getFileIcon(selectedFile)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedFile.type ||
                        "Unknown file type"}{" "}
                      ·{" "}
                      {formatFileSize(
                        selectedFile.size,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing file */}
        {mode === "edit" && (
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Current File
            </h2>

            <div className="mt-4 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
                📄
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {existingFileName ||
                    "Existing document"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  File replacement can be added separately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="border-b border-gray-200 p-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={4}
            placeholder="Add a short description..."
            className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        {/* Notes */}
        <div className="p-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={3}
            placeholder="Internal notes..."
            className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 p-5 sm:flex-row sm:justify-end">
          <Link
            href="/advisor-dashboard/documents"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? mode === "create"
                ? "Uploading..."
                : "Saving..."
              : mode === "create"
                ? "Upload Document"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}