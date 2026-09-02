// src/components/BusInfoCard.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BusInfoCard({ bus, onClose, style }) {
  if (!bus) return null;

  const translateY = new Animated.Value(100);

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, []);

  const conductor = bus.conductor || {};
  const linea = bus.linea || {};
  const nombreCompleto = `${conductor.nombre || ''} ${conductor.apellido || ''}`.trim();

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="bus-outline" size={20} color="#1B3FA6" />
          <Text style={styles.title}>
            {conductor.autobus_identificador || 'Bus'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            Conductor: {nombreCompleto || 'Sin asignar'}
          </Text>
        </View>

        {linea && linea.nombre && (
          <View style={styles.infoRow}>
            <View style={[styles.colorDot, { backgroundColor: linea.color_hex || '#1B3FA6' }]} />
            <Text style={styles.infoText} numberOfLines={1}>
              Línea: {linea.nombre}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>
            {bus.capturado_en 
              ? new Date(bus.capturado_en).toLocaleTimeString() 
              : 'N/A'}
          </Text>
        </View>

        {bus.velocidad !== undefined && bus.velocidad !== null && (
          <View style={styles.infoRow}>
            <Ionicons name="speedometer-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              {bus.velocidad.toFixed(1)} km/h
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B3FA6',
    marginLeft: 6,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 6,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
});