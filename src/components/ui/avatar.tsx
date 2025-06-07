import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: {
    email?: string;
    id: string;
  };
  size?: "sm" | "md" | "lg";
}

export function Avatar({
  user,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  // Get user initials from email if available
  const getUserInitials = () => {
    if (!user?.email) return "?";
    return user.email
      .split("@")[0]
      .split(/[^a-zA-Z]/)
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {getUserInitials()}
    </div>
  );
} 