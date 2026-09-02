// src/hooks/useLocation.js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setPermissionGranted(true);
        return true;
      } else {
        setError('Permiso de ubicación denegado');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Error al solicitar permiso de ubicación');
      setLoading(false);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;
      setLocation({ lat: latitude, lng: longitude });
      setLoading(false);
      return { lat: latitude, lng: longitude };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const startLocationTracking = (onLocationUpdate) => {
    let subscription = null;

    const startWatching = async () => {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setError('Permiso de ubicación denegado');
        setLoading(false);
        return null;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setLocation(newLocation);
          setLoading(false);
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        }
      );

      return subscription;
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  return {
    location,
    error,
    loading,
    permissionGranted,
    requestLocationPermission,
    getCurrentLocation,
    startLocationTracking,
  };
};