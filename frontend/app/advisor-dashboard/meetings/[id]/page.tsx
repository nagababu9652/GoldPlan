"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  getMeeting,
  type Meeting,
} from "@/lib/api";

import { MeetingDetail } from "@/components/meetings/detail";

export default function MeetingDetailPage() {
  const params = useParams();

  const id = Number(params.id);

  const [meeting, setMeeting] =
    useState<Meeting | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadMeeting() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        if (!Number.isFinite(id)) {
          setError("Invalid meeting ID.");
          return;
        }

        const response =
          await getMeeting(token, id);

        setMeeting(response);
      } catch (err) {
        console.error(
          "Failed to load meeting:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load meeting.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeeting();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/advisor-dashboard/meetings"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Meetings
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            Loading meeting...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-bone p-8 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : meeting ? (
        <MeetingDetail meeting={meeting} />
      ) : (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            Meeting not found.
          </p>
        </div>
      )}
    </div>
  );
}