import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  avatarUrl?: string;
  userName?: string;
}

export const TypingIndicator = ({ avatarUrl, userName }: TypingIndicatorProps) => {
  return (
    <div className="flex gap-3 items-end animate-fade-in">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl || ""} alt={userName || "User"} />
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground font-medium">
            {userName || "Utilisateur"} est en train d'écrire
          </span>
          <div className="flex gap-1 ml-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot-1" />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot-2" />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
