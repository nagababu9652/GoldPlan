"use client";

import { useEffect, useState } from "react";

import NotificationTable from "./NotificationTable";

import { getNotifications } from "./notification.service";

import { Notification } from "@/components/data-table/examples/notification.types";

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getNotifications().then((data) => {

      setNotifications(data);

      setLoading(false);

    });

  }, []);

  if (loading) return (
    <div className="dashboard-panel p-6 lg:p-8">
      <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Notifications</div>
      <p className="mt-4 text-sm text-ash">Loading notifications...</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Monitoring
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Notifications
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Track alerts, reminders, and updates requiring your attention.
        </p>
      </div>

      <NotificationTable notifications={notifications} />
    </div>
  );

}