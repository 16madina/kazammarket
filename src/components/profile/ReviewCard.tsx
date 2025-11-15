import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    transaction_type: string;
    reviewer: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.reviewer.avatar_url || ""} />
          <AvatarFallback>
            {review.reviewer.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-sm">
                {review.reviewer.full_name || "Utilisateur"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {review.comment && (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          )}
          
          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-secondary">
            {review.transaction_type === "buyer" ? "En tant qu'acheteur" : "En tant que vendeur"}
          </span>
        </div>
      </div>
    </Card>
  );
};
