import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin, Mic, Search, Clock, Phone, Navigation, Settings, Filter, Map, List, Star, ExternalLink
} from 'lucide-react';

// Default coordinates for common zip codes (using San Francisco as example)
const getCoordinatesFromZip = (zipCode) => {
  const zipCoordinates = {
    '94102': [37.7749, -122.4194],
    '94103': [37.7749, -122.4094],
    '94104': [37.7849, -122.4194],
    '94105': [37.7849, -122.4094],
    '94108': [37.79502053, -122.405339],
    '94110': [37.7589939, -122.4182306],
    '94117': [37.77013552, -122.4510012],
    '94121': [37.78501371, -122.4845445],
    // Add more zip codes as needed
  };
  return zipCoordinates[zipCode] || [37.7749, -122.4194]; // Default to SF
};

// Function to transform CSV data to service format
const transformCsvToServices = (csvData) => {
  return csvData.map((row, index) => {
    // Get coordinates from lat/lng if available, otherwise from zip code
    let lat, lng;
    if (row.latitude && row.longitude) {
      lat = parseFloat(row.latitude);
      lng = parseFloat(row.longitude);
    } else if (row.zip_code) {
      const coords = getCoordinatesFromZip(row.zip_code);
      lat = coords[0];
      lng = coords[1];
    } else {
      // Default coordinates
      lat = 37.7749;
      lng = -122.4194;
    }

    // Determine service type based on category or service name
    let serviceType = 'healthcare'; // default
    const category = (row.Category || '').toLowerCase();
    const service = (row.Service || '').toLowerCase();
    const name = (row.name || '').toLowerCase();
    
    if (category.includes('health') || service.includes('health') || name.includes('health')) {
      serviceType = 'healthcare';
    } else if (service.includes('restroom') || row.access === 'restroom') {
      serviceType = 'restroom';
    } else if (service.includes('drinking') || row.access === 'drinking_water') {
      serviceType = 'utilities';
    } else if (category.includes('food') || service.includes('food')) {
      serviceType = 'food';
    }

    // Determine if service is open
    const isOpen = row.public_access_hours_open && row.public_access_hours_close ? true : Math.random() > 0.3;

    // Calculate approximate distance (this is simplified)
    const distance = `${(Math.random() * 2 + 0.1).toFixed(1)} mi`;

    return {
      id: index + 1,
      name: row.name || row.Service || 'Public Facility',
      address: row.address || `${row.latitude}, ${row.longitude}` || 'Address not available',
      phone: row.Phone || '(415) 311-2000',
      website: row.Website || '',
      type: serviceType,
      lat: lat,
      lng: lng,
      isOpen: isOpen,
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0-5.0
      distance: distance,
      hours: row.public_access_hours_open && row.public_access_hours_close 
        ? `${row.public_access_hours_open} - ${row.public_access_hours_close}`
        : 'Hours vary',
      category: row.Category || 'Public Service',
      // Add preference codes from the CSV data
      preferenceCodes: row.preference_code ? row.preference_code.toString().split(',').map(code => code.trim()) : [],
      zipCode: row.zip_code || null
    };
  });
};

// Function to calculate preference match score
const calculatePreferenceScore = (service, userPreferences) => {
  if (!userPreferences || userPreferences.length === 0) {
    return 0; // No preferences set, all services have equal priority
  }
  
  if (!service.preferenceCodes || service.preferenceCodes.length === 0) {
    return -1; // Service has no preference codes, lower priority
  }
  
  // Count how many user preferences match service preferences
  const matchCount = userPreferences.filter(userPref => 
    service.preferenceCodes.includes(userPref.toString())
  ).length;
  
  // Return match percentage
  return matchCount / userPreferences.length;
};

