import { VariantProps } from "class-variance-authority";
import {
  dropdownContentVariants,
  dropdownItemVariants,
} from "./dropdown.variants";

export interface DropdownContentProps
  extends VariantProps<typeof dropdownContentVariants> {}

export interface DropdownItemProps
  extends VariantProps<typeof dropdownItemVariants> {
  inset?: boolean;
}