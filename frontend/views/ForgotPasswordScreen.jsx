import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { recuperarContrasenia } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [documento, setDocumento] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!documento.trim() || loading) return;
    try {
      setLoading(true);
      await recuperarContrasenia(documento.trim());
      setSent(true);
    } catch {
      // No revelamos si el DNI existe: mostramos la misma confirmación igualmente.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-4">

          <View className="bg-white rounded-[40px] px-6 py-10 w-full shadow-sm">

            <View className="flex-row items-center justify-center mb-2">
              <Logo size={36} />
              <Text className="text-3xl font-bold text-[#7C3AED]">BidFlow</Text>
            </View>

            {sent ? (
              <View className="items-center py-6">
                <View className="bg-green-50 rounded-full p-5 mb-5">
                  <Feather name="mail" size={36} color="#10b981" />
                </View>
                <Text className="text-xl font-bold text-slate-800 mb-2">Check your email</Text>
                <Text className="text-slate-400 text-sm text-center px-4 leading-5">
                  If an account exists for DNI{' '}
                  <Text className="font-bold text-slate-600">{documento}</Text>
                  , we emailed you a new temporary password.
                </Text>
                <Text className="text-slate-300 text-[11px] text-center px-4 mt-3 italic">
                  (Demo: the new password is also printed to the backend console.)
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="mt-8 bg-[#7C3AED] rounded-2xl py-4 px-10 items-center justify-center shadow-md shadow-purple-200"
                >
                  <Text className="text-white font-bold text-sm">Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text className="text-center text-slate-400 mb-8">
                  Enter your DNI and we will email you a new temporary password
                </Text>

                <Text className="font-bold text-black mb-2 ml-1 text-sm">DNI</Text>
                <View className="bg-slate-50 rounded-2xl mb-8 border border-transparent">
                  <TextInput
                    className="px-4 py-4 text-black"
                    placeholder="e.g. 40000010"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    value={documento}
                    onChangeText={setDocumento}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={loading}
                  className={`rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200 mb-4 ${loading ? 'bg-slate-300' : 'bg-[#7C3AED]'}`}
                >
                  {loading
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-bold text-lg">Reset Password</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} className="items-center py-2">
                  <Text className="text-slate-400 text-sm">Back to Login</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
