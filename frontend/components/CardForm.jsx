import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CardForm() {
  return (
    <View>
      {/* Vista Previa de la Tarjeta */}
      <LinearGradient
        colors={['#8b5cf6', '#a855f7', '#d946ef']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6 mb-6 shadow-lg shadow-purple-300"
      >
        <View className="flex-row justify-between items-center mb-8">
          <MaterialCommunityIcons name="contactless-payment-circle-outline" size={28} color="white" />
          <Text className="text-white font-bold tracking-widest text-sm opacity-90">PREMIUM</Text>
        </View>
        <Text className="text-white text-xl font-medium tracking-[4px] mb-8 opacity-90">
          •••• •••• •••• ••••
        </Text>
        <View className="flex-row justify-between items-end">
          <View className="flex-row space-x-12">
            <View>
              <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">CARD HOLDER</Text>
              <Text className="text-white font-bold text-xs tracking-wider uppercase">YOUR NAME HERE</Text>
            </View>
            <View>
              <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
              <Text className="text-white font-bold text-xs tracking-wider">MM/YY</Text>
            </View>
          </View>
          <Feather name="credit-card" size={24} color="white" className="opacity-90" />
        </View>
      </LinearGradient>

      {/* Formulario */}
      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Cardholder Name</Text>
      <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" placeholder="Johnathan Doe" placeholderTextColor="#94a3b8" />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Card Number</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
        <Feather name="credit-card" size={18} color="#94a3b8" className="mr-2" />
        <TextInput className="flex-1 text-black" placeholder="0000 0000 0000 0000" placeholderTextColor="#94a3b8" keyboardType="numeric" />
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 mr-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Expiry Date</Text>
          <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black text-center" placeholder="MM/YY" placeholderTextColor="#94a3b8" />
        </View>
        <View className="flex-1 ml-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">CVV</Text>
          <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <TextInput className="flex-1 text-black text-center" placeholder="•••" placeholderTextColor="#94a3b8" secureTextEntry keyboardType="numeric" />
            <Feather name="help-circle" size={16} color="#94a3b8" />
          </View>
        </View>
      </View>

      {/* Separador Billing Address */}
      <View className="flex-row items-center justify-center mb-6">
        <View className="flex-1 h-[1px] bg-slate-200" />
        <Text className="text-[10px] text-slate-400 font-bold tracking-widest px-3 uppercase">Billing Address</Text>
        <View className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Street Address</Text>
      <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" placeholder="123 Gallery Street" placeholderTextColor="#94a3b8" />

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 mr-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">City</Text>
          <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" placeholder="New York" placeholderTextColor="#94a3b8" />
        </View>
        <View className="flex-1 ml-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Postal Code</Text>
          <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" placeholder="10001" placeholderTextColor="#94a3b8" />
        </View>
      </View>

      <View className="bg-purple-50 rounded-xl p-4 flex-row mb-8">
        <Feather name="shield" size={16} color="#7C3AED" className="mt-1 mr-2" />
        <Text className="text-slate-500 text-xs flex-1 leading-5">
          To ensure secure transactions, we may place a temporary small verification hold on your card. This amount will be automatically released within 24-48 hours. Your data is encrypted and managed under PCI-DSS compliance standards.
        </Text>
      </View>

      <TouchableOpacity className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200">
        <Text className="text-white font-bold text-sm">Add Card</Text>
      </TouchableOpacity>
    </View>
  );
}