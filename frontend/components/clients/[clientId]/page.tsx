"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getClient, type Client } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = String(params.clientId);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login to access client details.");
          return;
        }

        const response = await getClient(token, Number(clientId));

        setClient(response);
      } catch (err) {
        console.error("Client details loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load client details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-ash">
          Loading client...
        </p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back
        </Button>

        <div className="rounded-2xl border border-line bg-bone p-6">
          <p className="text-sm text-red-600">
            {error || "Client not found."}
          </p>
        </div>
      </div>
    );
  }

  const fullName =
    `${client.first_name} ${client.last_name}`.trim();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>

          <h1 className="mt-4 text-3xl font-bold">
            {fullName}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Client profile and financial information
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Personal Information
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {client.email ?? "—"}
            </p>

            <p>
              <span className="font-medium">Phone:</span>{" "}
              {client.phone ?? "—"}
            </p>

            <p>
              <span className="font-medium">Date of Birth:</span>{" "}
              {client.date_of_birth ?? "—"}
            </p>

            <p>
              <span className="font-medium">Age:</span>{" "}
              {client.age ?? "—"}
            </p>

            <p>
              <span className="font-medium">Gender:</span>{" "}
              {client.gender ?? "—"}
            </p>

            <p>
              <span className="font-medium">Marital Status:</span>{" "}
              {client.marital_status ?? "—"}
            </p>

            <p>
              <span className="font-medium">Occupation:</span>{" "}
              {client.occupation ?? "—"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Financial Profile
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <p>
              <span className="font-medium">Annual Income:</span>{" "}
              {client.annual_income != null
                ? `₹ ${client.annual_income.toLocaleString("en-IN")}`
                : "—"}
            </p>

            <p>
              <span className="font-medium">Net Worth:</span>{" "}
              {client.net_worth != null
                ? `₹ ${client.net_worth.toLocaleString("en-IN")}`
                : "—"}
            </p>

            <p>
              <span className="font-medium">Risk Profile:</span>{" "}
              {client.risk_profile ?? "—"}
            </p>

            <p>
              <span className="font-medium">
                Investment Experience:
              </span>{" "}
              {client.investment_experience ?? "—"}
            </p>

            <p>
              <span className="font-medium">Financial Goals:</span>{" "}
              {client.financial_goals ?? "—"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Address
          </h2>

          <div className="mt-5 space-y-2 text-sm">
            <p>{client.address_line1 ?? "—"}</p>

            {client.address_line2 && (
              <p>{client.address_line2}</p>
            )}

            <p>
              {[client.city, client.state, client.pincode]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>

            <p>{client.country ?? "—"}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            KYC & Group
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <p>
              <span className="font-medium">KYC Status:</span>{" "}
              {client.kyc_status ?? "—"}
            </p>

            <p>
              <span className="font-medium">PAN:</span>{" "}
              {client.pan_number ?? "—"}
            </p>

            <p>
              <span className="font-medium">Group:</span>{" "}
              {client.group_name ?? "—"}
            </p>

            <p>
              <span className="font-medium">Status:</span>{" "}
              {client.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-bone p-6">
        <h2 className="text-lg font-semibold">
          Nominee
        </h2>

        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {client.nominee_name ?? "—"}
          </p>

          <p>
            <span className="font-medium">Relation:</span>{" "}
            {client.nominee_relation ?? "—"}
          </p>

          <p>
            <span className="font-medium">Contact:</span>{" "}
            {client.nominee_contact ?? "—"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-bone p-6">
        <h2 className="text-lg font-semibold">
          Notes
        </h2>

        <p className="mt-4 text-sm text-muted-foreground">
          {client.notes ?? "No notes available."}
        </p>
      </section>
    </div>
  );
}