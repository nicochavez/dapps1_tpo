import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header1 from '../components/Header1';
import { registerRequest } from '../services/api';

export default function RegisterStep2({ route, navigation }) {
  const { step1Data } = route.params || {};

  const [selectedImages, setSelectedImages] = useState({});
  const [idCardNumber, setIdCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async (imageKey) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => ({
        ...prev,
        [imageKey]: result.assets[0],
      }));
    }
  };

  const handleRegister = async () => {
    if (!idCardNumber) {
      alert('Please enter your Id Card Number.');
      return;
    }
    if (!selectedImages['id-front'] || !selectedImages['id-back']) {
      alert('Please upload both front and back photos of your ID.');
      return;
    }

    setLoading(true);
    try {
      await registerRequest({
        nombre: step1Data.firstName,
        apellido: step1Data.lastName,
        email: step1Data.email,
        documento: idCardNumber,
        calle: step1Data.streetAddress,
        numeroCalle: step1Data.streetNumber || '0',
        ciudad: step1Data.city,
        codigoPostal: step1Data.zipCode,
        numeroPais: 32,
        dniFrente: selectedImages['id-front'],
        dniDorso: selectedImages['id-back'],
      });
      navigation.navigate('RegisterPending');
    } catch (error) {
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const imageUri = (key) => selectedImages[key]?.uri;

  return (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 bg-slate-50">
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-12" showsVerticalScrollIndicator={false}>
        <Header1 navigation={navigation} />

        {/* Stepper */}
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
        </View>

        <Text className="font-bold text-black mb-2 text-sm">Id Card Number</Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 mb-6"
          placeholder="Enter your Id Card Number"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={idCardNumber}
          onChangeText={setIdCardNumber}
        />

        <Text className="font-bold text-black mb-2 text-sm">ID Card Front</Text>
        <TouchableOpacity
          onPress={() => pickImage('id-front')}
          className="border-2 border-dashed border-[#d8b4fe] bg-purple-50 rounded-2xl p-8 items-center mb-6 overflow-hidden"
        >
          {imageUri('id-front') ? (
            <Image source={{ uri: imageUri('id-front') }} className="w-full h-40 rounded-xl" resizeMode="cover" />
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
          {imageUri('id-back') ? (
            <Image source={{ uri: imageUri('id-back') }} className="w-full h-40 rounded-xl" resizeMode="cover" />
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
