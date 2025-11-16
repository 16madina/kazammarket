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
    <Card className="shadow-md border-0 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10 shadow-sm">
            <AvatarImage src={review.reviewer.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
              {review.reviewer.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-base">
                  {review.reviewer.full_name || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10">
                <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                <span className="text-sm font-bold text-yellow-700">{review.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
            
            {review.comment && (
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                {review.comment}
              </p>
            )}
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-muted to-muted/50">
              {review.transaction_type === "buyer" ? "🛒 En tant qu'acheteur" : "💰 En tant que vendeur"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
