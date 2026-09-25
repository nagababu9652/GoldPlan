"use client";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";

import { transactionColumns } from "./columns";

interface Props{

transactions:any[];

}

export default function TransactionsTable({

transactions

}:Props){

return(

<EnterpriseTable

columns={transactionColumns}

data={transactions}

/>

);

}