import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fade-in");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fade-out");
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`${transitionStage} transition-opacity duration-200 ease-in-out`}
      onAnimationEnd={() => {
        if (transitionStage === "fade-out") {
          setTransitionStage("fade-in");
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
};
