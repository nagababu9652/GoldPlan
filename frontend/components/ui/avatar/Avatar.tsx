"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { avatarVariants } from "./avatar.variants";
import { AvatarProps } from "./avatar.types";
import AvatarImage from "./AvatarImage";

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size,
      shape,
      bordered,
      children,
      ...props
    },
    ref
  ) => {
    const initials =
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? "?";

    return (
      <div
        ref={ref}
        className={cn(
          avatarVariants({
            size,
            shape,
            bordered,
          }),
          className
        )}
        {...props}
      >
        {src ? (
          <AvatarImage src={src} alt={alt ?? name} />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            {initials}
          </span>
        )}

        {children}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;