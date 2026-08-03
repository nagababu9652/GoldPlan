import { InputHTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";
import { radioVariants } from "./radio.variants";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof radioVariants> {
  label?: string;
}