"use client";

import { useEffect, useState } from "react";

import ProductTable from "./ProductTable";

import { getProducts } from "./product.service";

export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getProducts().then((data) => {

      setProducts(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <ProductTable products={products} />;

}