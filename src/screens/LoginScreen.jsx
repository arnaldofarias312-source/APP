import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import StatusModal from '../components/StatusModal';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttonText: 'Entendido',
    onConfirm: null,
  });

  const showModal = ({ type = 'info', title, message, buttonText = 'Entendido', onConfirm = null }) => {
    setModalConfig({ visible: true, type, title, message, buttonText, onConfirm });
  };

  const hideModal = () => {
    const action = modalConfig.onConfirm;
    setModalConfig((prev) => ({ ...prev, visible: false }));
    if (action) action();
  };

  useEffect(() => {
    if (route?.params?.registerSuccess) {
      setShowSuccessBanner(true);
      if (route?.params?.registeredEmail) {
        setEmail(route.params.registeredEmail);
      }
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [route?.params]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showModal({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor ingresá tu correo electrónico y tu contraseña para continuar.',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      showModal({
        type: 'error',
        title: 'Error al iniciar sesión',
        message: traducirError(error.message),
      });
    }
    // Si no hay error, App.js detecta el cambio de sesión y muestra el mapa
  };

  const traducirError = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'El correo o la contraseña que ingresaste son incorrectos.';
    if (msg.includes('Email not confirmed')) return 'Debés confirmar tu correo electrónico antes de ingresar. Revisá tu bandeja de entrada.';
    if (msg.includes('Too many requests')) return 'Demasiados intentos seguidos. Esperá unos minutos antes de intentar de nuevo.';
    return msg;
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Fondo degradado superior */}
        <View style={styles.topBlob} />

        {/* Tarjeta */}
        <View style={styles.card}>
          {/* Banner de éxito al registrarse */}
          {showSuccessBanner && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.successBannerTitle}>¡Registro exitoso!</Text>
                <Text style={styles.successBannerText}>
                  Tu cuenta fue creada. Ya podés iniciar sesión.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSuccessBanner(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="location" size={22} color="#1B9ADE" />
              <Ionicons name="bus" size={18} color="#4CAF50" style={{ marginLeft: -4 }} />
            </View>
            <Text style={styles.logoLabel}>Movili</Text>
          </View>

          <Text style={styles.title}>Movili</Text>

          {/* Campo email */}
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Botón iniciar sesión */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          {/* ¿Olvidaste tu contraseña? */}
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.divider} />

          {/* Link a registro */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal estético */}
      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        onClose={hideModal}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topBlob: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: '#DBEAFE',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  successBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  successBannerText: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 4,
  },
  logoLabel: {
    fontSize: 12,
    color: '#1B9ADE',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3FA6',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  eyeButton: {
    padding: 6,
  },
  btnPrimary: {
    backgroundColor: '#1B3FA6',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotText: {
    color: '#1B3FA6',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerLink: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '700',
  },
});
