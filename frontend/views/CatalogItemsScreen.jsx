import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';

import LiveAuctionView from '../components/LiveAuctionView';
import UpcomingAuctionView from '../components/UpcomingAuctionView';
import EndedAuctionView from '../components/EndedAuctionView';

import catalogsData from '../data/catalogs.json';
import itemsData from '../data/items.json';

export default function CatalogItemsScreen({ route, navigation }) {
  const catalogId = route?.params?.catalogId || 'c1';
  
  const activeCatalog = catalogsData.find(c => c.id === catalogId);

  if (!activeCatalog) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <Text className="text-slate-500 font-bold">Catalog not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 p-2 bg-purple-100 rounded-lg">
          <Text className="text-[#7C3AED]">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catalogItems = itemsData
    .filter(item => item.catalogo === activeCatalog.id)
    .sort((left, right) => Number(left.numeroPieza ?? 0) - Number(right.numeroPieza ?? 0));
  
  const statusDb = activeCatalog.subasta?.estado || 'pendiente';
  const isLive = statusDb === 'abierta';
  const isEnded = statusDb === 'cerrada';
  const statusDisplay = isLive ? 'LIVE' : isEnded ? 'ENDED' : 'UPCOMING';

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        <View className="relative w-full h-64">
          <Image 
            source={{ uri: activeCatalog.image || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40" />
          
          <View className="absolute inset-0 p-6 justify-end">
            <View className="flex-row items-center justify-between mb-2">
              <View className={`px-3 py-1.5 rounded-full flex-row items-center ${isLive ? 'bg-red-500' : isEnded ? 'bg-slate-600' : 'bg-blue-500'}`}>
                {isLive && <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />}
                {!isLive && <Feather name={isEnded ? "flag" : "calendar"} size={12} color="white" className="mr-2" />}
                <Text className="text-white text-xs font-bold tracking-wider">{statusDisplay}</Text>
              </View>
              <Text className="text-white/80 text-sm font-medium">{activeCatalog.totalItems} Lots</Text>
            </View>
            <Text className="text-3xl font-extrabold text-white mb-1" numberOfLines={2}>
              {activeCatalog.descripcion}
            </Text>
            <Text className="text-white/90 text-sm capitalize" numberOfLines={2}>
              Categoría: {activeCatalog.subasta?.categoria} - {activeCatalog.subasta?.fecha} {activeCatalog.subasta?.hora}
            </Text>
          </View>
        </View>

        {isLive ? (
          <LiveAuctionView 
            activeCatalog={activeCatalog} 
            catalogItems={catalogItems} 
            navigation={navigation} 
          />
        ) : isEnded ? (
          <EndedAuctionView 
            activeCatalog={activeCatalog} 
            catalogItems={catalogItems} 
            navigation={navigation} 
          />
        ) : (
          <UpcomingAuctionView 
            activeCatalog={activeCatalog} 
            catalogItems={catalogItems} 
            navigation={navigation} 
          />
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}