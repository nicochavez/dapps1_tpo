import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';

const COUNTRIES = [
  { label: 'Argentina',  numeroPais: 32  },
  { label: 'Brasil',     numeroPais: 76  },
  { label: 'Chile',      numeroPais: 152 },
  { label: 'Uruguay',    numeroPais: 858 },
  { label: 'España',     numeroPais: 724 },
  { label: 'México',     numeroPais: 484 },
];

export default function RegisterStep1({ navigation }) {
  // 1. Agregamos el estado para guardar todos los datos del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    addressFullName: '',
    streetAddress: '',
    streetNumber: '',
    city: '',
    zipCode: '',
    country: 'Argentina',
    numeroPais: 32,
  });
  const [countryOpen, setCountryOpen] = useState(false);

  // 2. Función para validar y pasar al Paso 2
  const handleNext = () => {
    // Validamos que los campos principales no estén vacíos
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.streetAddress || !formData.streetNumber || !formData.city) {
      alert('Por favor completa todos los campos para continuar.');
      return;
    }

    // Navegamos al Paso 2 enviando los datos en los parámetros
    navigation.navigate('RegisterStep2', { step1Data: formData });
  };

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
        </View>

        {/* Formulario */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-black mb-2 text-sm">First Name</Text>
            <TextInput 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" 
              placeholder="e.g. Alex" 
              placeholderTextColor="#94a3b8" 
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">Last Name</Text>
            <TextInput 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" 
              placeholder="e.g. Rivers" 
              placeholderTextColor="#94a3b8" 
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
            />
          </View>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">Email</Text>
        <TextInput 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-6" 
          placeholder="email" 
          placeholderTextColor="#94a3b8" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
        />

        <Text className="font-bold text-black mb-4 text-base">Add Address</Text>
        
        <Text className="font-bold text-black mb-2 text-sm">Full Name</Text>
        <TextInput 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4" 
          placeholder="name" 
          placeholderTextColor="#94a3b8" 
          value={formData.addressFullName}
          onChangeText={(text) => setFormData({...formData, addressFullName: text})}
        />

        <View className="flex-row justify-between mb-4">
          <View className="flex-[3] mr-2">
            <Text className="font-bold text-black mb-2 text-sm">Street Address</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black"
              placeholder="Av. Corrientes"
              placeholderTextColor="#94a3b8"
              value={formData.streetAddress}
              onChangeText={(text) => setFormData({...formData, streetAddress: text})}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">Number</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black"
              placeholder="1234"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={formData.streetNumber}
              onChangeText={(text) => setFormData({...formData, streetNumber: text})}
            />
          </View>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-black mb-2 text-sm">City</Text>
            <TextInput 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" 
              placeholder="Buenos Aires" 
              placeholderTextColor="#94a3b8" 
              value={formData.city}
              onChangeText={(text) => setFormData({...formData, city: text})}
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-bold text-black mb-2 text-sm">ZIP Code</Text>
            <TextInput 
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black" 
              placeholder="0000" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={formData.zipCode}
              onChangeText={(text) => setFormData({...formData, zipCode: text})}
            />
          </View>
        </View>

        <Text className="font-bold text-black mb-2 text-sm">Country</Text>
        <TouchableOpacity
          onPress={() => setCountryOpen(v => !v)}
          className={`bg-slate-50 border rounded-xl px-4 py-3 flex-row justify-between items-center ${countryOpen ? 'border-[#7C3AED]' : 'border-slate-200'} ${countryOpen ? '' : 'mb-8'}`}
        >
          <Text className="text-black">{formData.country}</Text>
          <Feather name={countryOpen ? 'chevron-up' : 'chevron-down'} size={20} color={countryOpen ? '#7C3AED' : '#94a3b8'} />
        </TouchableOpacity>
        {countryOpen && (
          <View className="bg-white border border-slate-200 rounded-xl mb-8 mt-1 overflow-hidden shadow-sm shadow-slate-200">
            {COUNTRIES.map((c, idx) => (
              <TouchableOpacity
                key={c.numeroPais}
                onPress={() => {
                  setFormData({ ...formData, country: c.label, numeroPais: c.numeroPais });
                  setCountryOpen(false);
                }}
                className={`px-4 py-3 flex-row justify-between items-center ${idx < COUNTRIES.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <Text className={`text-sm ${formData.numeroPais === c.numeroPais ? 'text-[#7C3AED] font-bold' : 'text-slate-700'}`}>
                  {c.label}
                </Text>
                {formData.numeroPais === c.numeroPais && (
                  <Feather name="check" size={16} color="#7C3AED" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer y Botón */}
        <Text className="text-center text-xs text-slate-400 mb-4 px-4">
          By continuing, you agree to our <Text className="text-[#7C3AED]">Terms of Service</Text> and <Text className="text-[#7C3AED]">Privacy Policy</Text>.
        </Text>
        
        <TouchableOpacity 
          className="bg-[#7C3AED] rounded-2xl py-4 items-center flex-row justify-center mb-6"
          onPress={handleNext} /* 3. Cambiamos el onPress para usar la validación */
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