import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BankForm() {
  const [showAccount, setShowAccount] = useState(false);

  return (
    <View className="border border-purple-200 rounded-3xl p-5 mb-8 border-dashed">
      
      <View className="flex-row items-center mb-6">
        <View className="bg-purple-100 p-2 rounded-lg mr-3">
          <Feather name="shield" size={20} color="#7C3AED" />
        </View>
        <View>
          <Text className="font-bold text-slate-800 text-lg">Bank Details</Text>
          <Text className="text-xs text-slate-400">Verify your account for secure transactions</Text>
        </View>
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Bank Name</Text>
      <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" placeholder="e.g. Chase National Bank" placeholderTextColor="#94a3b8" />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Account Number</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between">
        <TextInput 
          className="flex-1 text-black" 
          placeholder="1234567890" 
          placeholderTextColor="#94a3b8" 
          keyboardType="numeric"
          secureTextEntry={!showAccount}
        />
        <TouchableOpacity onPress={() => setShowAccount(!showAccount)}>
          <Feather name={showAccount ? "eye" : "eye-off"} size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 mr-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">SWIFT/BIC</Text>
          <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black uppercase" placeholder="CHASUS33" placeholderTextColor="#94a3b8" />
        </View>
        <View className="flex-1 ml-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Country</Text>
          <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <Text className="text-black">United States</Text>
            <Feather name="chevron-down" size={16} color="#94a3b8" />
          </View>
        </View>
      </View>

      <View className="bg-purple-50 rounded-xl p-4 flex-row mb-8">
        <Feather name="info" size={16} color="#7C3AED" className="mt-1 mr-2" />
        <Text className="text-[#7C3AED] text-xs flex-1 font-medium leading-5">
          Note: Reserved funds for bidding may apply. Verification might take up to 24-48 hours depending on your bank's protocol.
        </Text>
      </View>

      <TouchableOpacity className="bg-[#a78bfa] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200">
        <Text className="text-white font-bold text-sm">Save Bank Account</Text>
      </TouchableOpacity>
    </View>
  );
}