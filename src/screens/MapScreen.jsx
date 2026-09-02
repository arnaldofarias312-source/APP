// src/screens/MapScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useBusData } from '../hooks/useBusData';
import RouteSelector from '../components/RouteSelector';
import BusMarker from '../components/BusMarker';
import BusInfoCard from '../components/BusInfoCard';
import StatusModal from '../components/StatusModal';
import DevTools from '../components/DevTools';

const { width, height } = Dimensions.get('window');

const OSM_VOYAGER = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '© OpenStreetMap, © CARTO',
  maxZoom: 19,
};

export default function MapScreen() {
  const mapRef = useRef(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [region, setRegion] = useState({
    latitude: 10.626675,
    longitude: -63.264148,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [busCount, setBusCount] = useState(0);
  const [previousBusCount, setPreviousBusCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    routes,
    selectedRoute,
    buses,
    loading: busLoading,
    refreshing,
    lastUpdate,
    isPolling,
    loadBusesNearby,
    selectRoute,
    clearRouteSelection,
    refreshData,
    updateLocation,
  } = useBusData();

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttonText: 'Entendido',
  });

  const showModal = ({ type = 'info', title, message, buttonText = 'Entendido' }) => {
    setModalConfig({ visible: true, type, title, message, buttonText });
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    setPreviousBusCount(busCount);
    setBusCount(buses.length);
  }, [buses]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        getCurrentLocation();
        return true;
      } else {
        showModal({
          type: 'warning',
          title: 'Permiso requerido',
          message: 'Necesitamos acceder a tu ubicación para mostrarte los buses cercanos.',
        });
        setLocationLoading(false);
        return false;
      }
    } catch (err) {
      console.warn(err);
      setLocationLoading(false);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;
      const newLocation = { lat: latitude, lng: longitude };
      setLocation(newLocation);
      setLocationLoading(false);

      updateLocation(latitude, longitude);

      // Solo mover el mapa al inicio o cuando se presiona el botón
      if (isInitialLoad && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 500);
        setIsInitialLoad(false);
      }

      if (!selectedRoute) {
        loadBusesNearby(latitude, longitude);
      }

      return newLocation;
    } catch (err) {
      console.warn(err);
      setLocationLoading(false);
      return null;
    }
  };

  // Solo actualizar ubicación en segundo plano, NO mover el mapa
  useEffect(() => {
    let subscription = null;

    const startWatching = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

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
          updateLocation(latitude, longitude);

          // NO mover el mapa automáticamente
          // Solo actualizar buses cercanos si no hay ruta seleccionada
          if (!selectedRoute) {
            loadBusesNearby(latitude, longitude);
          }
        }
      );
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [selectedRoute]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        await getCurrentLocation();
      } else {
        setLocationLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectRoute = async (routeId) => {
    const result = await selectRoute(routeId);
    if (result && result.buses && result.buses.length > 0 && mapRef.current) {
      const latitudes = result.buses.map(b => b.lat);
      const longitudes = result.buses.map(b => b.lng);
      const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
      const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
      const latDelta = (Math.max(...latitudes) - Math.min(...latitudes)) * 1.5 + 0.01;
      const lngDelta = (Math.max(...longitudes) - Math.min(...longitudes)) * 1.5 + 0.01;

      mapRef.current.animateToRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      }, 1000);
    }
  };

  const handleClearRoute = () => {
    clearRouteSelection();
    if (location) {
      setTimeout(() => {
        loadBusesNearby(location.lat, location.lng);
      }, 300);
    }
  };

  const handleBusPress = (bus) => {
    setSelectedBus(bus);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: bus.lat,
        longitude: bus.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleRefresh = () => {
    if (location) {
      refreshData(location.lat, location.lng);
    }
  };

  // Botón para centrar en la ubicación del usuario (acción manual)
  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 800);
    } else {
      getCurrentLocation();
    }
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 0.7,
      longitudeDelta: region.longitudeDelta * 0.7,
    }, 150);
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta / 0.7,
      longitudeDelta: region.longitudeDelta / 0.7,
    }, 150);
  };

  const getSelectedLineColor = () => {
    if (!selectedRoute) return '#1B3FA6';
    const route = routes.find(r => r.id === selectedRoute);
    return route?.color_hex || '#1B3FA6';
  };

  const busCountChanged = busCount !== previousBusCount;

  const getSelectedRouteName = () => {
    if (!selectedRoute) return '';
    const route = routes.find(r => r.id === selectedRoute);
    const name = route?.nombre || 'Línea seleccionada';
    return name.length > 25 ? name.substring(0, 22) + '...' : name;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation={permissionGranted}
          showsMyLocationButton={false}
          zoomEnabled={true}
          zoomControlEnabled={false}
          rotateEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          showsCompass={true}
          showsScale={true}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
          }}
        >
          <UrlTile
            urlTemplate={OSM_VOYAGER.url}
            maximumZ={OSM_VOYAGER.maxZoom}
            tileSize={256}
          />

          {!selectedRoute && location && (
            <Circle
              center={{
                latitude: location.lat,
                longitude: location.lng,
              }}
              radius={2500}
              strokeColor="rgba(27, 63, 166, 0.3)"
              fillColor="rgba(27, 63, 166, 0.08)"
              strokeWidth={2}
            />
          )}

          {buses.map((bus, index) => {
            const busId = bus.jornada_id || bus.id || `bus-${index}`;
            return (
              <Marker
                key={busId}
                coordinate={{
                  latitude: bus.lat,
                  longitude: bus.lng,
                }}
                onPress={() => handleBusPress(bus)}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <BusMarker
                  bus={bus}
                  isSelected={selectedBus?.jornada_id === bus.jornada_id}
                />
              </Marker>
            );
          })}
        </MapView>

        {/* Selector de ruta */}
        <View style={styles.routeSelectorContainer}>
          <RouteSelector
            routes={routes}
            selectedRouteId={selectedRoute}
            onSelectRoute={handleSelectRoute}
            onClearSelection={handleClearRoute}
            loading={busLoading}
          />
        </View>

        {/* Controles superiores */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Ionicons
              name={refreshing ? 'reload' : 'refresh-outline'}
              size={20}
              color="#1B3FA6"
            />
          </TouchableOpacity>

          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, isPolling && styles.liveDotActive]} />
            <Text style={styles.liveText}>
              {isPolling ? 'En vivo' : 'Pausado'}
            </Text>
          </View>
        </View>

        {/* Controles de zoom personalizados */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={zoomIn}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#1B3FA6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.zoomButton}
            onPress={zoomOut}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={24} color="#1B3FA6" />
          </TouchableOpacity>
        </View>

        {/* Botón de ubicación - Ahora SOLO centra, no hace tracking automático */}
        <View style={styles.locationButtonContainer}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={centerOnUserLocation}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={24} color="#1B3FA6" />
          </TouchableOpacity>
        </View>

        {/* Info de buses cercanos */}
        {!selectedRoute && buses.length > 0 && (
          <View style={styles.busCountContainer}>
            <View style={[
              styles.busCountBadge,
              busCountChanged && styles.busCountBadgeUpdated
            ]}>
              <Ionicons name="bus-outline" size={16} color="#1B3FA6" />
              <Text style={styles.busCountText}>
                {buses.length} buses en el área
              </Text>
              {lastUpdate && (
                <Text style={styles.lastUpdateText}>
                  • {lastUpdate.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Info de ruta seleccionada */}
        {selectedRoute && (
          <View style={styles.routeInfoContainer}>
            <View style={[styles.routeInfoBadge, { backgroundColor: getSelectedLineColor() }]}>
              <Ionicons name="map-outline" size={14} color="#FFFFFF" />
              <Text style={styles.routeInfoText} numberOfLines={1} ellipsizeMode="tail">
                {getSelectedRouteName()}
              </Text>
              <View style={styles.routeBusCountContainer}>
                <Text style={styles.routeBusCount}>
                  {buses.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tarjeta de información del bus */}
        {selectedBus && (
          <BusInfoCard
            bus={selectedBus}
            onClose={() => setSelectedBus(null)}
            style={styles.busInfoCard}
          />
        )}
      </View>

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        onClose={hideModal}
      />

      <DevTools
        visible={devToolsVisible}
        onClose={() => setDevToolsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: width,
    height: height,
  },
  routeSelectorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 8,
    right: 70,
    zIndex: 5,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 12,
    right: 8,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginRight: 3,
  },
  liveDotActive: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    zIndex: 5,
    flexDirection: 'column',
    gap: 8,
  },
  zoomButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1B3FA6',
  },
  locationButtonContainer: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    zIndex: 5,
  },
  locationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#1B3FA6',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busCountContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  busCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  busCountBadgeUpdated: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  busCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B3FA6',
    marginLeft: 6,
  },
  lastUpdateText: {
    fontSize: 9,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  routeInfoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  routeInfoBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  routeInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 6,
    maxWidth: '60%',
  },
  routeBusCountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  routeBusCount: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  busInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});