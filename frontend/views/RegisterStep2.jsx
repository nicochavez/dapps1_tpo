import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header1 from '../components/Header1';

export default function RegisterStep2({ route, navigation }) {
  // Recibimos los datos del Paso 1
  const { step1Data } = route.params || {};

  const [selectedImages, setSelectedImages] = useState({});
  const [idCardNumber, setIdCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async (imageKey) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => ({
        ...prev,
        [imageKey]: result.assets[0].uri,
      }));
    }
  };

  const handleRegister = async () => {
    // 1. Validamos que el DNI no esté vacío
    if (!idCardNumber) {
      alert('Please enter your Id Card Number.');
      return;
    }
    
    // 2. Validamos que ambas fotos estén cargadas
    if (!selectedImages['id-front'] || !selectedImages['id-back']) {
      alert('Please upload both front and back photos of your ID.');
      return;
    }

    setLoading(true);
    try {
      /* ========================================================
        CÓDIGO PARA EL BACKEND (Descomentar y ajustar la URL)
        ========================================================
        const response = await fetch('http://TU_IP_O_DOMINIO/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...step1Data,          
            dni: idCardNumber,     
            verificado: false      
          })
        });

        if (!response.ok) throw new Error('Error creating user');
        const userData = await response.json();
        const userId = userData.id;
      */

      // SIMULACIÓN TEMPORAL (Borrar cuando conecten el backend real)
      const userId = "demo-user-id-123"; 

      // Avanzamos al Paso Pendiente pasando el ID del usuario Y los datos del Step1
      // para que RegisterPending pueda usarlos al llamar a login() (email real, etc.)
      navigation.navigate('RegisterPending', { userId, step1Data });

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 bg-slate-50">
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-12" showsVerticalScrollIndicator={false}>
        {/* Cabecera con logo y título */}
        <Header1 navigation={navigation} />

        {/* Stepper (Paso 2 activo) */}
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
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-xs text-[#7C3AED] font-medium">Photos</Text>
          </View>
          <View className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-1">
              <Text className="text-slate-500 font-bold">3</Text>
            </View>
            <Text className="text-xs text-slate-400">Settings</Text>
          </View>
        </View>

        {/* --- CAMPO DNI --- */}
        <Text className="font-bold text-black mb-2 text-sm">Id Card Number</Text>
        <TextInput 
          className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 mb-6"
          placeholder="Enter your Id Card Number"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={idCardNumber}
          onChangeText={setIdCardNumber}
        />

        {/* Uploaders */}
        <Text className="font-bold text-black mb-2 text-sm">ID Card Front</Text>
        <TouchableOpacity
          onPress={() => pickImage('id-front')}
          className="border-2 border-dashed border-[#d8b4fe] bg-purple-50 rounded-2xl p-8 items-center mb-6 overflow-hidden"
        >
          {selectedImages['id-front'] ? (
            <Image source={{ uri: selectedImages['id-front'] }} className="w-full h-40 rounded-xl" resizeMode="cover" />
          ) : (
            <>
              <View className="bg-white p-3 rounded-full shadow-sm mb-3">
                <Feather name="camera" size={24} color="#7C3AED" />
              </View>
              <Text className="text-[#7C3AED] font-bold mb-1">Tap to choose from library</Text>
              <Text className="text-slate-400 text-xs">PNG, JPG up to 10MB</Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="font-bold text-black mb-2 text-sm">ID Card Back</Text>
        <TouchableOpacity
          onPress={() => pickImage('id-back')}
          className="border-2 border-dashed border-[#d8b4fe] bg-purple-50 rounded-2xl p-8 items-center mb-6 overflow-hidden"
        >
          {selectedImages['id-back'] ? (
            <Image source={{ uri: selectedImages['id-back'] }} className="w-full h-40 rounded-xl" resizeMode="cover" />
          ) : (
            <>
              <View className="bg-white p-3 rounded-full shadow-sm mb-3">
                <Feather name="upload" size={24} color="#7C3AED" />
              </View>
              <Text className="text-[#7C3AED] font-bold mb-1">Tap to choose from library</Text>
              <Text className="text-slate-400 text-xs">PNG, JPG up to 10MB</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View className="bg-slate-50 rounded-xl p-4 flex-row mb-8">
          <Feather name="info" size={16} color="#7C3AED" className="mt-1 mr-2" />
          <Text className="text-slate-500 text-xs flex-1 leading-5">
            Your data is encrypted and processed by an external secure verification provider. BidFlow does not store your raw ID images on our primary servers. Verification usually takes 2-5 minutes.
          </Text>
        </View>

        <TouchableOpacity 
          className="bg-[#7C3AED] rounded-2xl py-4 items-center flex-row justify-center mb-6"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Continue</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  </KeyboardAvoidingView>
  );
}