const MainApp = ({ preferences = { serviceTypes: [], preferences: [] }, onUpdatePreferences = () => {} }) => {
  const [availableServices, setAvailableServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to SF
  const [selectedService, setSelectedService] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [sortBy, setSortBy] = useState('preference'); // 'preference', 'distance', 'rating'
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  // FIXED: Memoize user preferences to prevent infinite re-renders
  const userPreferences = React.useMemo(() => {
    return preferences.preferences || [];
  }, [preferences.preferences]);
  
  const lastFetchRef = useRef(0);
  const FETCH_WINDOW = 30_000; // 30 seconds

  // Extract user preferences from props
  useEffect(() => {
    console.log('Preferences updated:', preferences);
  }, [preferences]);

  // FIXED: Fetch available preferences from server - simplified dependencies
// 🚀 Fetch services (filtered by prefs) once on mount
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        // NEW ── build clean list of ints 1-6
        const preferencesMap = {
          "wheelchair_access": 1, 
          "requires_id": 2,
          "women_only": 3,
          "lgbtq_friendly": 4,
          "walkins_welcome": 5,
          "multilingual_staff": 6
        }
        console.log("SERVICE")

        const preferencesValues = []
        for (let t =0; t < preferences.serviceTypes.length; t++) {
          preferencesValues.push(preferencesMap[preferences.serviceTypes[t]])
        }
        console.log("ZIPCODE")
        console.log(zipCode)

        const response = await fetch('http://localhost:3000/api/all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-zip-code': preferences.zipCode || '94103'          // optional zip filter
          },
          body: JSON.stringify(preferencesValues)        // ⬅️ now sending the int list
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const { data } = await response.json();  // server wraps rows in { data }
        const services = transformCsvToServices(data);
        setAvailableServices(services);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message ?? 'Unable to fetch services');
      } finally {
        setLoading(false);                       // hide the spinner
      }
    };

    fetchAllLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // run once on mount

  // FIXED: Sort and filter services with proper memoization
  const sortedAndFilteredServices = React.useMemo(() => {
    let sortedServices = [...availableServices];
    
    if (sortBy === 'preference' && userPreferences.length > 0) {
      // Sort by preference match score (highest first)
      sortedServices.sort((a, b) => {
        const scoreA = calculatePreferenceScore(a, userPreferences);
        const scoreB = calculatePreferenceScore(b, userPreferences);
        
        if (scoreA === scoreB) {
          // If preference scores are equal, sort by distance
          return parseFloat(a.distance) - parseFloat(b.distance);
        }
        
        return scoreB - scoreA; // Higher scores first
      });
    } else if (sortBy === 'distance') {
      sortedServices.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (sortBy === 'rating') {
      sortedServices.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }
    
    return sortedServices;
  }, [availableServices, userPreferences, sortBy]);

  // Update filtered services when sorted services change
  useEffect(() => {
    setFilteredServices(sortedAndFilteredServices);
  }, [sortedAndFilteredServices]);

  // Initialize user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (err) => {
          console.warn(`Geolocation error: ${err.message}`);
          const defaultZip = '94102';
          setMapCenter(getCoordinatesFromZip(defaultZip));
        }
      );
    } else {
      const defaultZip = '94102';
      setMapCenter(getCoordinatesFromZip(defaultZip));
    }
  }, []); // Empty dependency array - only run once

  // FIXED: Initialize Leaflet map with proper cleanup
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || loading) return;

    const loadLeaflet = () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(css);
      }

      if (window.L) {
        initializeMap();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;

      const map = window.L.map(mapRef.current).setView(mapCenter, 14);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [loading]); // Only depend on loading state

  // FIXED: Update map view when user location changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView(userLocation, 14);
    }
  }, [userLocation]);

  // FIXED: Add markers with proper cleanup
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing service markers (keep user location marker)
    markersRef.current.forEach(marker => {
      if (marker && marker._isUserLocation !== true) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = markersRef.current.filter(marker => marker._isUserLocation === true);

    // Add user location marker if we have location and no user marker exists
    if (userLocation && !markersRef.current.some(m => m._isUserLocation)) {
      const userMarker = window.L.marker(userLocation, {
        icon: window.L.divIcon({
          html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          className: 'user-location-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(mapInstanceRef.current);

      userMarker.bindPopup('<strong>Your Location</strong>');
      userMarker._isUserLocation = true;
      markersRef.current.push(userMarker);
    }

    // Add service markers
    filteredServices.forEach((service) => {
      const isOpen = service.isOpen;
      const preferenceScore = calculatePreferenceScore(service, userPreferences);
      
      // Use different colors based on preference match
      let color = isOpen ? '#10b981' : '#ef4444';
      if (preferenceScore > 0.5) {
        color = isOpen ? '#059669' : '#dc2626'; // Darker green/red for high preference match
      } else if (preferenceScore > 0) {
        color = isOpen ? '#34d399' : '#f87171'; // Lighter green/red for partial match
      }
      
      const marker = window.L.marker([service.lat, service.lng], {
        icon: window.L.divIcon({
          html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px;">${getServiceIcon(service.type)}</div>`,
          className: 'service-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(mapInstanceRef.current);

      const matchText = preferenceScore > 0 ? `<p style="margin: 0 0 4px 0; color: #059669; font-size: 12px; font-weight: bold;">${Math.round(preferenceScore * 100)}% preference match</p>` : '';
      
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${service.name}</h3>
          ${matchText}
          <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${service.address}</p>
          <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">📞 ${service.phone}</p>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">📍 ${service.distance}</p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background-color: ${isOpen ? '#10b981' : '#ef4444'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
              ${isOpen ? 'Open Now' : 'Closed'}
            </span>
            <span style="color: #666; font-size: 14px;">⭐ ${service.rating}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedService(service);
      });

      markersRef.current.push(marker);
    });
  }, [filteredServices, userLocation, userPreferences]); // Depend on actual data that affects markers

  const getServiceIcon = (type) => {
    const icons = {
      food: '🥫',
      housing: '🏠',
      healthcare: '🏥',
      legal: '⚖️',
      employment: '💼',
      transportation: '🚌',
      childcare: '👶',
      financial: '💰',
      restroom: '🚻',
      utilities: '💧'
    };
    return icons[type] || '📍';
  };

  const handleServiceClick = useCallback((service) => {
    setSelectedService(service);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([service.lat, service.lng], 16);
      markersRef.current.forEach(marker => {
        if (marker.getLatLng && marker.getLatLng().lat === service.lat && marker.getLatLng().lng === service.lng) {
          marker.openPopup();
        }
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Make sure your server is running on localhost:3000</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">CareMap AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Enter zip code..."
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-32"
              />
              <Button variant="outline" size="sm" onClick={onUpdatePreferences}>
                <Settings className="h-4 w-4 mr-1" />
                Preferences
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Services Near You ({filteredServices.length} locations)
            </h2>
            {userPreferences.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Filtered by preferences: {userPreferences.join(', ')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="preference">Sort by Preference Match</option>
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
            </select>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {userLocation ? 'Using your current location' : `Area: ${zipCode || '94102'}`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Service List */}
          <div className="space-y-4 overflow-y-auto pr-4">
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Open services</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Closed services</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your location</span>
              </div>
              {userPreferences.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-700 rounded-full"></div>
                  <span>High preference match</span>
                </div>
              )}
            </div>
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No services found. Try adjusting your filters or preferences.
              </div>
            ) : (
              filteredServices.map((result) => {
                const preferenceScore = calculatePreferenceScore(result, userPreferences);
                return (
                  <Card 
                    key={result.id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedService?.id === result.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleServiceClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getServiceIcon(result.type)}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                            {preferenceScore > 0 && (
                              <div className="mb-1">
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  {Math.round(preferenceScore * 100)}% match
                                </Badge>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mb-2">{result.address}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{result.distance}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{result.rating}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{result.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={result.isOpen ? "default" : "secondary"}>
                            {result.isOpen ? "Open Now" : "Closed"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Navigation className="h-4 w-4 mr-1" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right Column - Map */}
          <div className="lg:sticky lg:top-6">
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Map className="h-5 w-5 mr-2" />
                    Interactive Map
                  </h3>
                  <div className="text-sm text-gray-600">
                    {userPreferences.length > 0 ? 'Darker colors = better match' : 'Click markers for details'}
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    ref={mapRef} 
                    className="w-full h-full"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;