import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header() {
  const navigation = useNavigation();
  return (
    <View className="flex-row justify-between items-center px-6 pb-4 pt-12 bg-[#f8fafc]">
      {/* Logo y Título */}
      <View className="flex-row items-center">
        <Image source={require('../assets/logo.png')} className="w-6 h-6" />
        <Text className="text-xl font-bold text-[#7C3AED] ml-2">BidFlow</Text>
      </View>

      {/* Campanita de Notificaciones */}
      <TouchableOpacity className="bg-purple-100 p-2 rounded-full relative" onPress={() => navigation.navigate('Notifications')}>
        <Feather name="bell" size={20} color="#7C3AED" />
        {/* Puntito rojo de notificación */}
        <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-purple-100" />
      </TouchableOpacity>
    </View>
  );
}