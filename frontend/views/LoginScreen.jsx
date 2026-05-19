import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!documento || !password) {
      setErrorMessage('Ingresá documento y contraseña.');
      return;
    }

    try {
      await login({
        documento: documento.trim(),
        contrasenia: password,
      });

      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage(error.message || 'Documento o contraseña inválidos.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 bg-slate-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-[40px] px-6 py-10 w-full shadow-sm">

            <View className="flex-row items-center justify-center mb-2">
              <Image
                source={require('../assets/logo.png')}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-3xl font-bold text-[#7C3AED]">BidFlow</Text>
            </View>

            <Text className="text-center text-slate-400 mb-6">
              Iniciá sesión para participar en subastas
            </Text>

            {errorMessage ? (
              <Text className="text-red-500 text-center mb-4 font-medium px-2">
                {errorMessage}
              </Text>
            ) : null}

            <Text className="font-bold text-black mb-2 ml-1 text-sm">Documento</Text>
            <View className="bg-slate-50 rounded-2xl mb-6 border border-transparent">
              <TextInput
                className="px-4 py-4 text-black"
                placeholder="Ingresá tu documento"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                autoCapitalize="none"
                value={documento}
                onChangeText={setDocumento}
              />
            </View>

            <View className="flex-row justify-between items-center mb-2 ml-1">
              <Text className="font-bold text-black text-sm">Contraseña</Text>
              <TouchableOpacity>
                <Text className="text-[#a78bfa] text-xs font-medium">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-slate-50 rounded-2xl mb-8 px-4 border border-transparent">
              <TextInput
                className="flex-1 py-4 text-black"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200"
              onPress={handleLogin}
            >
              <Text className="text-white font-bold text-lg">Log In</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterStep1')}>
                <Text className="text-[#a78bfa] font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}