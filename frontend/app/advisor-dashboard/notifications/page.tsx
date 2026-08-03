"use client";

import { useEffect, useState } from "react";

import NotificationTable from "./NotificationTable";

import { getNotifications } from "./notification.service";

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getNotifications().then((data) => {

      setNotifications(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <NotificationTable notifications={notifications} />;

}