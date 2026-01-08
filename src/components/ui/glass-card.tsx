import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, type CardProps } from "./card";
import { useCardShine } from "@/hooks/useCardShine";

interface GlassCardProps extends CardProps {
  children: React.ReactNode;
  enableShine?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, enableShine = true, ...props }, ref) => {
    const { shineStyle, handleMouseMove, handleMouseLeave } = useCardShine();

    return (
      <Card
        ref={ref}
        variant="glass"
        className={cn("relative overflow-hidden", className)}
        onMouseMove={enableShine ? handleMouseMove : undefined}
        onMouseLeave={enableShine ? handleMouseLeave : undefined}
        {...props}
      >
        {enableShine && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={shineStyle}
          />
        )}
        {children}
      </Card>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
