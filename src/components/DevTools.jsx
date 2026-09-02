// src/components/DevTools.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusModal from './StatusModal';

export default function DevTools({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = ({ type = 'info', title, message }) => {
    setModalConfig({ visible: true, type, title, message });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🛠️ Herramientas de Desarrollo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos de Prueba</Text>
            <Text style={styles.sectionDescription}>
              Inserta la ruta GUAYA-MUCO con buses y conductores de prueba.
            </Text>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Insertar Ruta de Prueba</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Limpiar Datos</Text>
            <Text style={styles.sectionDescription}>
              Elimina todos los datos de prueba (rutas, buses, conductores).
            </Text>
            
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Limpiar Datos</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                • Líneas disponibles: 9{'\n'}
                • Conductores: 7{'\n'}
                • Buses activos: Variables{'\n'}
                • Conectado a Supabase
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText="Entendido"
        onClose={hideModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3FA6',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#1B3FA6',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
});