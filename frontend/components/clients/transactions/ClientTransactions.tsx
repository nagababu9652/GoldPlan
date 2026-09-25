import TransactionsSummary from "./TransactionsSummary";

import TransactionsTable from "./TransactionsTable";

interface Props{

transactions:any[];

}

export default function ClientTransactions({

transactions

}:Props){

const sip=transactions
.filter(t=>t.type==="SIP")
.reduce((a,b)=>a+b.amount,0);

const purchase=transactions
.filter(t=>t.type==="Purchase")
.reduce((a,b)=>a+b.amount,0);

return(

<div className="space-y-6">

<TransactionsSummary

total={transactions.length}

sip={sip}

purchase={purchase}

/>

<TransactionsTable

transactions={transactions}

/>

</div>

);

}