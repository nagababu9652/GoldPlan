import ClientTransactions from "@/components/clients/transactions/ClientTransactions";

import { getTransactions } from "@/components/clients/transactions/api";

export default async function Page(){

const transactions=await getTransactions();

return(

<ClientTransactions

transactions={transactions}

/>

);

}