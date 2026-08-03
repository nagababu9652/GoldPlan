"use client";

import { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function AvatarImage({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}