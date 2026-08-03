"use client";

import DataTable from "@/components/data-table";

import {
productColumns,
} from "./product.columns";

interface Props{

products:Product[];

}

export default function ProductTable({

products,

}:Props){

return(

<DataTable

columns={productColumns}

data={products}

searchable

filterable

selectable

pagination

exportable

/>

);

}