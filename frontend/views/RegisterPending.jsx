import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';

export default function RegisterPending({ navigation }) {
  return (
    <View className="flex-1 bg-white px-6 pt-12 pb-10">
      {/* Cabecera con logo y título */}
      <Header1 navigation={navigation} />
      {/* Contenido Central */}
      <View className="flex-1 items-center justify-center">
        <View className="w-32 h-32 bg-purple-50 rounded-full items-center justify-center mb-6 relative">
          <Feather name="shield" size={48} color="#7C3AED" />
          <View className="absolute bottom-[-10px] bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            <Text className="text-[#7C3AED] text-[10px] font-bold uppercase tracking-wider">Processing</Text>
          </View>
        </View>
        
        <Text className="text-2xl font-bold text-black mb-3">Verification Pending</Text>
        <Text className="text-slate-500 text-center px-4 leading-6">
          We are currently processing your verification. You will receive an email shortly with instructions to complete your registration.
        </Text>
      </View>

      {/* Footer */}
      <TouchableOpacity 
        className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center mb-4"
        onPress={() => navigation.navigate('RegisterStep3')}
      >
        <Text className="text-white font-bold text-lg">Got it, thanks!</Text>
      </TouchableOpacity>
      <Text className="text-slate-400 text-center text-xs px-6">
        You can still browse auctions while we verify your account, but bidding will be restricted.
      </Text>
    </View>
  );
}