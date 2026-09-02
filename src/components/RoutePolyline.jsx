import React from 'react';
import { Polyline } from 'react-native-maps';

export default function RoutePolyline({ routePoints, color = '#1B3FA6', width = 4 }) {
  if (!routePoints || routePoints.length < 2) {
    return null;
  }

  // Convertir los puntos al formato esperado por react-native-maps
  const coordinates = routePoints.map(point => ({
    latitude: point.lat,
    longitude: point.lng,
  }));

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={color}
      strokeWidth={width}
      strokePattern={[]}
      lineDashPattern={[0]}
      tappable={false}
    />
  );
}