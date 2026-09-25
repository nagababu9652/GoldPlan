"use client";

import { useEffect, useState } from "react";

import UserTable from "./UserTable";

import { getUsers } from "./user.service";

import { User } from "@/components/data-table/examples/user.types";

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getUsers().then((data) => {

      setUsers(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <UserTable users={users} />;

}