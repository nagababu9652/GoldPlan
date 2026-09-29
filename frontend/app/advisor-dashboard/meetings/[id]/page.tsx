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
      <div className="dashboard-panel p-4 lg:p-5">
        <Link
          href="/advisor-dashboard/meetings"
          className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ash transition-colors hover:text-obsidian"
        >
          ← Back to Meetings
        </Link>
      </div>

      {loading ? (
        <div className="dashboard-panel p-6 lg:p-8">
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Meeting details
          </div>
          <p className="mt-4 text-sm text-ash">Loading meeting...</p>
        </div>
      ) : error ? (
        <div className="dashboard-panel p-6 lg:p-8">
          <div className="dashboard-pill border-red-200 bg-red-50 text-red-600">
            Meeting details
          </div>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      ) : meeting ? (
        <MeetingDetail meeting={meeting} />
      ) : (
        <div className="dashboard-panel p-6 lg:p-8">
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Meeting details
          </div>
          <p className="mt-4 text-sm text-ash">Meeting not found.</p>
        </div>
      )}
    </div>
  );
}