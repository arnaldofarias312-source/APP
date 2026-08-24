import { useState } from 'react';
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
import { supabaseAnon } from '../lib/supabase';
import StatusModal from '../components/StatusModal';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      showModal({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor completá todos los campos para crear tu cuenta.',
      });
      return;
    }
    if (password.length < 8) {
      showModal({
        type: 'warning',
        title: 'Contraseña muy corta',
        message: 'La contraseña debe tener al menos 8 caracteres para ser segura.',
      });
      return;
    }
    if (password !== confirmPassword) {
      showModal({
        type: 'warning',
        title: 'Las contraseñas no coinciden',
        message: 'Asegurate de que ambas contraseñas escritas sean exactamente iguales.',
      });
      return;
    }

    setLoading(true);
    // Usamos supabaseAnon para crear el usuario sin iniciar sesión automáticamente
    const { error } = await supabaseAnon.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: nombre.trim() },
      },
    });
    setLoading(false);

    if (error) {
      showModal({
        type: 'error',
        title: 'Error al registrarse',
        message: traducirError(error.message),
      });
      return;
    }

    // Redirigir limpiamente a Login con la bandera de éxito y el correo pre-llenado
    navigation.navigate('Login', {
      registerSuccess: true,
      registeredEmail: email.trim(),
    });
  };

  const traducirError = (msg) => {
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return 'Ese correo ya tiene una cuenta registrada. Podés iniciar sesión directamente.';
    }
    if (msg.includes('invalid email') || msg.includes('Invalid email')) {
      return 'El correo electrónico ingresado no tiene un formato válido.';
    }
    if (msg.includes('Password should be')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (msg.includes('Too many requests') || msg.includes('rate limit') || msg.includes('email rate limit')) {
      return 'Demasiados intentos seguidos. Esperá unos minutos antes de intentar de nuevo.';
    }
    return msg;
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header con flecha atrás */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#1B3FA6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crea tu cuenta</Text>
        </View>

        {/* Tarjeta */}
        <View style={styles.card}>
          <Text style={styles.title}>Movili</Text>

          {/* Campo nombre */}
          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#9CA3AF"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          {/* Campo email */}
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="juan@ejemplo.com"
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
              placeholder="Mínimo 8 caracteres"
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

          {/* Confirmar contraseña */}
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Botón crear cuenta */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Link a login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
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
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3FA6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3FA6',
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#1B3FA6',
    fontSize: 14,
    fontWeight: '700',
  },
});
