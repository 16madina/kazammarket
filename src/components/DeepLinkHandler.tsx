import { useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

const REFERRAL_STORAGE_KEY = "pendingReferralCode";
const REFERRAL_EXPIRY_KEY = "pendingReferralCodeExpiry";
const EXPIRY_DAYS = 7;

// Dynamically import App only on native platforms
let AppPlugin: any = null;

/**
 * Global handler for deep links and referral codes
 * This component should be placed inside the BrowserRouter
 */
export const DeepLinkHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Capture referral code from URL on any page
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      // Store the referral code with expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
      
      localStorage.setItem(REFERRAL_STORAGE_KEY, refCode);
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
      console.log("📍 Deep link: Referral code captured:", refCode);
    }
  }, [searchParams]);

  // Handle native app deep links (Capacitor)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const initDeepLinkHandler = async () => {
      try {
        // Dynamically import @capacitor/app only on native
        if (!AppPlugin) {
          const module = await import("@capacitor/app");
          AppPlugin = module.App;
        }

        const handleAppUrlOpen = (event: { url: string }) => {
          console.log("📱 App opened with URL:", event.url);
          
          try {
            const url = new URL(event.url);
            let path = url.pathname;
            const queryString = url.search;

            // Handle custom scheme (ayokamarket://)
            if (event.url.startsWith("ayokamarket://")) {
              const schemeUrl = event.url.replace("ayokamarket://", "");
              const [pathPart, queryPart] = schemeUrl.split("?");
              path = "/" + (pathPart || "");
              
              // Extract ref from query
              if (queryPart) {
                const params = new URLSearchParams(queryPart);
                const refCode = params.get("ref");
                if (refCode) {
                  const expiryDate = new Date();
                  expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
                  localStorage.setItem(REFERRAL_STORAGE_KEY, refCode);
                  localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
                }
              }
            }

            // Handle universal links (https://ayokamarket.com/...)
            if (url.hostname === "ayokamarket.com" || url.hostname === "www.ayokamarket.com") {
              // Capture referral code if present
              const refCode = url.searchParams.get("ref");
              if (refCode) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
                localStorage.setItem(REFERRAL_STORAGE_KEY, refCode);
                localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
              }
            }

            // Navigate to the path
            if (path && path !== location.pathname) {
              navigate(path + queryString);
            }
          } catch (error) {
            console.error("Error parsing deep link URL:", error);
          }
        };

        // Listen for app URL open events
        const listener = await AppPlugin.addListener("appUrlOpen", handleAppUrlOpen);

        // Check if app was opened with a URL
        const launchUrl = await AppPlugin.getLaunchUrl();
        if (launchUrl?.url) {
          handleAppUrlOpen(launchUrl);
        }

        // Return cleanup function
        return () => {
          listener.remove();
        };
      } catch (error: any) {
        console.error("Error initializing deep link handler:", error?.message || error?.code || JSON.stringify(error) || error);
        if (error?.stack) console.error("Stack:", error.stack);
      }
    };

    let cleanup: (() => void) | undefined;
    initDeepLinkHandler().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, [navigate, location.pathname]);

  return null;
};
