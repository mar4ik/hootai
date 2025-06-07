import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ 
  size = "md", 
  className 
}: UserAvatarProps) {
  const { user } = useAuth();
  
  return (
    <Avatar
      user={user || undefined}
      size={size}
      className={className}
    />
  );
} 