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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Pedir email, 2: Ingresar código OTP y nueva contraseña
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Paso 1: Enviar correo de recuperación con código
  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresá tu correo electrónico.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', traducirError(error.message));
      return;
    }

    Alert.alert(
      'Código enviado',
      'Te enviamos un código de verificación a tu correo. Ingresalo a continuación junto con tu nueva contraseña.'
    );
    setStep(2);
  };

  // Paso 2: Validar código OTP y cambiar la contraseña
  const handleResetPassword = async () => {
    if (!otpCode.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Por favor completá todos los campos.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Contraseña muy corta', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Verificá que ambas contraseñas sean iguales.');
      return;
    }

    setLoading(true);

    // 1. Verificar el token OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: 'recovery',
    });

    if (verifyError) {
      setLoading(false);
      Alert.alert('Código incorrecto', 'El código ingresado es inválido o ha expirado.');
      return;
    }

    // 2. Actualizar la contraseña del usuario
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      Alert.alert('Error al actualizar', traducirError(updateError.message));
      return;
    }

    // Cerrar la sesión temporal para que inicie limpiamente con su nueva contraseña
    await supabase.auth.signOut();

    Alert.alert(
      '¡Contraseña actualizada!',
      'Tu contraseña ha sido cambiada con éxito. Ya podés iniciar sesión con tu nueva clave.',
      [{ text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }]
    );
  };

  const traducirError = (msg) => {
    if (msg.includes('rate limit') || msg.includes('Too many requests')) {
      return 'Demasiados intentos. Esperá unos minutos.';
    }
    if (msg.includes('invalid email') || msg.includes('Invalid email')) {
      return 'El correo electrónico no es válido.';
    }
    if (msg.includes('User not found')) {
      return 'No existe una cuenta registrada con ese correo.';
    }
    return msg;
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header con botón atrás */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#1B3FA6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar contraseña</Text>
        </View>

        {/* Tarjeta */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={step === 1 ? 'mail-outline' : 'shield-checkmark-outline'}
              size={36}
              color="#1B3FA6"
            />
          </View>

          <Text style={styles.title}>
            {step === 1 ? '¿Olvidaste tu contraseña?' : 'Ingresá el código'}
          </Text>

          <Text style={styles.subtitle}>
            {step === 1
              ? 'Ingresá tu correo electrónico y te enviaremos un código de seguridad para restablecerla.'
              : `Ingresá el código de 6 dígitos que enviamos a ${email} y tu nueva contraseña.`}
          </Text>

          {step === 1 ? (
            /* PASO 1: Ingresar Email */
            <>
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
          ) : (
            /* PASO 2: Ingresar Código y Nueva Contraseña */
            <>
              {/* Código OTP */}
              <Text style={styles.label}>Código de verificación (Token)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="keypad-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 123456"
                  placeholderTextColor="#9CA3AF"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              </View>

              {/* Nueva Contraseña */}
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

              {/* Confirmar Nueva Contraseña */}
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
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Restablecer contraseña</Text>
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
