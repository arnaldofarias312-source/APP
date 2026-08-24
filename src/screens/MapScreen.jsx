import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Pantalla placeholder — se implementa completa en la Fase 2
export default function MapScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App.js detecta el cambio de sesión y muestra Login automáticamente
  };

  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={64} color="#1B3FA6" />
      <Text style={styles.title}>¡Bienvenido a Movili!</Text>
      <Text style={styles.subtitle}>El mapa de buses en tiempo real viene pronto.</Text>

      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B3FA6',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnLogoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
