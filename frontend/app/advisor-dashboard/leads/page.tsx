"use client";

import { useEffect, useState } from "react";

import LeadTable from "./LeadTable";

import { getLeads } from "./lead.service";

export default function LeadsPage() {

  const [leads, setLeads] = useState<Lead[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getLeads().then((data) => {

      setLeads(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <LeadTable leads={leads} />;

}