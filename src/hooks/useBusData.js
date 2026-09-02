// src/hooks/useBusData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { busService } from '../services/busService';

export const useBusData = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollingIntervalRef = useRef(null);
  const currentLocationRef = useRef(null);
  const isPollingRef = useRef(false);
  const selectedRouteRef = useRef(null);

  useEffect(() => {
    loadRoutes();
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    selectedRouteRef.current = selectedRoute;
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await busService.getRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las líneas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = useCallback(async () => {
    try {
      const location = currentLocationRef.current;
      const currentRoute = selectedRouteRef.current;
      
      if (currentRoute) {
        const routeBuses = await busService.getBusesByRoute(currentRoute);
        setBuses(routeBuses);
      } else if (location) {
        const nearbyBuses = await busService.getBusesNearby(location.lat, location.lng);
        setBuses(nearbyBuses);
      } else {
        setBuses([]);
      }
      
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error en polling:', err);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    isPollingRef.current = true;
    setIsPolling(true);
    
    fetchBuses();
    
    pollingIntervalRef.current = setInterval(() => {
      if (isPollingRef.current) {
        fetchBuses();
      }
    }, 500);
  }, [fetchBuses]);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    setIsPolling(false);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const updateLocation = useCallback((lat, lng) => {
    currentLocationRef.current = { lat, lng };
  }, []);

  const loadBusesNearby = useCallback(async (lat, lng) => {
    try {
      updateLocation(lat, lng);
      
      const nearbyBuses = await busService.getBusesNearby(lat, lng);
      setBuses(nearbyBuses);
      setError(null);
      return nearbyBuses;
    } catch (err) {
      setError('Error al cargar buses cercanos');
      console.error(err);
      return [];
    }
  }, [updateLocation]);

  const selectRoute = useCallback(async (lineaId) => {
    try {
      setLoading(true);
      setSelectedRoute(lineaId);

      const routeDetails = await busService.getRouteDetails(lineaId);
      const routeBuses = await busService.getBusesByRoute(lineaId);
      setBuses(routeBuses);

      setError(null);
      return { routeDetails, buses: routeBuses };
    } catch (err) {
      setError('Error al seleccionar la línea');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRouteSelection = useCallback(() => {
    setSelectedRoute(null);
    
    const location = currentLocationRef.current;
    if (location) {
      busService.getBusesNearby(location.lat, location.lng)
        .then(nearbyBuses => {
          setBuses(nearbyBuses);
          setLastUpdate(new Date());
        })
        .catch(err => {
          console.error('Error al cargar buses cercanos:', err);
        });
    } else {
      setBuses([]);
    }
  }, []);

  const refreshData = useCallback(async (lat, lng) => {
    try {
      setRefreshing(true);
      updateLocation(lat, lng);
      
      const currentRoute = selectedRouteRef.current;
      
      if (currentRoute) {
        const routeBuses = await busService.getBusesByRoute(currentRoute);
        setBuses(routeBuses);
      } else {
        const nearbyBuses = await busService.getBusesNearby(lat, lng);
        setBuses(nearbyBuses);
      }
    } catch (err) {
      setError('Error al actualizar los datos');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    routes,
    selectedRoute,
    buses,
    loading,
    error,
    refreshing,
    lastUpdate,
    isPolling,
    loadRoutes,
    loadBusesNearby,
    selectRoute,
    clearRouteSelection,
    refreshData,
    updateLocation,
    startPolling,
    stopPolling,
  };
};