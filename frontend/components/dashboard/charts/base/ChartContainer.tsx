"use client";

import { ReactNode } from "react";

import ChartLoading from "./ChartLoading";

import ChartEmpty from "./ChartEmpty";

interface Props {
  children: ReactNode;

  loading?: boolean;

  empty?: boolean;
}

export default function ChartContainer({
  children,
  loading,
  empty,
}: Props) {
  if (loading) {
    return <ChartLoading />;
  }

  if (empty) {
    return <ChartEmpty />;
  }

  return <>{children}</>;
}