"use client";

import { useEffect, useState } from "react";

import SipTable from "./SipTable";

import { getSips } from "./sip.service";

export default function SipPage() {

  const [sips, setSips] = useState<SIP[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getSips().then((data) => {

      setSips(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <SipTable sips={sips} />;

}