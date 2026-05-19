import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';

export default function RegisterStep2({ route, navigation }) {
  const registerData = route?.params?.registerData;

  const [frenteCargado, setFrenteCargado] = useState(false);
  const [dorsoCargado, setDorsoCargado] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = () => {
    setErrorMessage('');

    if (!frenteCargado || !dorsoCargado) {
      setErrorMessage('Cargá o simulá la carga del frente y dorso del documento.');
      return;
    }

    navigation.navigate('RegisterStep3', {
      registerData: {
        ...registerData,
        documentacion: {
          frente: true,
          dorso: true,
        },
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 bg-white">
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
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="text-xs text-[#7C3AED] font-medium">Documentación</Text>
            </View>

            <View className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4" />

            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-1">
                <Text className="text-slate-500 font-bold">3</Text>
              </View>
              <Text className="text-xs text-slate-400">Clave</Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-black mb-2">
            Documentación
          </Text>

          <Text className="text-slate-500 mb-6 leading-6">
            Para validar tu identidad, la empresa necesita el frente y dorso de tu documento.
            En esta versión demo simulamos la carga para mantener el flujo completo.
          </Text>

          {errorMessage ? (
            <Text className="text-red-500 text-center mb-4 font-medium">
              {errorMessage}
            </Text>
          ) : null}

          <Text className="font-bold text-black mb-2 text-sm">Documento frente</Text>
          <TouchableOpacity
            onPress={() => setFrenteCargado(true)}
            className={`border-2 border-dashed rounded-2xl p-8 items-center mb-6 ${
              frenteCargado ? 'border-green-400 bg-green-50' : 'border-[#d8b4fe] bg-purple-50'
            }`}
          >
            <View className="bg-white p-3 rounded-full shadow-sm mb-3">
              <Feather
                name={frenteCargado ? 'check' : 'camera'}
                size={24}
                color={frenteCargado ? '#16a34a' : '#7C3AED'}
              />
            </View>

            <Text className={`${frenteCargado ? 'text-green-600' : 'text-[#7C3AED]'} font-bold mb-1`}>
              {frenteCargado ? 'Frente cargado' : 'Tocar para simular carga'}
            </Text>

            <Text className="text-slate-400 text-xs">PNG/JPG hasta 10MB</Text>
          </TouchableOpacity>

          <Text className="font-bold text-black mb-2 text-sm">Documento dorso</Text>
          <TouchableOpacity
            onPress={() => setDorsoCargado(true)}
            className={`border-2 border-dashed rounded-2xl p-8 items-center mb-6 ${
              dorsoCargado ? 'border-green-400 bg-green-50' : 'border-[#d8b4fe] bg-purple-50'
            }`}
          >
            <View className="bg-white p-3 rounded-full shadow-sm mb-3">
              <Feather
                name={dorsoCargado ? 'check' : 'upload'}
                size={24}
                color={dorsoCargado ? '#16a34a' : '#7C3AED'}
              />
            </View>

            <Text className={`${dorsoCargado ? 'text-green-600' : 'text-[#7C3AED]'} font-bold mb-1`}>
              {dorsoCargado ? 'Dorso cargado' : 'Tocar para simular carga'}
            </Text>

            <Text className="text-slate-400 text-xs">PNG/JPG hasta 10MB</Text>
          </TouchableOpacity>

          <View className="bg-slate-50 rounded-xl p-4 flex-row mb-8">
            <Feather name="info" size={16} color="#7C3AED" />
            <Text className="text-slate-500 text-xs flex-1 leading-5 ml-2">
              La documentación queda pendiente de revisión interna. Hasta ser aprobado, el usuario podrá iniciar sesión pero no pujar.
            </Text>
          </View>

          <TouchableOpacity
            className="bg-[#7C3AED] rounded-2xl py-4 items-center flex-row justify-center mb-6"
            onPress={handleContinue}
          >
            <Text className="text-white font-bold text-lg mr-2">Continuar</Text>
            <Feather name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}