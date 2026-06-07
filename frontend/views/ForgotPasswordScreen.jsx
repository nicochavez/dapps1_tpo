import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { cambiarContrasenia } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await cambiarContrasenia({ email: email.trim(), contrasenia: newPassword });
      setSent(true);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
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
                  <Feather name="check-circle" size={36} color="#10b981" />
                </View>
                <Text className="text-xl font-bold text-slate-800 mb-2">Password updated</Text>
                <Text className="text-slate-400 text-sm text-center px-4 leading-5">
                  Your password has been changed. You can now log in with your new password.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  className="mt-8 bg-[#7C3AED] rounded-2xl py-4 px-10 items-center justify-center shadow-md shadow-purple-200"
                >
                  <Text className="text-white font-bold text-sm">Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text className="text-center text-slate-400 mb-8">
                  Enter your email and a new password to reset your account
                </Text>

                {error ? (
                  <Text className="text-red-500 text-center mb-4 font-medium px-2">{error}</Text>
                ) : null}

                <Text className="font-bold text-black mb-2 ml-1 text-sm">Email</Text>
                <View className="bg-slate-50 rounded-2xl mb-6 border border-transparent">
                  <TextInput
                    className="px-4 py-4 text-black"
                    placeholder="your@email.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <Text className="font-bold text-black mb-2 ml-1 text-sm">New Password</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl mb-6 px-4 border border-transparent">
                  <TextInput
                    className="flex-1 py-4 text-black"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    <Feather name={showNew ? "eye" : "eye-off"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <Text className="font-bold text-black mb-2 ml-1 text-sm">Confirm Password</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl mb-8 px-4 border border-transparent">
                  <TextInput
                    className="flex-1 py-4 text-black"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Feather name={showConfirm ? "eye" : "eye-off"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSend}
                  disabled={loading}
                  className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200 mb-4"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Reset Password</Text>
                  )}
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
