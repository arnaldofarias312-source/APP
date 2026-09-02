// src/components/BusMarker.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BusMarker({ bus, onPress, isSelected = false }) {
  const handlePress = () => {
    if (onPress) {
      onPress(bus);
    }
  };

  // Obtener el color de la línea
  const lineColor = bus.linea?.color_hex || bus.conductor?.lineas?.color_hex || '#1B3FA6';
  
  // Determinar si el color es oscuro para usar blanco o negro en el icono
  const isDarkColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const iconColor = isDarkColor(lineColor) ? '#FFFFFF' : '#111827';
  const borderColor = isSelected ? '#FFFFFF' : lineColor;

  const busId = bus.conductor?.autobus_identificador || '';

  // Tamaño del marcador - más pequeño
  const markerSize = isSelected ? 30 : 24;
  const iconSize = isSelected ? 14 : 12;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.iconContainer, 
        { 
          backgroundColor: lineColor,
          borderColor: borderColor,
          width: markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
        },
        isSelected && styles.selectedIcon
      ]}>
        <Ionicons
          name="bus"
          size={iconSize}
          color={iconColor}
        />
      </View>
      {busId ? (
        <View style={[
          styles.driverBadge,
          { backgroundColor: isDarkColor(lineColor) ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)' }
        ]}>
          <Text style={[
            styles.driverText,
            { color: isDarkColor(lineColor) ? '#FFFFFF' : '#374151' }
          ]} numberOfLines={1}>
            {busId}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  selectedContainer: {
    transform: [{ scale: 1.1 }],
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1.5,
  },
  selectedIcon: {
    borderWidth: 2,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  driverBadge: {
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 1,
    maxWidth: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  driverText: {
    fontSize: 7,
    fontWeight: '600',
    textAlign: 'center',
  },
});