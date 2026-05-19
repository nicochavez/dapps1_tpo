import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';
import { registerRequest } from '../services/api';

export default function RegisterStep3({ route, navigation }) {
  const registerData = route?.params?.registerData;

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    if (!registerData) {
      setErrorMessage('Faltan datos del registro. Volvé al primer paso.');
      return;
    }

    if (!contrasenia || contrasenia.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (contrasenia !== confirmarContrasenia) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!isChecked) {
      setErrorMessage('Aceptá los términos para continuar.');
      return;
    }

    try {
      setLoading(true);

      await registerRequest({
        ...registerData,
        contrasenia,
      });

      navigation.navigate('RegisterPending', {
        email: registerData.email,
        documento: registerData.documento,
      });
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView className="flex-1 px-6 pt-12">
        <Header1 navigation={navigation} />

        <View className="flex-row items-center justify-between mb-8 px-2">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Feather name="check" size={16} color="white" />
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Datos</Text>
          </View>

          <View className="flex-1 h-[2px] bg-[#7C3AED] mx-2 -mt-4" />

          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Feather name="check" size={16} color="white" />
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Documentación</Text>
          </View>

          <View className="flex-1 h-[2px] bg-[#7C3AED] mx-2 -mt-4" />

          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Text className="text-white font-bold">3</Text>
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Clave</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-black mb-2">
          Creá tu clave
        </Text>

        <Text className="text-slate-500 mb-8">
          Una vez enviado el registro, tu cuenta quedará pendiente de validación por la empresa.
        </Text>

        {errorMessage ? (
          <Text className="text-red-500 text-center mb-4 font-medium">
            {errorMessage}
          </Text>
        ) : null}

        <Text className="font-bold text-black mb-2 text-sm">Contraseña</Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 mb-4">
          <TextInput
            className="flex-1 py-4 text-black"
            placeholder="Al menos 6 caracteres"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={contrasenia}
            onChangeText={setContrasenia}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">Confirmar contraseña</Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 mb-6">
          <TextInput
            className="flex-1 py-4 text-black"
            placeholder="Repetí tu contraseña"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={confirmarContrasenia}
            onChangeText={setConfirmarContrasenia}
          />
        </View>

        <View className="bg-purple-50 rounded-xl p-4 flex-row mb-6">
          <Feather name="clock" size={16} color="#7C3AED" />
          <Text className="text-[#7C3AED] text-xs flex-1 leading-5 ml-2">
            Tu solicitud será revisada por la empresa. Hasta ser aprobado, no podrás conectarte a subastas ni realizar pujas.
          </Text>
        </View>

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
            Acepto los <Text className="text-[#7C3AED]">Términos de Servicio</Text> y confirmo que soy mayor de 18 años.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`${isChecked ? 'bg-[#7C3AED]' : 'bg-slate-300'} rounded-2xl py-4 items-center justify-center mb-10`}
          disabled={!isChecked || loading}
          onPress={handleRegister}
        >
          <Text className="text-white font-bold text-lg">
            {loading ? 'Enviando solicitud...' : 'Completar registro'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}