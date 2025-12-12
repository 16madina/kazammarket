import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, Moon, Sun, MapPin, Loader2 } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { SystemNotifications } from "@/components/notifications/SystemNotifications";
import ayokaLogo from "@/assets/ayoka-logo.png";
interface HeaderProps {
  isAuthenticated: boolean;
}
const Header = ({
  isAuthenticated
}: HeaderProps) => {
  const navigate = useNavigate();
  const {
    darkMode,
    toggleDarkMode
  } = useDarkMode();
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserLocation = async () => {
      // Check cache first
      const cached = sessionStorage.getItem('user_neighborhood');
      if (cached) {
        if (isMounted) {
          setUserLocation(cached);
          setIsLoadingLocation(false);
        }
        return;
      }
      
      // Check if geolocation is available
      if (!('geolocation' in navigator)) {
        if (isMounted) setIsLoadingLocation(false);
        return;
      }
      
      try {
        // Get user's GPS position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false, // Faster response
            timeout: 5000, // Reduced timeout
            maximumAge: 600000 // 10 minutes cache
          });
        });
        
        if (!isMounted) return;
        
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get neighborhood/commune
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=16`, {
          headers: { 'User-Agent': 'AyokaMarket/1.0' }
        });
        
        if (!isMounted) return;
        
        const data = await response.json();

        // Extract neighborhood or suburb or city
        const neighborhood = data.address?.neighbourhood || data.address?.suburb || data.address?.quarter || data.address?.hamlet || data.address?.village || data.address?.town || data.address?.city_district || data.address?.city || null;
        if (neighborhood && isMounted) {
          setUserLocation(neighborhood);
          sessionStorage.setItem('user_neighborhood', neighborhood);
        }
      } catch (error) {
        console.log('Could not get user location:', error);
      } finally {
        if (isMounted) setIsLoadingLocation(false);
      }
    };
    
    fetchUserLocation();
    
    return () => {
      isMounted = false;
    };
  }, []);
  return <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-safe">
      <div className="container flex flex-col sm:flex-row sm:h-16 items-center justify-between px-4 py-2 sm:py-0 gap-1 sm:gap-0">
        {/* Top row: Logo + Actions */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex flex-col">
            <img src={ayokaLogo} alt="AYOKA MARKET" className="h-10 sm:h-14 w-auto cursor-pointer transition-all duration-300 hover:scale-105 object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" onClick={() => navigate("/")} />
            {/* Location directly below logo on mobile */}
            {userLocation && !isLoadingLocation && (
              <div className="flex sm:hidden items-center gap-1 text-[10px] text-muted-foreground -mt-1">
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate max-w-[150px]">{userLocation}</span>
              </div>
            )}
            {isLoadingLocation && (
              <div className="flex sm:hidden items-center gap-1 text-[10px] text-muted-foreground -mt-1">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              </div>
            )}
          </div>
          
          {/* Actions on mobile - shown inline with logo */}
          <nav className="flex sm:hidden items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="gap-2 min-h-[44px] min-w-[44px] p-2" aria-label="Changer de thème">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated && <SystemNotifications />}
            {isAuthenticated ? <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-2 p-2">
                <User className="h-4 w-4" />
              </Button> : <Button variant="default" size="sm" onClick={() => navigate("/auth", {
            state: {
              mode: 'login'
            }
          })} className="gap-2 text-xs px-3">
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>}
          </nav>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex items-center gap-3">
          
          {(userLocation || isLoadingLocation) && <div className="flex items-center gap-1 text-sm text-muted-foreground">
              
              {isLoadingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="truncate max-w-[150px] mx-[9px] my-0 px-0">{userLocation}</span>}
            </div>}
        </div>

        <nav className="hidden sm:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="gap-2 min-h-[44px] min-w-[44px]" aria-label="Changer de thème">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {isAuthenticated && <SystemNotifications />}
          {isAuthenticated ? <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-2">
              <User className="h-4 w-4" />
              <span>Mon profil</span>
            </Button> : <Button variant="default" size="sm" onClick={() => navigate("/auth", {
          state: {
            mode: 'login'
          }
        })} className="gap-2">
            <LogIn className="h-4 w-4" />
            Se connecter
          </Button>}
        </nav>
      </div>
    </header>;
};
export default Header;