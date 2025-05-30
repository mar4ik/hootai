import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  showOwl?: boolean;
  className?: string;
}

export function UserAvatar({ 
  size = "md", 
  showOwl = false,
  className 
}: UserAvatarProps) {
  const { user } = useAuth();
  
  return (
    <Avatar
      user={user || undefined}
      size={size}
      showOwl={showOwl}
      className={className}
    />
  );
} 