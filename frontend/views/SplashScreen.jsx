import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Logo from '../components/Logo';

export default function SplashScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 justify-center items-center bg-slate-50">

      <View className="items-center mb-40">
        <Logo size={80} />
        <Text className="text-6xl font-bold text-[#7C3AED] mt-4">
          BidFlow
        </Text>
      </View>

      <View className="absolute bottom-0 w-full items-center px-12 pb-16">
        <View className="w-full h-[1px] bg-slate-100 mb-6" />
        <Text className="text-sm font-light text-slate-400 uppercase tracking-widest mb-3">
          ESTABLISHING CONNECTION
        </Text>
        <Text className="text-xs font-light text-slate-400">
          v1.0.42
        </Text>
      </View>

    </View>
  );
}
