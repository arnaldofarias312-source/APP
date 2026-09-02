// src/screens/ForgotPasswordScreen.jsx
import { useState, useRef } from 'react';
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

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Código OTP (8 casillas), 3: Nueva contraseña
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpFocused, setIsOtpFocused] = useState(false);
  const otpInputRef = useRef(null);
  const [newPassword, setNewPassword] = useState('');
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
    setModalConfig({
      visible: true,
      type,
      title,
      message,
      buttonText,
      onConfirm,
    });
  };

  const hideModal = () => {
    const onConfirmAction = modalConfig.onConfirm;
    setModalConfig((prev) => ({ ...prev, visible: false }));
    if (onConfirmAction) {
      onConfirmAction();
    }
  };

  // Paso 1: Enviar correo de recuperación con código
  const handleSendCode = async () => {
    if (!email.trim()) {
      showModal({
        type: 'warning',
        title: 'Campo requerido',
        message: 'Por favor ingresa tu correo electrónico para enviarte el código de seguridad.',
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

    setLoading(true);
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      showModal({
        type: 'error',
        title: 'No se pudo enviar',
        message: traducirError(error.message),
      });
      return;
    }

    showModal({
      type: 'success',
      title: '¡Código enviado!',
      message: `Enviamos un código de 8 dígitos a ${email.trim()}. Revisa tu bandeja de entrada o spam.`,
      buttonText: 'Continuar',
      onConfirm: () => setStep(2),
    });
  };

  // Paso 2: Verificar solo el código OTP (8 casillas)
  const handleVerifyCode = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 8) {
      showModal({
        type: 'warning',
        title: 'Código incompleto',
        message: 'Por favor ingresa el código completo de 8 dígitos que te enviamos.',
      });
      return;
    }

    setLoading(true);
    const { error: verifyError } = await supabaseAnon.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: 'recovery',
    });
    setLoading(false);

    if (verifyError) {
      showModal({
        type: 'error',
        title: 'Código incorrecto',
        message: 'El código de 8 dígitos que ingresaste es inválido o ha expirado. Verifícalo o solicita uno nuevo.',
      });
      return;
    }

    // Código válido -> Avanzar al Paso 3
    setStep(3);
  };

  // Paso 3: Guardar la nueva contraseña
  const handleSaveNewPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showModal({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor completa ambos campos de contraseña.',
      });
      return;
    }

    if (newPassword.length < 8) {
      showModal({
        type: 'warning',
        title: 'Contraseña muy corta',
        message: 'La nueva contraseña debe tener al menos 8 caracteres para ser segura.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal({
        type: 'warning',
        title: 'Las contraseñas no coinciden',
        message: 'Asegúrate de que ambas contraseñas escritas sean exactamente iguales.',
      });
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabaseAnon.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      showModal({
        type: 'error',
        title: 'Error al actualizar',
        message: traducirError(updateError.message),
      });
      return;
    }

    await supabaseAnon.auth.signOut();

    navigation.navigate('Login', {
      resetSuccess: true,
      resetEmail: email.trim(),
    });
  };

  const traducirError = (msg) => {
    if (msg.includes('rate limit') || msg.includes('Too many requests')) {
      return 'Demasiados intentos seguidos. Espera unos minutos antes de volver a intentar.';
    }
    if (msg.includes('invalid email') || msg.includes('Invalid email')) {
      return 'El correo electrónico ingresado no tiene un formato válido.';
    }
    if (msg.includes('User not found')) {
      return 'No encontramos ninguna cuenta registrada con ese correo electrónico.';
    }
    return msg;
  };

  // Icono, título y subtítulo según el paso
  const getHeaderInfo = () => {
    if (step === 1) {
      return {
        icon: 'mail-outline',
        title: '¿Olvidaste tu contraseña?',
        subtitle: 'Ingresa tu correo electrónico y te enviaremos un código de seguridad para restablecerla.',
      };
    }
    if (step === 2) {
      return {
        icon: 'keypad-outline',
        title: 'Código de seguridad',
        subtitle: `Ingresa el código de 8 dígitos que enviamos a ${email}.`,
      };
    }
    return {
      icon: 'lock-closed-outline',
      title: 'Nueva contraseña',
      subtitle: 'Crea tu nueva contraseña para acceder a tu cuenta de Movili.',
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <SafeAreaView style={styles.wrapper}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header con botón atrás */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (step === 3) setStep(2);
                else if (step === 2) setStep(1);
                else navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1B3FA6" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recuperar contraseña</Text>
          </View>

          {/* Tarjeta */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name={headerInfo.icon} size={36} color="#1B3FA6" />
            </View>

            <Text style={styles.title}>{headerInfo.title}</Text>
            <Text style={styles.subtitle}>{headerInfo.subtitle}</Text>

            {/* PASO 1: Email */}
            {step === 1 && (
              <>
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => setEmail(text.replace(/\s/g, '').toLowerCase())}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btnPrimary, loading && styles.btnDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Enviar código</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* PASO 2: Código OTP — 8 casillas continuas sin separación */}
            {step === 2 && (
              <>
                <Text style={styles.label}>Código de verificación (8 dígitos)</Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => otpInputRef.current?.focus()}
                  style={styles.otpContainer}
                >
                  <View style={styles.otpSingleRow}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                      const digit = otpCode[index] || '';
                      const isCurrent = isOtpFocused && (otpCode.length === index || (index === 7 && otpCode.length === 8));
                      const isFilled = Boolean(digit);

                      return (
                        <View
                          key={index}
                          style={[
                            styles.otpBox,
                            isFilled && styles.otpBoxFilled,
                            isCurrent && styles.otpBoxFocused,
                          ]}
                        >
                          <Text style={[styles.otpDigit, isFilled && styles.otpDigitFilled]}>
                            {digit}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Input invisible que captura el teclado */}
                  <TextInput
                    ref={otpInputRef}
                    style={styles.hiddenOtpInput}
                    value={otpCode}
                    onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 8))}
                    keyboardType="number-pad"
                    maxLength={8}
                    onFocus={() => setIsOtpFocused(true)}
                    onBlur={() => setIsOtpFocused(false)}
                    textContentType="oneTimeCode"
                    autoFocus={true}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnPrimary, loading && styles.btnDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Verificar código</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
                </TouchableOpacity>
              </>
            )}

            {/* PASO 3: Nueva Contraseña */}
            {step === 3 && (
              <>
                <Text style={styles.label}>Nueva contraseña</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#9CA3AF"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirmar nueva contraseña</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repite tu nueva contraseña"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.btnPrimary, loading && styles.btnDisabled]}
                  onPress={handleSaveNewPassword}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Guardar nueva contraseña</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Volver a iniciar sesión */}
            <TouchableOpacity
              style={styles.backToLoginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>Volver a Iniciar sesión</Text>
            </TouchableOpacity>
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
    marginBottom: 24,
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
  iconContainer: {
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3FA6',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },
  // ─── OTP Styles ───
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 4,
    position: 'relative',
  },
  otpSingleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 4,
  },
  otpBox: {
    flex: 1,
    height: 48,
    maxWidth: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  otpBoxFocused: {
    borderColor: '#1B3FA6',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1B3FA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  otpDigit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  otpDigitFilled: {
    color: '#1B3FA6',
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  // ─── Input Styles ───
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
  resendBtn: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resendText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
  },
  backToLoginBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#1B3FA6',
    fontSize: 14,
    fontWeight: '600',
  },
});