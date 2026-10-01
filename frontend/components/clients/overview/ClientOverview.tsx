"use client";

import type { Client } from "@/lib/api";
import { Card } from "@/components/ui/card";

interface Props {
  client: Client;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value ?? "—"}</p>
    </div>
  );
}

export default function ClientOverview({ client }: Props) {
  const clientName =
    `${client.first_name || ""} ${client.last_name || ""}`.trim();

  return (
    <div className="space-y-3">
      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Personal Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="First Name" value={client.first_name} />

          <InfoItem label="Last Name" value={client.last_name} />

          <InfoItem label="Full Name" value={clientName} />

          <InfoItem
            label="Date of Birth"
            value={formatDate(client.date_of_birth)}
          />

          <InfoItem label="Age" value={client.age} />

          <InfoItem label="Gender" value={client.gender} />

          <InfoItem
            label="Marital Status"
            value={client.marital_status}
          />

          <InfoItem
            label="Occupation"
            value={client.occupation}
          />
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Contact Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Email" value={client.email} />

          <InfoItem label="Phone" value={client.phone} />

          <InfoItem
            label="Alternate Phone"
            value={client.alternate_phone}
          />

          <InfoItem label="PAN" value={client.pan_number} />

          <InfoItem
            label="Aadhaar"
            value={client.aadhar_number}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Address Information</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Address Line 1" value={client.address_line1} />
          <InfoItem label="Address Line 2" value={client.address_line2} />
          <InfoItem label="City" value={client.city} />
          <InfoItem label="State" value={client.state} />
          <InfoItem label="Pincode" value={client.pincode} />
          <InfoItem label="Country" value={client.country} />
        </div>
      </Card>

      {/* Client Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Client Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Customer Code"
            value={client.customer_code}
          />

          <InfoItem label="Status" value={client.status} />

          <InfoItem
            label="Resident Status"
            value={client.resident_status}
          />

          <InfoItem
            label="Risk Profile"
            value={client.risk_profile}
          />

          <InfoItem
            label="KYC Status"
            value={client.kyc_status}
          />

          <InfoItem
            label="KYC Verified Date"
            value={formatDate(client.kyc_verified_date)}
          />

          <InfoItem
            label="Onboarding Date"
            value={formatDate(client.onboarding_date)}
          />

          <InfoItem
            label="Group"
            value={client.group_name || "No group"}
          />
        </div>
      </Card>

      {/* Financial Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Financial Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Annual Income"
            value={
              client.annual_income != null
                ? `₹ ${client.annual_income.toLocaleString("en-IN")}`
                : "—"
            }
          />

          <InfoItem
            label="Net Worth"
            value={
              client.net_worth != null
                ? `₹ ${client.net_worth.toLocaleString("en-IN")}`
                : "—"
            }
          />

          <InfoItem
            label="Investment Experience"
            value={client.investment_experience}
          />

        </div>
      </Card>

      {/* Bank Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">
          Bank Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Bank Name" value={client.bank_name} />

          <InfoItem
            label="Account Number"
            value={client.account_number}
          />

          <InfoItem
            label="IFSC Code"
            value={client.ifsc_code}
          />

          <InfoItem
            label="Account Type"
            value={client.account_type}
          />
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Notes
        </h2>

        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {client.notes || "No notes available."}
        </p>
      </Card>
    </div>
  );
}
