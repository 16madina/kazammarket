import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Download, ArrowRight, Gift } from "lucide-react";
import ayokaLogo from "@/assets/ayoka-logo.png";
import { FaApple, FaGooglePlay } from "react-icons/fa";

const OpenApp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [platform, setPlatform] = useState<"ios" | "android" | "web">("web");
  
  const refCode = searchParams.get("ref");
  const targetPath = searchParams.get("path") || "/";
  
  // Store IDs
  const APP_STORE_ID = "6756237345";
  const PLAY_STORE_ID = "app.lovable.fdde6a57c0ea45b0bd6d4e42d3d22471";
  
  // URLs
  const appStoreUrl = `https://apps.apple.com/app/id${APP_STORE_ID}`;
  const playStoreUrl = `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}`;
  const customSchemeUrl = `ayokamarket://${targetPath}${refCode ? `?ref=${refCode}` : ""}`;
  const universalLinkUrl = `https://ayokamarket.com${targetPath}${refCode ? `?ref=${refCode}` : ""}`;

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("web");
    }

    // Store referral code if present
    if (refCode) {
      localStorage.setItem("pendingReferralCode", refCode);
    }

    // Try to open the app
    const tryOpenApp = async () => {
      // For mobile, try to open the app
      if (platform !== "web") {
        // Create hidden iframe to try custom scheme
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = customSchemeUrl;
        document.body.appendChild(iframe);

        // Also try the universal/app link
        setTimeout(() => {
          window.location.href = universalLinkUrl;
        }, 100);

        // If still here after delay, show the page
        setTimeout(() => {
          setIsRedirecting(false);
          document.body.removeChild(iframe);
        }, 2500);
      } else {
        // On web, redirect to the target path
        setIsRedirecting(false);
        navigate(targetPath + (refCode ? `?ref=${refCode}` : ""));
      }
    };

    tryOpenApp();
  }, [platform, refCode, targetPath, navigate, customSchemeUrl, universalLinkUrl]);

  const handleOpenStore = () => {
    if (platform === "ios") {
      window.location.href = appStoreUrl;
    } else if (platform === "android") {
      window.location.href = playStoreUrl;
    }
  };

  const handleContinueWeb = () => {
    navigate(targetPath + (refCode ? `?ref=${refCode}` : ""));
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <img src={ayokaLogo} alt="AYOKA" className="w-24 h-24 mb-6 animate-pulse" />
        <p className="text-lg font-medium text-amber-700 dark:text-amber-400">
          Ouverture de l'application...
        </p>
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-6">
          <img src={ayokaLogo} alt="AYOKA MARKET" className="w-20 h-20 mx-auto" />
          
          <div>
            <h1 className="text-2xl font-bold mb-2">AYOKA MARKET</h1>
            <p className="text-muted-foreground">
              La marketplace de l'Afrique de l'Ouest
            </p>
          </div>

          {refCode && (
            <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
              <Gift className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Code parrain: {refCode}
              </span>
            </div>
          )}

          {platform !== "web" && (
            <>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Téléchargez l'application pour une meilleure expérience
                </p>
                
                <Button 
                  onClick={handleOpenStore}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {platform === "ios" ? (
                    <>
                      <FaApple className="h-5 w-5 mr-2" />
                      Télécharger sur l'App Store
                    </>
                  ) : (
                    <>
                      <FaGooglePlay className="h-5 w-5 mr-2" />
                      Télécharger sur Google Play
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={handleContinueWeb}
            variant={platform === "web" ? "default" : "outline"}
            className={platform === "web" ? "w-full bg-gradient-to-r from-amber-500 to-orange-500" : "w-full"}
            size="lg"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Continuer sur le site web
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenApp;
