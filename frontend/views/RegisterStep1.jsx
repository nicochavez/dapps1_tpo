import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';

export default function RegisterStep1({ navigation }) {
  return (
    <KeyboardAvoidingView 
      // En Android 'padding' suele ser más estable para evitar saltos bruscos
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Cabecera con logo y título */}
        <Header1 navigation={navigation} />
        {/* Stepper */}
        <View className="flex-row items-center justify-between mb-8 px-2">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-1">
              <Text className="text-white font-bold">1</Text>
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Details</Text>
          </View>
          <View className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-1">
              <Text className="text-slate-500 font-bold">2</Text>
            </View>
            <Text className="text-xs text-slate-400">Photos</Text>
          </View>
          <View className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-1">
              <Text className="text-slate-500 font-bold">3</Text>
            </View>
            <Text className="text-xs text-slate-400">Settings</Text>
          </View>
        </View>

        {/* Formulario */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-black mb-2 text-sm">First Name</Text>
            <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" placeholder="e.g. Alex" placeholderTextColor="#94a3b8" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">Last Name</Text>
            <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" placeholder="e.g. Rivers" placeholderTextColor="#94a3b8" />
          </View>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">Email</Text>
        <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-6" placeholder="email" placeholderTextColor="#94a3b8" keyboardType="email-address" />

        <Text className="font-bold text-black mb-4 text-base">Add Address</Text>
        
        <Text className="font-bold text-black mb-2 text-sm">Full Name</Text>
        <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" placeholder="name" placeholderTextColor="#94a3b8" />

        <Text className="font-bold text-black mb-2 text-sm">Street Address</Text>
        <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" placeholder="street 1234" placeholderTextColor="#94a3b8" />

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-black mb-2 text-sm">City</Text>
            <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" placeholder="Buenos Aires" placeholderTextColor="#94a3b8" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">ZIP Code</Text>
            <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" placeholder="0000" placeholderTextColor="#94a3b8" />
          </View>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">Country</Text>
        <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-8 flex-row justify-between items-center">
          <Text className="text-black">Argentina</Text>
          <Feather name="chevron-down" size={20} color="#94a3b8" />
        </View>

        {/* Footer y Botón */}
        <Text className="text-center text-xs text-slate-400 mb-4 px-4">
          By continuing, you agree to our <Text className="text-[#7C3AED]">Terms of Service</Text> and <Text className="text-[#7C3AED]">Privacy Policy</Text>.
        </Text>
        
        <TouchableOpacity 
          className="bg-[#7C3AED] rounded-2xl py-4 items-center flex-row justify-center mb-6"
          onPress={() => navigation.navigate('RegisterStep2')}
        >
          <Text className="text-white font-bold text-lg mr-2">Continue</Text>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>

        <View className="flex-row justify-center mb-10">
          <Text className="text-slate-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[#7C3AED] font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}