import { VariantProps } from "class-variance-authority";
import {
  dropdownContentVariants,
  dropdownItemVariants,
} from "./dropdown.variants";

export type DropdownContentProps = VariantProps<typeof dropdownContentVariants>;

export type DropdownItemProps = VariantProps<typeof dropdownItemVariants> & {
  inset?: boolean;
};