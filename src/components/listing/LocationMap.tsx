import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { geocodeLocation } from '@/utils/distanceCalculation';

interface LocationMapProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}

const LocationMap = ({ location, latitude, longitude }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const mapboxToken = 'pk.eyJ1IjoibWFkaW5hZGlhbGxvIiwiYSI6ImNtaTk0eGZ0dDBqb2cya3B6MnFhMHJmODAifQ.zBKszfc8fyp-K-o6lJpymg';

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log('Geolocation not available:', error);
        }
      );
    }
  }, []);

  // Get listing coordinates - prioritize stored GPS, fallback to geocoding
  useEffect(() => {
    const getCoordinates = async () => {
      // If we have stored GPS coordinates, use them
      if (latitude && longitude) {
        setCoordinates([longitude, latitude]);
        return;
      }

      // Otherwise, geocode the location string
      const geocoded = await geocodeLocation(location);
      if (geocoded) {
        setCoordinates([geocoded.lng, geocoded.lat]);
      } else {
        // Default fallback to Abidjan center
        setCoordinates([-4.0, 5.3]);
      }
    };

    getCoordinates();
  }, [location, latitude, longitude]);

  // Calculate distance
  const calculateDistance = (
    coord1: [number, number],
    coord2: [number, number]
  ): number => {
    const R = 6371; // Earth's radius in km
    const lat1 = (coord1[1] * Math.PI) / 180;
    const lat2 = (coord2[1] * Math.PI) / 180;
    const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Initialize map when coordinates are ready
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !coordinates) {
      return;
    }

    // Calculate distance if user location is available
    if (userLocation) {
      const dist = calculateDistance(userLocation, coordinates);
      setDistance(dist);
    }

    // Initialize map with token
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 14,
    });

    // Add marker
    new mapboxgl.Marker({ color: '#6366f1' })
      .setLngLat(coordinates)
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [coordinates, userLocation]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localisation
          </div>
          {distance !== null && (
            <div className="flex items-center gap-1 text-sm font-normal text-primary">
              <Navigation className="h-4 w-4" />
              <span>À {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`} de vous</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={mapContainer} className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default LocationMap;
