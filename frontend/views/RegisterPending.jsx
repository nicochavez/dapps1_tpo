import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';

export default function RegisterPending({ route, navigation }) {
  const email = route?.params?.email;
  const documento = route?.params?.documento;

  return (
    <View className="flex-1 bg-white px-6 pt-12 pb-10">
      <Header1 navigation={navigation} />

      <View className="flex-1 items-center justify-center">
        <View className="w-32 h-32 bg-purple-50 rounded-full items-center justify-center mb-6 relative">
          <Feather name="shield" size={48} color="#7C3AED" />

          <View className="absolute bottom-[-10px] bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            <Text className="text-[#7C3AED] text-[10px] font-bold uppercase tracking-wider">
              Pendiente
            </Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-black mb-3">
          Verificación pendiente
        </Text>

        <Text className="text-slate-500 text-center px-4 leading-6">
          Recibimos tu solicitud de registro. La empresa revisará tu documentación y, si corresponde, aprobará tu cuenta y asignará tu categoría.
        </Text>

        {email ? (
          <Text className="text-slate-400 text-center mt-4 text-xs">
            Email: {email}
          </Text>
        ) : null}

        {documento ? (
          <Text className="text-slate-400 text-center mt-1 text-xs">
            Documento: {documento}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center mb-4"
        onPress={() => navigation.navigate('Login')}
      >
        <Text className="text-white font-bold text-lg">
          Ir al inicio de sesión
        </Text>
      </TouchableOpacity>

      <Text className="text-slate-400 text-center text-xs px-6">
        Vas a poder iniciar sesión, pero no participar ni pujar hasta que la empresa apruebe tu cuenta.
      </Text>
    </View>
  );
}