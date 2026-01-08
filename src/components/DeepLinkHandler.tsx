import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

const REFERRAL_STORAGE_KEY = "pendingReferralCode";
const REFERRAL_EXPIRY_KEY = "pendingReferralCodeExpiry";
const EXPIRY_DAYS = 7;

// Dynamically import App only on native platforms
let AppPlugin: any = null;

// Guards to avoid re-processing the same deep link and causing navigation loops
let lastHandledNativeUrl: string | null = null;

/**
 * Global handler for deep links and referral codes
 * This component should be placed inside the BrowserRouter
 */
export const DeepLinkHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep latest pathname for comparisons without re-initializing native listeners
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Capture referral code from URL on any page
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
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

    let listener: { remove: () => void } | null = null;

    const handleAppUrlOpen = (event: { url: string }) => {
      if (!event?.url) return;

      // Prevent loops caused by reusing the same launch URL after in-app navigation
      if (lastHandledNativeUrl === event.url) {
        console.log("📱 Deep link ignored (duplicate):", event.url);
        return;
      }
      lastHandledNativeUrl = event.url;

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
        if (
          url.hostname === "ayokamarket.com" ||
          url.hostname === "www.ayokamarket.com"
        ) {
          const refCode = url.searchParams.get("ref");
          if (refCode) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
            localStorage.setItem(REFERRAL_STORAGE_KEY, refCode);
            localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
          }
        }

        // Navigate to the path
        const currentPath = pathnameRef.current;
        if (path && path !== currentPath) {
          navigate(path + queryString, { replace: true });
        }
      } catch (error) {
        console.error("Error parsing deep link URL:", error);
      }
    };

    const initDeepLinkHandler = async () => {
      try {
        // Dynamically import @capacitor/app only on native
        if (!AppPlugin) {
          const module = await import("@capacitor/app");
          AppPlugin = module.App;
        }

        // Listen for app URL open events
        listener = await AppPlugin.addListener("appUrlOpen", handleAppUrlOpen);

        // Check if app was opened with a URL (only once on init)
        const launchUrl = await AppPlugin.getLaunchUrl();
        if (launchUrl?.url) {
          handleAppUrlOpen(launchUrl);
        }
      } catch (error: any) {
        console.error(
          "Error initializing deep link handler:",
          error?.message || error?.code || JSON.stringify(error) || error,
        );
        if (error?.stack) console.error("Stack:", error.stack);
      }
    };

    initDeepLinkHandler();

    return () => {
      listener?.remove();
      listener = null;
    };
  }, [navigate]);

  return null;
};

