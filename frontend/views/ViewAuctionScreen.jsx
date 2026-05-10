import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Footer from '../components/Footer';

// Importamos la data
import catalogsData from '../data/catalogs.json';
import itemsData from '../data/items.json';

export default function ViewAuctionScreen({ route, navigation }) {
  // Simulamos recibir el ID (por ejemplo, c1 que está LIVE)
  const catalogId = route?.params?.catalogId || 'c1';
  const catalog = catalogsData.find(c => c.id === catalogId);
  
  // Filtramos los items de esta subasta
  const catalogItems = itemsData.filter(item => catalog.items.includes(item.id));

  // Calculamos las ganancias potenciales sumando el currentBid de cada item
  const potentialEarnings = catalogItems.reduce((sum, item) => sum + (item.currentBid || 0), 0);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Auctions</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* --- HERO IMAGE CON BADGE LIVE --- */}
        <View className="mb-4 relative">
          <Image 
            source={{ uri: catalog.image }} 
            className="w-full h-48 rounded-3xl bg-slate-200" 
            resizeMode="cover"
          />
          <View className="absolute top-4 left-4 bg-purple-300/90 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md">
            <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">LIVE</Text>
          </View>
        </View>

        {/* --- POTENTIAL EARNINGS CARD --- */}
        <View className="bg-[#a78bfa] rounded-3xl p-6 mb-4 shadow-md shadow-purple-200">
          <Text className="text-purple-100 text-[10px] font-bold tracking-widest uppercase mb-1">
            Potential Earnings
          </Text>
          <Text className="text-white text-4xl font-bold tracking-tight">
            ${potentialEarnings.toLocaleString('en-US', {minimumFractionDigits: 0})}
          </Text>
        </View>

        {/* --- TIMER --- */}
        <View className="flex-row items-center mb-6 px-1">
          <Feather name="clock" size={20} color="#7C3AED" />
          <Text className="text-[#7C3AED] font-bold text-lg ml-2">{catalog.endDate}</Text>
        </View>

        {/* --- CATALOG OBJECTS (SOLO LECTURA) --- */}
        <Text className="text-xl font-bold text-slate-800 mb-4 px-1">Catalog Objects</Text>

        <View className="mb-10">
                {catalogItems.length > 0 ? catalogItems.map((item) => (
                    <TouchableOpacity 
                    key={item.id} 
                    // --- ACÁ AGREGAMOS LA NAVEGACIÓN ---
                    onPress={() => navigation.navigate('ManageObject', { itemId: item.id })}
                    // ------------------------------------
                    className="bg-white rounded-3xl p-3 mb-4 shadow-sm shadow-slate-200 flex-row items-center"
                    >
                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-2xl bg-slate-100" />
              <View className="flex-1 ml-4">
                <Text className="text-[#7C3AED] text-[9px] font-bold tracking-widest uppercase mb-0.5">
                  {item.pieceNumber}
                </Text>
                <Text className="font-bold text-slate-800 text-sm mb-1">{item.title}</Text>
                <View className="flex-row items-center">
                  <Text className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">Base Price</Text>
                  <Text className="text-[#7C3AED] font-bold text-xs">
                    ${item.currentBid.toLocaleString('en-US')}
                  </Text>
                </View>
              </View>
              {/* En vez del tacho de basura, ponemos una flechita */}
              <View className="p-3">
                <Feather name="chevron-right" size={20} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          )) : (
            <Text className="text-slate-400 text-center mt-4">No items in this catalog yet.</Text>
          )}
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}