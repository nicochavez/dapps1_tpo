import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';

export default function RegisterStep3({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Cabecera con logo y título */}
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
        <Text className="text-slate-500 mb-8">Complete these final details to start bidding on exclusive items.</Text>

        {/* Contraseña */}
        <Text className="font-bold text-black mb-2 text-sm">Set Your Personal Password</Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 mb-2">
          <TextInput 
            className="flex-1 py-4 text-black"
            placeholder="At least 8 characters"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-slate-400 mb-8">
          Strength: <Text className="text-green-500 font-bold">Strong</Text>. Use symbols and numbers for extra security.
        </Text>

        {/* Métodos de Pago */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-bold text-black text-sm">Add Payment Method</Text>
          <View className="bg-orange-100 px-2 py-1 rounded">
            <Text className="text-orange-600 text-[10px] font-bold">MANDATORY TO BID</Text>
          </View>
        </View>

        <TouchableOpacity className="border border-slate-200 rounded-xl p-4 flex-row items-center mb-3">
          <View className="bg-slate-100 p-2 rounded-lg mr-4">
            <Feather name="credit-card" size={20} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-black">Credit or Debit Card</Text>
            <Text className="text-xs text-slate-400">Visa, Mastercard, AMEX</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity className="border border-slate-200 rounded-xl p-4 flex-row items-center mb-6">
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
            Your payment method is only used for verification and to guarantee bids. You will not be charged unless you win an auction.
          </Text>
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity 
          className="flex-row items-start mb-8" 
          onPress={() => setIsChecked(!isChecked)}
        >
          <View className={`w-5 h-5 rounded border ${isChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3 mt-0.5`}>
            {isChecked && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-slate-500 text-xs flex-1">
            I agree to the <Text className="text-[#7C3AED]">Terms of Service</Text> and confirm I am over 18 years of age.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`${isChecked ? 'bg-[#7C3AED]' : 'bg-slate-300'} rounded-2xl py-4 items-center justify-center mb-10`}
          disabled={!isChecked}
          onPress={() => navigation.navigate('Inicio')}
        >
          <Text className="text-white font-bold text-lg">Complete Registration</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}