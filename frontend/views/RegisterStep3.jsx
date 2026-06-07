import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// ─── Stub para el backend ────────────────────────────────────────────────────
// El compañero de backend debe completar esta función.
// Recibe el userId (string) y la password (string).
// Debe devolver una Promise que resuelva cuando la contraseña se guardó OK.
const setPassword = async (userId, password) => {
  // TODO: reemplazar con la llamada real, por ejemplo:
  // const response = await fetch(`http://TU_IP/api/usuarios/${userId}/password`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ password }),
  // });
  // if (!response.ok) throw new Error('Error al guardar la contraseña');

  console.log(`[STUB] setPassword llamado con userId=${userId}`);
  await new Promise(resolve => setTimeout(resolve, 800)); // simula latencia
};
// ────────────────────────────────────────────────────────────────────────────

export default function RegisterStep3() {
  const navigation = useNavigation();
  const route = useRoute();

  // 1. Obtenemos el usuario del contexto global (seteado en RegisterPending)
  const { user } = useAuth();

  // 2. Como fallback, también aceptamos userId por params (por si acaso)
  const { userId: userIdParam, step1Data } = route.params || {};

  // El userId definitivo: primero el del contexto, luego el del param
  const userId = user?.id ?? userIdParam;

  const [password, setPasswordState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Evaluación simple de fuerza de contraseña
  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: 'Weak', color: 'text-red-500' };
    if (pwd.length < 10) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Strong', color: 'text-green-500' };
  };
  const strength = getPasswordStrength(password);

  const handleCompleteRegistration = async () => {
    if (!password || password.length < 8) {
      Alert.alert('Contraseña inválida', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!isChecked) {
      Alert.alert('Términos', 'Debés aceptar los términos para continuar.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'No se encontró el ID de usuario. Reiniciá el registro.');
      return;
    }

    setLoading(true);
    try {
      // Llamada al stub (el backend la completará)
      await setPassword(userId, password);

      // Registro completo → vamos al inicio
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error', error.message ?? 'No se pudo guardar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = (type) => {
    // Navegamos a la pantalla de medios de pago pasando el userId del contexto
    // para que esa pantalla pueda asociar el medio al usuario correcto.
    navigation.navigate('AddPaymentMethod', {
      userId,
      paymentType: type, // 'card' | 'bank'
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Cabecera */}
        <Header1 navigation={navigation} />

        {/* Stepper (Paso 3 activo) */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Feather name="check" size={16} color="white" />
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Details</Text>
          </View>
          <View className="flex-1 h-[2px] bg-[#7C3AED] mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Feather name="check" size={16} color="white" />
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Photos</Text>
          </View>
          <View className="flex-1 h-[2px] bg-[#7C3AED] mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Text className="text-white font-bold">3</Text>
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Settings</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-black mb-2">Secure Your Account</Text>
        <Text className="text-slate-500 mb-8">
          Complete these final details to start bidding on exclusive items.
        </Text>

        {/* Contraseña */}
        <Text className="font-bold text-black mb-2 text-sm">Set Your Personal Password</Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 mb-2">
          <TextInput
            className="flex-1 py-4 text-black"
            placeholder="At least 8 characters"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPasswordState}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {strength && (
          <Text className="text-xs text-slate-400 mb-8">
            Strength:{' '}
            <Text className={`${strength.color} font-bold`}>{strength.label}</Text>
            {strength.label === 'Strong' && '. Use symbols and numbers for extra security.'}
          </Text>
        )}
        {!strength && <View className="mb-8" />}

        {/* Métodos de Pago (opcional) */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-bold text-black text-sm">Add Payment Method</Text>
          <View className="bg-orange-100 px-2 py-1 rounded">
            <Text className="text-orange-600 text-[10px] font-bold">MANDATORY TO BID</Text>
          </View>
        </View>

        <TouchableOpacity
          className="border border-slate-200 rounded-xl p-4 flex-row items-center mb-3"
          onPress={() => handleAddPaymentMethod('card')}
        >
          <View className="bg-slate-100 p-2 rounded-lg mr-4">
            <Feather name="credit-card" size={20} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-black">Credit or Debit Card</Text>
            <Text className="text-xs text-slate-400">Visa, Mastercard, AMEX</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-slate-200 rounded-xl p-4 flex-row items-center mb-6"
          onPress={() => handleAddPaymentMethod('bank')}
        >
          <View className="bg-slate-100 p-2 rounded-lg mr-4">
            <Feather name="home" size={20} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-black">Link Bank Account</Text>
            <Text className="text-xs text-slate-400">Secure connection via Plaid</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View className="bg-purple-50 rounded-xl p-4 flex-row mb-6">
          <Feather name="clock" size={16} color="#7C3AED" className="mt-1 mr-2" />
          <Text className="text-[#7C3AED] text-xs flex-1 leading-5">
            Your payment method is only used for verification and to guarantee bids. You will not
            be charged unless you win an auction.
          </Text>
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity
          className="flex-row items-start mb-8"
          onPress={() => setIsChecked(!isChecked)}
        >
          <View
            className={`w-5 h-5 rounded border ${
              isChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'
            } items-center justify-center mr-3 mt-0.5`}
          >
            {isChecked && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-slate-500 text-xs flex-1">
            I agree to the{' '}
            <Text className="text-[#7C3AED]">Terms of Service</Text> and confirm I am over 18
            years of age.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`${
            isChecked && password.length >= 8 ? 'bg-[#7C3AED]' : 'bg-slate-300'
          } rounded-2xl py-4 items-center justify-center mb-10`}
          disabled={!isChecked || password.length < 8 || loading}
          onPress={handleCompleteRegistration}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Complete Registration</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
