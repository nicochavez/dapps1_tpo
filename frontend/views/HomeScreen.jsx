import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ImageBackground, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

// 1. Importamos los datos falsos
import catalogsData from '../data/catalogs.json';
import itemsData from '../data/items.json';

export default function HomeScreen({ navigation }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 bg-slate-50">
      <View className="flex-1 bg-[#f8fafc]">
        <Header />

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          
          {/* --- TÍTULO Y BUSCADOR --- */}
          <Text className="text-3xl font-bold text-slate-800 mb-6 mt-2">
            Discover Masterpieces
          </Text>
          
          <View className="flex-row items-center bg-slate-200/60 rounded-2xl px-4 py-4 mb-8">
            <Feather name="search" size={20} color="#64748b" />
            <TextInput 
              className="flex-1 ml-3 text-slate-800"
              placeholder="Search luxury items, artists..."
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* --- CATÁLOGOS DESTACADOS --- */}
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-bold text-slate-800">Featured Catalogs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreCatalogs')} className="bg-purple-50 px-3 py-1 rounded-full">
              <Text className="text-sm font-bold text-slate-800">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
            {/* 2. Mapeamos los catálogos */}
            {catalogsData.map((catalog) => (
              <ImageBackground 
                key={catalog.id} // Siempre es necesario un key único al usar map()
                source={{ uri: catalog.image }}
                className="w-72 h-48 rounded-3xl overflow-hidden justify-end mr-4"
                imageStyle={{ borderRadius: 24 }}
              >
                <View className="absolute inset-0 bg-black/30" />
                <View className="p-4 flex-row justify-between items-end">
                  <Text className="text-white font-bold text-lg w-2/3 shadow-md">{catalog.title}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('CatalogItems', { catalogId: catalog.id })} className="bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <Text className="text-white font-bold text-xs">Enter</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            ))}
          </ScrollView>

          {/* --- TRENDING ITEMS --- */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Trending Items</Text>
            <TouchableOpacity>
              <Feather name="sliders" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          {/* 3. Mapeamos los items */}
          <View className="mb-10">
            {itemsData.map((item) => (
              <View key={item.id} className="flex-row bg-white rounded-3xl p-3 mb-4 shadow-sm shadow-slate-200 items-center">
                <Image 
                  source={{ uri: item.image }} 
                  className="w-20 h-20 rounded-2xl bg-slate-100" 
                />
                <View className="flex-1 ml-4 justify-center">
                  <View className="flex-row items-center mb-1">
                    
                    {/* Renderizado condicional del tag 'Live' */}
                    {item.isLive && (
                      <View className="bg-red-100 px-1.5 py-0.5 rounded flex-row items-center mr-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
                        <Text className="text-[9px] text-red-600 font-bold uppercase">Live</Text>
                      </View>
                    )}
                    
                    <Text className="text-xs text-slate-400">{item.lotNumber}</Text>
                  </View>
                  
                  <Text className="font-bold text-slate-800 mb-1" numberOfLines={1}>{item.title}</Text>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-xs text-slate-400 mr-1">CURRENT BID:</Text>
                      <Text className="text-[#7C3AED] font-bold">
                        {/* Formateamos el número para que tenga la coma de los miles */}
                        ${item.currentBid.toLocaleString('en-US')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}className="bg-[#7C3AED] px-5 py-2 rounded-xl shadow-md shadow-purple-200">
                      <Text className="text-white font-bold text-xs">Bid</Text>
                    </TouchableOpacity>
                  </View>
 
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
        <Footer />
      </View>
    </KeyboardAvoidingView>
  );
}