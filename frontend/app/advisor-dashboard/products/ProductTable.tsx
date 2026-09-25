"use client";

import { DataTable } from "@/components/data-table";

import {
productColumns,
} from "./product.columns";

import { Product } from "@/components/data-table/examples/product.types";

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