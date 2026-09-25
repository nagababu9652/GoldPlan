"use client";

import { DataTable } from "@/components/data-table";

import {
portfolioColumns,
} from "./portfolio.columns";

import { Portfolio } from "@/components/data-table/examples/portfolio.types";

interface Props{

portfolios:Portfolio[];

}

export default function PortfolioTable({

portfolios,

}:Props){

return(

<DataTable

columns={portfolioColumns}

data={portfolios}

searchable

filterable

selectable

pagination

exportable

/>

);

}