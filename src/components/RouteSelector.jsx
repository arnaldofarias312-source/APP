// src/components/RouteSelector.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RouteSelector({
  routes,
  selectedRouteId,
  onSelectRoute,
  onClearSelection,
  loading = false,
}) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  const handleSelect = (route) => {
    onSelectRoute(route.id);
    setModalVisible(false);
  };

  const handleClear = () => {
    if (onClearSelection) {
      onClearSelection();
      setModalVisible(false);
    }
  };

  const hasSelection = selectedRouteId !== null && selectedRouteId !== undefined;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="bus-outline" size={20} color="#1B3FA6" />
        <Text style={styles.selectorText}>
          {selectedRoute ? selectedRoute.nombre : 'Seleccionar línea'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      {hasSelection && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color="#DC2626" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Seleccionar línea</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <ActivityIndicator size="large" color="#1B3FA6" style={styles.loader} />
                ) : (
                  <FlatList
                    data={routes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.routeItem,
                          selectedRouteId === item.id && styles.routeItemSelected,
                        ]}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.routeItemContent}>
                          <View style={styles.routeColorIndicator}>
                            <View style={[styles.colorDot, { backgroundColor: item.color_hex || '#1B3FA6' }]} />
                          </View>
                          <View style={styles.routeInfo}>
                            <Text style={styles.routeName}>{item.nombre}</Text>
                          </View>
                          {selectedRouteId === item.id && (
                            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay líneas disponibles</Text>
                      </View>
                    )}
                  />
                )}

                {hasSelection && (
                  <TouchableOpacity
                    style={styles.clearSelectionButton}
                    onPress={handleClear}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                    <Text style={styles.clearSelectionText}>Limpiar selección</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3FA6',
  },
  closeButton: {
    padding: 4,
  },
  loader: {
    paddingVertical: 40,
  },
  routeItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  routeItemSelected: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  routeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeColorIndicator: {
    marginRight: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});