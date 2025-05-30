import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: {
    email?: string;
    id: string;
  };
  size?: "sm" | "md" | "lg";
  showOwl?: boolean;
}

export function Avatar({
  user,
  size = "md",
  showOwl = false,
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
      {showOwl ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3/4 h-3/4"
        >
          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h4v1h-4v-1zm.5-3c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm5 0c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm-7.5-7h4v2h-4v-2zm6 0h4v2h-4v-2zm-2 2h4v3h-4v-3z" />
        </svg>
      ) : (
        getUserInitials()
      )}
    </div>
  );
} 