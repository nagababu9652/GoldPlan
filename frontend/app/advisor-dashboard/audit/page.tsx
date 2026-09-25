"use client";

import { useEffect, useState } from "react";

import { AuditTable, getAuditLogs } from ".";

export default function AuditPage() {

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getAuditLogs().then((data) => {

      setAuditLogs(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <AuditTable auditLogs={auditLogs} />;

}