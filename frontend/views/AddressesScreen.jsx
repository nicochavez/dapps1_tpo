import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Importamos los datos
import addressesData from '../data/addresses.json';

export default function AddressesScreen({ navigation }) {
  // Simulamos las direcciones del usuario logueado
  const userAddresses = addressesData.filter(a => a.userId === 'u1');
  
  // Estado para el checkbox de la nueva dirección
  const [isDefaultChecked, setIsDefaultChecked] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#7C3AED]">Addresses</Text>
        <View className="w-8" /> {/* Espaciador para centrar el título */}
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* --- SAVED LOCATIONS (GET & DELETE) --- */}
        <Text className="text-2xl font-bold text-slate-800 mb-6 mt-2">Saved Locations</Text>
        
        <View className="mb-10">
          {userAddresses.map((address) => (
            <View 
              key={address.id} 
              className={`bg-white rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 border-2 ${
                address.isDefault ? 'border-purple-200' : 'border-transparent'
              }`}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                  <Feather name={address.label === 'Home' ? "home" : "briefcase"} size={18} color="#7C3AED" />
                  <Text className="font-bold text-slate-800 text-base ml-2 mr-3">{address.label}</Text>
                  {address.isDefault && (
                    <View className="bg-purple-100 px-2 py-0.5 rounded-md">
                      <Text className="text-[#7C3AED] text-[9px] font-bold tracking-wider uppercase">Default</Text>
                    </View>
                  )}
                </View>

                {/* Botonera de acciones (PUT & DELETE) */}
                <View className="flex-row space-x-4">
                  <TouchableOpacity onPress={() => navigation.navigate('EditAddress', { addressId: address.id })}>
                    <Feather name="edit-2" size={16} color="#64748b" />
                  </TouchableOpacity>
                  {!address.isDefault && (
                    <TouchableOpacity onPress={() => console.log('Borrando...', address.id)}>
                      <Feather name="trash-2" size={16} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text className="text-slate-500 text-sm leading-5">
                {address.street}{'\n'}
                {address.city}, {address.zipCode}{'\n'}
                {address.country}
              </Text>
            </View>
          ))}
        </View>

        {/* --- ADD NEW ADDRESS (POST) --- */}
        <Text className="text-xl font-bold text-slate-800 mb-6">Add New Address</Text>

        <View className="mb-10">
          <Text className="font-bold text-xs text-slate-500 mb-2">Full Name</Text>
          <TextInput className="bg-slate-100 rounded-xl px-4 py-3 text-black mb-4" placeholder="name" placeholderTextColor="#94a3b8" />

          <Text className="font-bold text-xs text-slate-500 mb-2">Street Address</Text>
          <TextInput className="bg-slate-100 rounded-xl px-4 py-3 text-black mb-4" placeholder="street 1234" placeholderTextColor="#94a3b8" />

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-bold text-xs text-slate-500 mb-2">City</Text>
              <TextInput className="bg-slate-100 rounded-xl px-4 py-3 text-black" placeholder="Buenos Aires" placeholderTextColor="#94a3b8" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-bold text-xs text-slate-500 mb-2">ZIP Code</Text>
              <TextInput className="bg-slate-100 rounded-xl px-4 py-3 text-black" placeholder="0000" placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <Text className="font-bold text-xs text-slate-500 mb-2">Country</Text>
          <View className="bg-slate-100 rounded-xl px-4 py-3 mb-6 flex-row justify-between items-center">
            <Text className="text-black">Argentina</Text>
            <Feather name="chevron-down" size={20} color="#94a3b8" />
          </View>

          {/* Checkbox Default */}
          <TouchableOpacity 
            className="flex-row items-center mb-8" 
            onPress={() => setIsDefaultChecked(!isDefaultChecked)}
          >
            <View className={`w-5 h-5 rounded border ${isDefaultChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
              {isDefaultChecked && <Feather name="check" size={14} color="white" />}
            </View>
            <Text className="font-medium text-slate-600 text-sm">
              Set as default shipping address
            </Text>
          </TouchableOpacity>

          {/* Botones */}
          <View className="flex-row space-x-4 mb-8">
            <TouchableOpacity className="bg-slate-200 rounded-2xl py-4 flex-1 items-center">
              <Text className="text-slate-600 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#a78bfa] rounded-2xl py-4 flex-1 items-center shadow-sm shadow-purple-200">
              <Text className="text-white font-bold text-sm">Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}