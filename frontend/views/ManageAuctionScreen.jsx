import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Footer from '../components/Footer';

// Importamos la data para simular el GET /subastas/{id}
import catalogsData from '../data/catalogs.json';
import itemsData from '../data/items.json';

export default function ManageAuctionScreen({ route, navigation }) {
  // Simulamos recibir el ID de la subasta, por defecto la c1
  const catalogId = route?.params?.catalogId || 'c1';
  const catalog = catalogsData.find(c => c.id === catalogId);
  
  // Filtramos los items que pertenecen a esta subasta
  const catalogItems = itemsData.filter(item => catalog.items.includes(item.id));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER PERSONALIZADO CON BOTÓN ATRÁS */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Auctions</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* --- HERO IMAGE DEL CATÁLOGO --- */}
        <View className="px-6 mb-8">
          <View className="relative">
            <Image 
              source={{ uri: catalog.image }} 
              className="w-full h-52 rounded-3xl bg-slate-200" 
              resizeMode="cover"
            />
            {/* Botón para cambiar imagen */}
            <TouchableOpacity className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-full shadow-sm">
              <Feather name="camera" size={18} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- FORMULARIO DE EDICIÓN --- */}
        <View className="px-6 mb-8">
          <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Auction Title</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 font-medium mb-5 border border-slate-100" 
            defaultValue={catalog.title}
          />

          <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Category</Text>
          <View className="bg-slate-200/60 rounded-2xl px-5 py-4 mb-5 flex-row justify-between items-center border border-slate-100">
            <Text className="text-slate-800 font-medium">Luxury Watches</Text>
            <Feather name="chevron-down" size={20} color="#94a3b8" />
          </View>

          <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Description</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 font-medium border border-slate-100" 
            defaultValue={catalog.description}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* --- AUCTION SCHEDULE --- */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-[32px] p-6 shadow-sm shadow-slate-200">
            <View className="flex-row items-center mb-6">
              <View className="bg-purple-50 p-2 rounded-xl mr-3">
                <Feather name="calendar" size={20} color="#7C3AED" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Auction Schedule</Text>
            </View>

            <View className="flex-row justify-between mb-5">
              <View className="flex-1 mr-3">
                <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Start Date</Text>
                <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-bold" defaultValue="11/02/2024" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Start Time</Text>
                <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-bold" defaultValue="02:00 PM" />
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-3">
                <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">End Date</Text>
                <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-bold" defaultValue="14/02/2024" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">End Time</Text>
                <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-bold" defaultValue="02:00 PM" />
              </View>
            </View>
          </View>
        </View>

        {/* --- CATALOG OBJECTS --- */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-slate-800">Catalog Objects</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateObjectStep1')}
              className="bg-[#7C3AED] px-4 py-2 rounded-xl flex-row items-center shadow-sm shadow-purple-200"
            >
              <Feather name="plus" size={16} color="white" />
              <Text className="text-white font-bold text-xs ml-1">Add Item</Text>
            </TouchableOpacity>
          </View>

          {/* LISTA DE ITEMS */}
        {catalogItems.map((item) => (
          // Cambiamos View por TouchableOpacity y le sumamos el onPress
          <TouchableOpacity 
            key={item.id} 
            onPress={() => navigation.navigate('EditAuctionItem', { itemId: item.id })}
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
            <TouchableOpacity className="p-3">
              <Feather name="trash-2" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        </View>

        {/* BOTÓN FINAL */}
        <View className="px-6 mb-12">
          <TouchableOpacity className="bg-[#7C3AED] rounded-3xl py-5 items-center shadow-md shadow-purple-200">
            <Text className="text-white font-bold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Footer />
    </KeyboardAvoidingView>
  );
}