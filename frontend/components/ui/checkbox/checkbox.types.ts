import { InputHTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";

import { checkboxVariants } from "./checkbox.variants";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  helperText?: string;
}