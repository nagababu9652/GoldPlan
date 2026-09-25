"use client";

import { useEffect, useState } from "react";

import ProspectTable from "./ProspectTable";

import { getProspects } from "./prospect.service";

import { Prospect } from "@/components/data-table/examples/prospect.types";

export default function ProspectsPage() {

  const [prospects, setProspects] = useState<Prospect[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getProspects().then((data) => {

      setProspects(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <ProspectTable prospects={prospects} />;

}