// src/screens/RegisterScreen.jsx
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabaseAnon } from '../lib/supabase';
import StatusModal from '../components/StatusModal';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Datos personales, 2: Contraseña

  // Paso 1: Datos personales
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Paso 2: Contraseña
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

  // Filtros estrictos de entrada
  const handleNombresChange = (text) => {
    const cleaned = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setNombres(cleaned);
  };

  const handleApellidosChange = (text) => {
    const cleaned = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setApellidos(cleaned);
  };

  const handleTelefonoChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 15);
    setTelefono(cleaned);
  };

  const handleEmailChange = (text) => {
    const cleaned = text.replace(/\s/g, '').toLowerCase();
    setEmail(cleaned);
  };

  // Validación del Paso 1 para pasar al Paso 2
  const handleNextStep = () => {
    if (!nombres.trim() || !apellidos.trim() || !telefono.trim() || !email.trim()) {
      showModal({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos para continuar.',
      });
      return;
    }

    if (nombres.trim().length < 2) {
      showModal({
        type: 'warning',
        title: 'Nombres inválidos',
        message: 'El campo de nombres debe tener al menos 2 letras.',
      });
      return;
    }

    if (apellidos.trim().length < 2) {
      showModal({
        type: 'warning',
        title: 'Apellidos inválidos',
        message: 'El campo de apellidos debe tener al menos 2 letras.',
      });
      return;
    }

    if (telefono.trim().length < 7 || telefono.trim().length > 15) {
      showModal({
        type: 'warning',
        title: 'Teléfono inválido',
        message: 'Por favor ingresa un número de teléfono válido (entre 7 y 15 dígitos).',
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      showModal({
        type: 'warning',
        title: 'Correo inválido',
        message: 'Por favor ingresa un correo electrónico válido (ej. juan@ejemplo.com).',
      });
      return;
    }

    setStep(2);
  };

  // Requisitos de contraseña en tiempo real
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  // Registro final en Supabase
  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      showModal({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor completa ambos campos de contraseña.',
      });
      return;
    }

    if (!hasMinLength || !hasSpecialChar || !hasUpperCase || !hasNumber) {
      showModal({
        type: 'warning',
        title: 'Contraseña insegura',
        message: 'Asegúrate de que la contraseña cumpla con todos los requisitos marcados en verde.',
      });
      return;
    }

    if (password !== confirmPassword) {
      showModal({
        type: 'warning',
        title: 'Las contraseñas no coinciden',
        message: 'Asegúrate de que ambas contraseñas escritas sean exactamente iguales.',
      });
      return;
    }

    setLoading(true);
    const fullName = `${nombres.trim()} ${apellidos.trim()}`;

    const { error } = await supabaseAnon.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: nombres.trim(),
          last_name: apellidos.trim(),
          phone: telefono.trim(),
          phone_number: telefono.trim(),
        },
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

    navigation.navigate('Login', {
      registerSuccess: true,
      registeredEmail: email.trim(),
    });
  };

  const traducirError = (msg) => {
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return 'Ese correo ya tiene una cuenta registrada. Puedes iniciar sesión directamente.';
    }
    if (msg.includes('invalid email') || msg.includes('Invalid email')) {
      return 'El correo electrónico ingresado no tiene un formato válido.';
    }
    if (msg.includes('Password should be')) {
      return 'La contraseña no cumple con los requisitos de seguridad.';
    }
    if (msg.includes('Too many requests') || msg.includes('rate limit') || msg.includes('email rate limit')) {
      return 'Demasiados intentos seguidos. Espera unos minutos antes de intentar de nuevo.';
    }
    return msg;
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header con flecha atrás */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1B3FA6" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {step === 1 ? 'Datos personales' : 'Crear contraseña'}
            </Text>
          </View>

          {/* Tarjeta */}
          <View style={styles.card}>
            <Text style={styles.title}>Movili</Text>

            <Text style={styles.stepSubtitle}>
              {step === 1
                ? 'Paso 1 de 2: Ingresa tus datos para registrarte'
                : 'Paso 2 de 2: Define una contraseña segura para tu cuenta'}
            </Text>

            {/* VISTA 1: DATOS PERSONALES */}
            {step === 1 && (
              <>
                {/* Campo Nombres */}
                <Text style={styles.label}>Nombres</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Juan Carlos"
                    placeholderTextColor="#9CA3AF"
                    value={nombres}
                    onChangeText={handleNombresChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                {/* Campo Apellidos */}
                <Text style={styles.label}>Apellidos</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Pérez González"
                    placeholderTextColor="#9CA3AF"
                    value={apellidos}
                    onChangeText={handleApellidosChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                {/* Campo Teléfono */}
                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 04141234567"
                    placeholderTextColor="#9CA3AF"
                    value={telefono}
                    onChangeText={handleTelefonoChange}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={15}
                  />
                </View>

                {/* Campo Correo Electrónico */}
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="juan@ejemplo.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Botón Continuar */}
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleNextStep}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnPrimaryText}>Continuar</Text>
                </TouchableOpacity>
              </>
            )}

            {/* VISTA 2: CONTRASEÑA CON VALIDACIONES EN TIEMPO REAL */}
            {step === 2 && (
              <>
                {/* Campo Contraseña */}
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

                {/* Campo Confirmar Contraseña */}
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

                {/* Lista de requisitos en tiempo real */}
                <View style={styles.requirementsContainer}>
                  <View style={styles.reqRow}>
                    <Ionicons
                      name={hasMinLength ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={hasMinLength ? '#16A34A' : '#EF4444'}
                    />
                    <Text style={[styles.reqText, hasMinLength ? styles.reqTextSuccess : styles.reqTextError]}>
                      Mínimo 8 caracteres
                    </Text>
                  </View>

                  <View style={styles.reqRow}>
                    <Ionicons
                      name={hasSpecialChar ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={hasSpecialChar ? '#16A34A' : '#EF4444'}
                    />
                    <Text style={[styles.reqText, hasSpecialChar ? styles.reqTextSuccess : styles.reqTextError]}>
                      Al menos 1 carácter especial (@, #, $)
                    </Text>
                  </View>

                  <View style={styles.reqRow}>
                    <Ionicons
                      name={hasUpperCase ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={hasUpperCase ? '#16A34A' : '#EF4444'}
                    />
                    <Text style={[styles.reqText, hasUpperCase ? styles.reqTextSuccess : styles.reqTextError]}>
                      Al menos 1 letra mayúscula
                    </Text>
                  </View>

                  <View style={styles.reqRow}>
                    <Ionicons
                      name={hasNumber ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={hasNumber ? '#16A34A' : '#EF4444'}
                    />
                    <Text style={[styles.reqText, hasNumber ? styles.reqTextSuccess : styles.reqTextError]}>
                      Al menos 1 número
                    </Text>
                  </View>

                  {confirmPassword.length > 0 && (
                    <View style={styles.reqRow}>
                      <Ionicons
                        name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                        size={18}
                        color={passwordsMatch ? '#16A34A' : '#EF4444'}
                      />
                      <Text style={[styles.reqText, passwordsMatch ? styles.reqTextSuccess : styles.reqTextError]}>
                        Las contraseñas coinciden
                      </Text>
                    </View>
                  )}
                </View>

                {/* Botón Crear Cuenta */}
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
              </>
            )}

            {/* Link a login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal estético */}
      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        onClose={hideModal}
      />
    </SafeAreaView>
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
    marginBottom: 16,
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
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#6B7280',
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
  requirementsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  reqTextSuccess: {
    color: '#15803D',
  },
  reqTextError: {
    color: '#DC2626',
  },
  btnPrimary: {
    backgroundColor: '#1B3FA6',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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