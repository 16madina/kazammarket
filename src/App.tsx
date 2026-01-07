import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import { ScrollToTop } from "./components/ScrollToTop";
import { usePushNotifications, getPendingNotificationRoute } from "./hooks/usePushNotifications";
import { useSplashPreference } from "./hooks/useSplashPreference";
import { useAppRatingPrompt } from "./hooks/useAppRatingPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Publish from "./pages/Publish";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import Favorites from "./pages/Favorites";
import Help from "./pages/Help";
import AccountManagement from "./pages/AccountManagement";
import ListingDetail from "./pages/ListingDetail";
import SellerPublicProfile from "./pages/SellerPublicProfile";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import FAQ from "./pages/settings/FAQ";
import Support from "./pages/settings/Support";
import Report from "./pages/settings/Report";
import Terms from "./pages/settings/Terms";
import Privacy from "./pages/settings/Privacy";
import ChangePassword from "./pages/settings/ChangePassword";
import TwoFactor from "./pages/settings/TwoFactor";
import ProfileVisibility from "./pages/settings/ProfileVisibility";
import BlockedUsers from "./pages/settings/BlockedUsers";
import SalesHistory from "./pages/settings/SalesHistory";
import CommunityGuidelines from "./pages/settings/CommunityGuidelines";
import ChildSafety from "./pages/settings/ChildSafety";
import Transactions from "./pages/Transactions";
import SellerBadgesInfo from "./pages/settings/SellerBadges";

import TestCamera from "./pages/TestCamera";
import AdminPerformance from "./pages/AdminPerformance";
import EmailVerified from "./pages/EmailVerified";
import MapView from "./pages/MapView";
import AdminNotifications from "./pages/AdminNotifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { NotificationPermissionPrompt } from "./components/notifications/NotificationPermissionPrompt";
import { AppRatingPrompt } from "./components/AppRatingPrompt";

const queryClient = new QueryClient();

// Component to handle pending notification navigation
const NotificationNavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasHandledNotification, setHasHandledNotification] = useState(false);

  useEffect(() => {
    if (hasHandledNotification) return;

    // Check for pending notification route after a short delay to ensure app is ready
    const checkPendingRoute = () => {
      const pendingRoute = sessionStorage.getItem('pendingNotificationRoute') || getPendingNotificationRoute();
      
      if (pendingRoute && pendingRoute !== location.pathname) {
        console.log('📍 Handling pending notification navigation to:', pendingRoute);
        sessionStorage.removeItem('pendingNotificationRoute');
        setHasHandledNotification(true);
        navigate(pendingRoute);
      }
    };

    // Wait for app to be fully loaded before navigating
    const timer = setTimeout(checkPendingRoute, 300);
    return () => clearTimeout(timer);
  }, [navigate, location.pathname, hasHandledNotification]);

  return null;
};

const App = () => {
  const { isReturningUser, markFullSplashSeen } = useSplashPreference();
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Initialiser les notifications push
  usePushNotifications();
  
  // Système de demande d'avis
  const { showPrompt, setShowPrompt, markAsRated, dismissPrompt, dismissPermanently } = useAppRatingPrompt();

  const handleSplashFinish = () => {
    // Mark as seen in localStorage only if it was the full version
    if (!isReturningUser) {
      markFullSplashSeen();
    }
    sessionStorage.setItem('hasSeenSplash', 'true');
    
    // Start transition animation
    setIsTransitioning(true);
    
    // Show content with a slight delay for crossfade effect
    setTimeout(() => {
      setShowContent(true);
    }, 100);
    
    // Hide splash after transition
    setTimeout(() => {
      setShowSplash(false);
      setIsTransitioning(false);
    }, 600);
  };

  // If splash is done and no transition, show content immediately
  useEffect(() => {
    if (!showSplash && !isTransitioning) {
      setShowContent(true);
    }
  }, [showSplash, isTransitioning]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Splash Screen Layer */}
        {showSplash && (
          <div 
            className={`fixed inset-0 z-50 transition-all duration-700 ${
              isTransitioning ? "opacity-0 scale-110" : "opacity-100 scale-100"
            }`}
          >
            <SplashScreen 
              onFinish={handleSplashFinish} 
              isShortVersion={isReturningUser}
            />
          </div>
        )}
        
        {/* Main Content Layer */}
        <div 
          className={`transition-all duration-700 ease-out ${
            showContent 
              ? "opacity-100 scale-100 translate-y-0" 
              : "opacity-0 scale-95 translate-y-4"
          }`}
          style={{
            visibility: showContent ? 'visible' : 'hidden',
          }}
        >
          <BrowserRouter>
            <ScrollToTop />
            <NotificationNavigationHandler />
            <div>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategoryDetail />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/seller/:id" element={<SellerPublicProfile />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/help" element={<Help />} />
          <Route path="/account-management" element={<AccountManagement />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings/faq" element={<FAQ />} />
          <Route path="/settings/support" element={<Support />} />
          <Route path="/settings/report" element={<Report />} />
          <Route path="/settings/terms" element={<Terms />} />
          <Route path="/settings/privacy" element={<Privacy />} />
          <Route path="/settings/change-password" element={<ChangePassword />} />
          <Route path="/settings/two-factor" element={<TwoFactor />} />
          <Route path="/settings/profile-visibility" element={<ProfileVisibility />} />
          <Route path="/settings/blocked-users" element={<BlockedUsers />} />
          <Route path="/settings/sales-history" element={<SalesHistory />} />
          <Route path="/settings/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/settings/child-safety" element={<ChildSafety />} />
          <Route path="/settings/seller-badges" element={<SellerBadgesInfo />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/test-camera" element={<TestCamera />} />
          <Route path="/admin/performance" element={<AdminPerformance />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/map" element={<MapView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
            <NotificationPermissionPrompt />
            <AppRatingPrompt
              open={showPrompt}
              onOpenChange={setShowPrompt}
              onRated={markAsRated}
              onDismiss={dismissPrompt}
              onDismissPermanently={dismissPermanently}
            />
            </div>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
