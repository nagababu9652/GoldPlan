import { InputHTMLAttributes } from "react";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "defaultChecked"> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}