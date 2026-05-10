import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import itemsData from '../data/items.json';

export default function ManageObjectScreen({ route, navigation }) {
  // Recibimos el ID del ítem, por defecto usamos el Patek Philippe (i7)
  const itemId = route?.params?.itemId || 'i7';
  const item = itemsData.find(i => i.id === itemId) || itemsData[0];

  const [activeImage, setActiveImage] = useState(item.image);
  const photos = item.gallery ? [item.image, ...item.gallery] : [item.image, item.image, item.image];

  // Simulamos datos en tiempo real (En la vida real vendrían de un endpoint o WebSockets)
  const liveStats = {
    views: "1,248",
    bids: "42",
    watchers: "86"
  };

  const bidHistory = [
    { id: 1, name: 'Marc Chen', time: '2 minutes ago', amount: 4250, avatar: 'https://ui-avatars.com/api/?name=Marc+Chen&background=1e293b&color=fff' },
    { id: 2, name: 'Sarah Williams', time: '15 minutes ago', amount: 4180, avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=0f172a&color=fff' },
    { id: 3, name: 'David Miller', time: '42 minutes ago', amount: 4000, avatar: 'https://ui-avatars.com/api/?name=David+Miller&background=334155&color=fff' },
  ];

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">Manage Object</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        
        {/* --- GALERÍA CON BADGE LIVE --- */}
        <View className="mb-4">
          <View className="relative mb-3">
            <Image 
              source={{ uri: activeImage }} 
              className="w-full h-56 rounded-3xl bg-slate-200" 
              resizeMode="cover"
            />
            {/* Live Badge */}
            <View className="absolute top-4 left-4 bg-rose-600/90 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md">
              <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">LIVE</Text>
            </View>
          </View>

          {/* Miniaturas */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {photos.slice(0, 3).map((img, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setActiveImage(img)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 mr-3 ${activeImage === img ? 'border-[#7C3AED]' : 'border-transparent'}`}
              >
                <Image source={{ uri: img }} className="w-full h-full bg-slate-200" resizeMode="cover" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="w-14 h-14 rounded-xl bg-slate-200 items-center justify-center border border-slate-300">
              <Feather name="image" size={14} color="#64748b" className="mb-1" />
              <Text className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">ADD</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* --- INFO DEL PRODUCTO --- */}
        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm shadow-slate-200">
          <Text className="text-xl font-bold text-slate-800 mb-1">{item.title}</Text>
          <Text className="text-xs text-slate-500 mb-6">{item.description || 'Excellent condition, original strap included.'}</Text>

          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-widest mb-1">Highest Bid</Text>
              <Text className="text-3xl font-bold text-[#7C3AED]">
                ${(item.currentBid || 4500).toLocaleString('en-US', {minimumFractionDigits: 2})}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Time Remaining</Text>
              <View className="flex-row items-center">
                <Feather name="clock" size={14} color="#7C3AED" />
                <Text className="text-slate-700 font-medium text-sm ml-1.5">{item.timeLeft || '04h 22m 15s'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- ESTADÍSTICAS EN VIVO --- */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white rounded-3xl p-4 items-center justify-center flex-1 mr-2 shadow-sm shadow-slate-200">
            <Feather name="eye" size={20} color="#a78bfa" className="mb-2" />
            <Text className="text-lg font-bold text-slate-800">{liveStats.views}</Text>
            <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Views</Text>
          </View>
          
          <View className="bg-white rounded-3xl p-4 items-center justify-center flex-1 mx-1 shadow-sm shadow-slate-200">
            <MaterialCommunityIcons name="gavel" size={20} color="#a78bfa" className="mb-2" />
            <Text className="text-lg font-bold text-slate-800">{liveStats.bids}</Text>
            <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bids</Text>
          </View>

          <View className="bg-white rounded-3xl p-4 items-center justify-center flex-1 ml-2 shadow-sm shadow-slate-200">
            <Feather name="star" size={20} color="#a78bfa" className="mb-2" />
            <Text className="text-lg font-bold text-slate-800">{liveStats.watchers}</Text>
            <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Watchers</Text>
          </View>
        </View>

        {/* --- HISTORIAL DE PUJAS --- */}
        <Text className="text-lg font-bold text-slate-800 mb-4">Bidding History</Text>
        <View className="bg-white rounded-3xl p-2 mb-10 shadow-sm shadow-slate-200">
          {bidHistory.map((bid, index) => (
            <View key={bid.id} className={`flex-row items-center p-4 ${index !== bidHistory.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <Image source={{ uri: bid.avatar }} className="w-10 h-10 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="font-bold text-slate-800 text-sm mb-0.5">{bid.name}</Text>
                <Text className="text-[10px] text-slate-400">{bid.time}</Text>
              </View>
              <Text className="font-bold text-[#7C3AED]">
                ${bid.amount.toLocaleString('en-US')}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}