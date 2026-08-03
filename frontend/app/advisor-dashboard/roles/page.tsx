"use client";

import { useEffect, useState } from "react";

import RoleTable from "./RoleTable";

import { getRoles } from "./role.service";

export default function RolesPage() {

  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getRoles().then((data) => {

      setRoles(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <RoleTable roles={roles} />;

}