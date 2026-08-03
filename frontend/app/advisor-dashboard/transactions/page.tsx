"use client";

import { useEffect, useState } from "react";

import TransactionTable from "./TransactionTable";

import { getTransactions } from "./transaction.service";

export default function TransactionsPage() {

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getTransactions().then((data) => {

      setTransactions(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <TransactionTable transactions={transactions} />;

}