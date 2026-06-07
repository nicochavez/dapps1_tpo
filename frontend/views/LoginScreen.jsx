import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Logo from '../components/Logo';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!dni || !password) {
      setErrorMessage('Please enter both DNI and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ documento: dni.trim(), contrasenia: password });
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
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
              <Logo size={36} />
              <Text className="text-3xl font-bold text-[#7C3AED]">BidFlow</Text>
            </View>
            <Text className="text-center text-slate-400 mb-6">Sign in to start bidding</Text>

            {errorMessage ? (
              <Text className="text-red-500 text-center mb-4 font-medium px-2">
                {errorMessage}
              </Text>
            ) : null}

            <Text className="font-bold text-black mb-2 ml-1 text-sm">DNI</Text>
            <View className="bg-slate-50 rounded-2xl mb-6 border border-transparent focus:border-purple-200">
              <TextInput
                className="px-4 py-4 text-black"
                placeholder="Enter your DNI"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={dni}
                onChangeText={setDni}
              />
            </View>

            <View className="flex-row justify-between items-center mb-2 ml-1">
              <Text className="font-bold text-black text-sm">Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-[#a78bfa] text-xs font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-slate-50 rounded-2xl mb-8 px-4 border border-transparent focus:border-purple-200">
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
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Log In</Text>
              )}
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
