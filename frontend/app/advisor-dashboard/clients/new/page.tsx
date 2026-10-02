"use client";

import { useState } from "react";
import { createClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSingleSubmission } from "@/lib/use-single-submission";

export default function NewClientPage() {
  const router = useRouter();
  const { run, finish, submitting, keyFor } = useSingleSubmission();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("finplan_token")
      : null;
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    occupation: "",
    pan_number: "",
    aadhar_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    annual_income: "",
    net_worth: "",
    risk_profile: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    notes: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
    ) => {
    event.preventDefault();

    if (!token) {
        alert("You are not logged in.");
        return;
    }

    await run(async () => {
    try {
        const payload = {
        ...form,
        date_of_birth: form.date_of_birth || undefined,
        annual_income: form.annual_income
            ? Number(form.annual_income)
            : undefined,
        net_worth: form.net_worth
            ? Number(form.net_worth)
            : undefined,
        };
        const client = await createClient(token, payload, keyFor(payload));

        finish();

        console.log("Client created:", client);

        alert("Client created successfully.");
        console.log("2. REDIRECTING NOW");

        router.push("/advisor-dashboard/clients");
        console.log("3. REDIRECT CALLED");
    } catch (error) {
        console.error("Failed to create client:", error);

        alert(
        error instanceof Error
            ? error.message
            : "Failed to create client."
        );
    }
    });
    };

  return (
    <div className="space-y-3">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Client onboarding
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Add Client
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Create a new client profile.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Personal Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="alternate_phone"
              placeholder="Alternate Phone"
              value={form.alternate_phone}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>

            <select
              name="marital_status"
              value={form.marital_status}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            >
              <option value="">Select Marital Status</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
            </select>
          </div>
        </section>

        {/* Professional & Financial Information */}
        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Professional & Financial Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              name="occupation"
              placeholder="Occupation"
              value={form.occupation}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="pan_number"
              placeholder="PAN Number"
              value={form.pan_number}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="aadhar_number"
              placeholder="Aadhaar Number"
              value={form.aadhar_number}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <select
              name="risk_profile"
              value={form.risk_profile}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            >
              <option value="">Select Risk Profile</option>
              <option value="CONSERVATIVE">Conservative</option>
              <option value="MODERATE">Moderate</option>
              <option value="AGGRESSIVE">Aggressive</option>
              <option value="VERY_AGGRESSIVE">Very Aggressive</option>
            </select>

            <input
              name="annual_income"
              type="number"
              placeholder="Annual Income"
              value={form.annual_income}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="net_worth"
              type="number"
              placeholder="Net Worth"
              value={form.net_worth}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />
          </div>
        </section>

        {/* Address */}
        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Address Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              name="address_line1"
              placeholder="Address Line 1"
              value={form.address_line1}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3 md:col-span-2"
            />

            <input
              name="address_line2"
              placeholder="Address Line 2"
              value={form.address_line2}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3 md:col-span-2"
            />

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="pincode"
              placeholder="PIN Code"
              value={form.pincode}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />
          </div>
        </section>

        {/* Bank Information */}
        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Bank Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              name="bank_name"
              placeholder="Bank Name"
              value={form.bank_name}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="account_number"
              placeholder="Account Number"
              value={form.account_number}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />

            <input
              name="ifsc_code"
              placeholder="IFSC Code"
              value={form.ifsc_code}
              onChange={handleChange}
              className="rounded-lg border border-line bg-background px-4 py-3"
            />
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-line bg-bone p-6">
          <h2 className="text-lg font-semibold">
            Notes
          </h2>

          <textarea
            name="notes"
            placeholder="Additional notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="mt-5 w-full rounded-lg border border-line bg-background px-4 py-3"
          />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-obsidian px-6 py-3 font-medium text-bone disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
