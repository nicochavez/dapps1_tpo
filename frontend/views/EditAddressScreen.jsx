import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

import addressesData from '../data/addresses.json';

export default function EditAddressScreen({ route, navigation }) {
  // En un caso real recibimos el ID por route.params.addressId
  // Por ahora simulamos que siempre queremos editar la dirección "a1" (Home) si no viene nada
  const addressId = route?.params?.addressId || 'a1';
  const addressToEdit = addressesData.find(a => a.id === addressId);

  // Estados pre-cargados con los datos de la dirección
  const [isDefaultChecked, setIsDefaultChecked] = useState(addressToEdit?.isDefault || false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#7C3AED]">Edit Address</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-8 mt-2">
          <Text className="text-2xl font-bold text-slate-800 mb-2">Shipping Details</Text>
          <Text className="text-sm text-slate-500 leading-5">Update where you want your secured items delivered.</Text>
        </View>

        {/* --- FORMULARIO PRE-CARGADO (PUT) --- */}
        <View className="mb-10">
          <Text className="font-bold text-xs text-slate-800 mb-2">Full Name</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-4" 
            defaultValue={addressToEdit?.fullName}
          />

          <Text className="font-bold text-xs text-slate-800 mb-2">Street Address</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-4" 
            defaultValue={addressToEdit?.street}
          />

          <Text className="font-bold text-xs text-slate-800 mb-2">City</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-4" 
            defaultValue={addressToEdit?.city}
          />

          <Text className="font-bold text-xs text-slate-800 mb-2">ZIP Code</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-4" 
            defaultValue={addressToEdit?.zipCode}
          />

          <Text className="font-bold text-xs text-slate-800 mb-2">Country</Text>
          <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-6 flex-row justify-between items-center">
            <Text className="text-black">{addressToEdit?.country}</Text>
            <Feather name="chevron-down" size={20} color="#64748b" />
          </View>

          {/* Checkbox Default */}
          <TouchableOpacity 
            className="flex-row items-center mb-8" 
            onPress={() => setIsDefaultChecked(!isDefaultChecked)}
          >
            <View className={`w-5 h-5 rounded border ${isDefaultChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
              {isDefaultChecked && <Feather name="check" size={14} color="white" />}
            </View>
            <Text className="font-medium text-slate-800 text-sm">
              Set as default shipping address
            </Text>
          </TouchableOpacity>

          {/* Botones */}
          <View className="flex-row space-x-4 mb-10">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="bg-slate-200 rounded-2xl py-4 flex-1 items-center"
            >
              <Text className="text-slate-600 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#a78bfa] rounded-2xl py-4 flex-1 items-center shadow-sm shadow-purple-200">
              <Text className="text-white font-bold text-sm">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}