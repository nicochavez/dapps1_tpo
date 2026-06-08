import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LostConnectionScreen({ navigation }) {
  const [checking, setChecking] = useState(false);

  async function handleRetry() {
    setChecking(true);
    const state = await NetInfo.fetch();
    setChecking(false);
    if (state.isConnected) {
      navigation.goBack();
    }
  }

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center mb-8">
        <MaterialCommunityIcons name="wifi-off" size={52} color="#94a3b8" />
      </View>

      <Text className="text-2xl font-bold text-slate-800 mb-3 text-center">
        Sin conexión a internet
      </Text>
      <Text className="text-sm text-slate-400 text-center leading-6 mb-10">
        Revisá tu Wi-Fi o datos móviles y volvé a intentarlo.
      </Text>

      <TouchableOpacity
        onPress={handleRetry}
        disabled={checking}
        className="bg-[#a78bfa] rounded-full py-4 px-12 items-center"
        style={{ opacity: checking ? 0.6 : 1 }}
      >
        <Text className="text-white font-bold text-base">
          {checking ? 'Verificando...' : 'Reintentar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
