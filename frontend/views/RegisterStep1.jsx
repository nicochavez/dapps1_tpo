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

export default function RegisterStep1({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = () => {
    setErrorMessage('');

    if (!nombre || !apellido || !documento || !email || !direccion) {
      setErrorMessage('Completá nombre, apellido, DNI, email y domicilio.');
      return;
    }

    navigation.navigate('RegisterStep2', {
      registerData: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        documento: documento.trim(),
        email: email.trim().toLowerCase(),
        direccion: `${direccion.trim()}${ciudad ? `, ${ciudad.trim()}` : ''}${codigoPostal ? ` (${codigoPostal.trim()})` : ''}`,
        numeroPais: 32,
      },
    });
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
              <Text className="text-white font-bold">1</Text>
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Datos</Text>
          </View>

          <View className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4" />

          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-1">
              <Text className="text-slate-500 font-bold">2</Text>
            </View>
            <Text className="text-xs text-slate-400">Documentación</Text>
          </View>

          <View className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4" />

          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-1">
              <Text className="text-slate-500 font-bold">3</Text>
            </View>
            <Text className="text-xs text-slate-400">Clave</Text>
          </View>
        </View>

        {errorMessage ? (
          <Text className="text-red-500 text-center mb-4 font-medium">
            {errorMessage}
          </Text>
        ) : null}

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-black mb-2 text-sm">Nombre</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black"
              placeholder="Juan"
              placeholderTextColor="#94a3b8"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">Apellido</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black"
              placeholder="Pérez"
              placeholderTextColor="#94a3b8"
              value={apellido}
              onChangeText={setApellido}
            />
          </View>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">DNI / Documento</Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
          placeholder="44111222"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={documento}
          onChangeText={setDocumento}
        />

        <Text className="font-bold text-black mb-2 text-sm">Email</Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-6"
          placeholder="email@test.com"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="font-bold text-black mb-4 text-base">Domicilio legal</Text>

        <Text className="font-bold text-black mb-2 text-sm">Dirección</Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
          placeholder="Calle 1234"
          placeholderTextColor="#94a3b8"
          value={direccion}
          onChangeText={setDireccion}
        />

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-black mb-2 text-sm">Ciudad</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black"
              placeholder="Buenos Aires"
              placeholderTextColor="#94a3b8"
              value={ciudad}
              onChangeText={setCiudad}
            />
          </View>

          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">Código Postal</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black"
              placeholder="0000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={codigoPostal}
              onChangeText={setCodigoPostal}
            />
          </View>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">País de origen</Text>
        <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-8 flex-row justify-between items-center">
          <Text className="text-black">Argentina</Text>
          <Feather name="chevron-down" size={20} color="#94a3b8" />
        </View>

        <Text className="text-center text-xs text-slate-400 mb-4 px-4">
          Al continuar, aceptás que la empresa verifique tu documentación antes de habilitarte para pujar.
        </Text>

        <TouchableOpacity
          className="bg-[#7C3AED] rounded-2xl py-4 items-center flex-row justify-center mb-6"
          onPress={handleContinue}
        >
          <Text className="text-white font-bold text-lg mr-2">Continuar</Text>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>

        <View className="flex-row justify-center mb-10">
          <Text className="text-slate-500">¿Ya tenés cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[#7C3AED] font-bold">Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}