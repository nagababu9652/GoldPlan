import { HTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";

import { avatarVariants } from "./avatar.variants";

export type AvatarStatus =
  | "online"
  | "offline"
  | "busy"
  | "away";

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  status?: AvatarStatus;
}

export interface AvatarGroupProps
  extends HTMLAttributes<HTMLDivElement> {
  max?: number;
}