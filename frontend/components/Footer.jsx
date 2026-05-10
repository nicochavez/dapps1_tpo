import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// 1. Importamos MaterialCommunityIcons además de Feather
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const currentRoute = route.name;

  const getIconColor = (screenName) => currentRoute === screenName ? "#7C3AED" : "#94a3b8";
  
  const getTextStyle = (screenName) => currentRoute === screenName 
    ? "text-[#7C3AED] font-bold text-xs mt-1" 
    : "text-slate-400 text-[10px] mt-1";

  return (
    <View className="flex-row justify-between items-center bg-white px-6 pt-4 pb-8 border-t border-slate-100">
      
      {/* Tab Home */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} className="items-center w-1/5">
        <Feather name="home" size={24} color={getIconColor('Home')} />
        <Text className={getTextStyle('Home')}>Home</Text>
      </TouchableOpacity>

      {/* Tab Auctions*/}
      <TouchableOpacity onPress={() => navigation.navigate('MyAuctions')} className="items-center w-1/5">
        <MaterialCommunityIcons name="gavel" size={24} color={getIconColor('MyAuctions')} />
        <Text className={getTextStyle('MyAuctions')}>Auctions</Text>
      </TouchableOpacity>

      {/* Tab Sell */}
      <TouchableOpacity onPress={() => navigation.navigate('CreateAuction')} className="items-center w-1/5">
        <Feather name="plus-circle" size={24} color="#94a3b8" />
        <Text className="text-slate-400 text-[10px] mt-1">Sell</Text>
      </TouchableOpacity>

      {/* Tab Bids */}
      <TouchableOpacity onPress={() => navigation.navigate('Bids')} className="items-center w-1/5">
        <Feather name="tag" size={24} color={getIconColor('Bids')} />
        <Text className={getTextStyle('Bids')}>Bids</Text>
      </TouchableOpacity>

      {/* Tab Profile */}
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="items-center w-1/5">
        <Feather name="user" size={24} color={getIconColor('Profile')} />
        <Text className={getTextStyle('Profile')}>Profile</Text>
      </TouchableOpacity>
      
    </View>
  );
}