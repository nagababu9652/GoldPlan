"use client";

import { useEffect, useState } from "react";

import MeetingTable from "./MeetingTable";

import { getMeetings } from "./meeting.service";

export default function MeetingsPage() {

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getMeetings().then((data) => {

      setMeetings(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <MeetingTable meetings={meetings} />;

}