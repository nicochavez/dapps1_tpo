import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CheckForm() {
  return (
    <View>
      <View className="bg-slate-50 rounded-3xl p-5 mb-8 flex-row items-start border border-slate-100">
        <View className="bg-white p-2 rounded-lg mr-3 shadow-sm shadow-slate-200">
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#64748b" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-lg mb-1">Check Verification</Text>
          <Text className="text-xs text-slate-500 leading-5">
            Certified checks must be delivered and verified <Text className="text-[#7C3AED] font-bold">BEFORE</Text> the auction starts. Enter the check details below to start the verification process.
          </Text>
        </View>
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Amount (USD)</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
        <Text className="text-slate-400 mr-2">$</Text>
        <TextInput className="flex-1 text-black" placeholder="0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" />
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Issuing Bank</Text>
      <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" placeholder="e.g. Chase National Bank" placeholderTextColor="#94a3b8" />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Check Number</Text>
      <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-6" placeholder="10-digit check number" placeholderTextColor="#94a3b8" keyboardType="numeric" />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Upload Image of Certified Check</Text>
      <TouchableOpacity className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 items-center mb-8">
        <View className="bg-purple-100 p-3 rounded-full mb-3">
          <Feather name="upload-cloud" size={24} color="#7C3AED" />
        </View>
        <Text className="text-slate-800 font-bold mb-1">Drag or click to upload</Text>
        <Text className="text-slate-400 text-xs">PDF, JPG, PNG (Max 5MB)</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-[#a78bfa] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200 mb-6">
        <Text className="text-white font-bold text-sm">Submit Check for Verification</Text>
      </TouchableOpacity>
      
      <Text className="text-[10px] text-center text-slate-400 leading-4 px-4">
        By submitting, you agree to our verification protocols and understand that funds will be locked upon successful check validation.
      </Text>
    </View>
  );
}