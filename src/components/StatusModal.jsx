// src/components/StatusModal.jsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * StatusModal - Modal estético para alertas y notificaciones con el diseño de Movili.
 *
 * Props:
 * - visible: boolean
 * - type: 'success' | 'error' | 'info' | 'warning'
 * - title: string
 * - message: string
 * - buttonText: string (opcional, default: "Entendido")
 * - onConfirm: () => void (opcional)
 * - secondaryButtonText: string (opcional)
 * - onCancel: () => void (opcional)
 * - onClose: () => void
 */
export default function StatusModal({
  visible,
  type = 'info',
  title,
  message,
  buttonText = 'Entendido',
  onConfirm,
  secondaryButtonText,
  onCancel,
  onClose,
}) {
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: '#16A34A',
          bgColor: '#DCFCE7',
          btnColor: '#16A34A',
        };
      case 'error':
        return {
          name: 'alert-circle',
          color: '#DC2626',
          bgColor: '#FEE2E2',
          btnColor: '#DC2626',
        };
      case 'warning':
        return {
          name: 'warning',
          color: '#D97706',
          bgColor: '#FEF3C7',
          btnColor: '#D97706',
        };
      case 'info':
      default:
        return {
          name: 'information-circle',
          color: '#1B3FA6',
          bgColor: '#EEF2FF',
          btnColor: '#1B3FA6',
        };
    }
  };

  const iconConfig = getIconConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Icono con fondo circular */}
              <View style={[styles.iconCircle, { backgroundColor: iconConfig.bgColor }]}>
                <Ionicons name={iconConfig.name} size={36} color={iconConfig.color} />
              </View>

              {/* Título */}
              {title ? <Text style={styles.title}>{title}</Text> : null}

              {/* Mensaje */}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {/* Botón principal */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: iconConfig.btnColor }]}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>{buttonText}</Text>
              </TouchableOpacity>

              {/* Botón secundario (si aplica) */}
              {secondaryButtonText ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});