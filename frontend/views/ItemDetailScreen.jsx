import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';

// Bases de datos simuladas
import itemsData from '../data/items.json';
import catalogsData from '../data/catalogs.json';
import usersData from '../data/users.json';

export default function ItemDetailScreen({ route, navigation }) {
  // Simulamos recibir el ID por parámetro, o forzamos el 'i3' (Lenovo)
  const itemId = route?.params?.itemId || 'i3';
  const item = itemsData.find(i => i.id === itemId);

  // Estados interactivos
  const [activeImage, setActiveImage] = useState(item.image);
  const [bidAmount, setBidAmount] = useState('');

  // Lógica Relacional: Buscamos al dueño (Item -> Catálogo -> Owner)
  const parentCatalog = catalogsData.find(c => c.id === item.catalogId);
  const auctionOwner = parentCatalog ? usersData.find(u => u.id === parentCatalog.ownerId) : null;

  // Mock del historial de pujas (En un caso real, esto viene de un GET /items/{id}/bids)
  const bidHistory = [
    { id: 1, initials: 'A.R.', name: 'Alex Rivers', time: '2 MINUTES AGO', amount: 1245.00 },
    { id: 2, initials: 'J.M.', name: 'Julian Marc', time: '12 MINUTES AGO', amount: 1200.00 },
    { id: 3, initials: 'S.H.', name: 'Sarah H.', time: '1 HOUR AGO', amount: 1150.00 },
  ];

  const handlePlaceBid = () => {
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= item.currentBid) {
      alert('Please enter a valid bid higher than the current bid.');
      return;
    }
    // Lógica POST /bids
    console.log('Enviando puja...', bidAmount);
    alert('Bid placed successfully!');
    setBidAmount('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      <Header />

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* TÍTULO */}
        <Text className="text-2xl font-bold text-slate-800 mb-4">{item.title}</Text>

        {/* --- GALERÍA DE IMÁGENES --- */}
        <View className="mb-6">
          <View className="relative mb-3">
            <Image 
              source={{ uri: activeImage }} 
              className="w-full h-56 rounded-3xl bg-slate-200" 
              resizeMode="cover"
            />
            {item.isLive && (
              <View className="absolute top-4 left-4 bg-red-500/90 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md">
                <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Live Auction</Text>
              </View>
            )}
          </View>

          {/* Miniaturas (Carousel) */}
          <View className="flex-row space-x-3">
            {(item.gallery || [item.image]).map((img, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setActiveImage(img)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 mr-3 ${activeImage === img ? 'border-[#7C3AED]' : 'border-transparent'}`}
              >
                <Image source={{ uri: img }} className="w-full h-full bg-slate-200" resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- ETIQUETAS Y TIEMPO --- */}
        <View className="flex-row flex-wrap items-center justify-between mb-8">
          <View className="flex-row space-x-2 mb-3 w-full justify-between">
            <View className="bg-purple-100 px-3 py-1 rounded-full">
              <Text className="text-[#7C3AED] text-[10px] font-bold tracking-widest uppercase">{item.pieceNumber}</Text>
            </View>
            <View className="bg-[#a78bfa] px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Category: {item.category || 'General'}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center w-full justify-between">
            <View className="flex-row items-center">
              <Feather name="clock" size={18} color="#7C3AED" />
              <Text className="text-[#7C3AED] font-bold text-lg ml-2 tracking-wide">{item.timeLeft}</Text>
            </View>
            <Text className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Catalog: {item.catalogName || parentCatalog?.title}
            </Text>
          </View>
        </View>

        {/* --- DESCRIPCIÓN --- */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
          <Text className="text-lg font-light text-slate-800 mb-4">Description</Text>
          <Text className="text-slate-500 leading-6 text-sm">
            {item.description}
          </Text>
        </View>

        {/* --- CAJA DE PUJAS (BIDDING) --- */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Current Bid</Text>
            <View className="bg-[#a78bfa] px-2 py-0.5 rounded">
              <Text className="text-white text-[9px] font-bold uppercase tracking-wider">Live</Text>
            </View>
          </View>
          
          <View className="flex-row items-baseline mb-6">
            <Text className="text-4xl font-bold text-slate-800">
              ${item.currentBid.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </Text>
            <Text className="text-xs text-slate-400 font-bold ml-2">USD</Text>
          </View>

          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Set Amount</Text>
          <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-6 flex-row items-center">
            <Text className="text-slate-500 font-medium mr-2">$</Text>
            <TextInput 
              className="flex-1 text-slate-800 font-bold" 
              placeholder="Enter bid amount" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
            />
          </View>

          <TouchableOpacity 
            onPress={handlePlaceBid}
            className="bg-[#a78bfa] rounded-2xl py-4 items-center shadow-sm shadow-purple-200"
          >
            <Text className="text-white font-bold text-base">Place Bid</Text>
          </TouchableOpacity>
        </View>

        {/* --- HISTORIAL DE PUJAS --- */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-light text-slate-800">Bidding History</Text>
            <View className="bg-purple-100 px-2 py-0.5 rounded">
              <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">12 Bids</Text>
            </View>
          </View>

          {bidHistory.map((bid, index) => (
            <View key={bid.id} className={`flex-row justify-between items-center ${index !== bidHistory.length - 1 ? 'mb-6' : ''}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 mr-3">
                  <Text className="text-[#7C3AED] text-[10px] font-bold tracking-wider">{bid.initials}</Text>
                </View>
                <View>
                  <Text className="font-bold text-slate-800 text-sm mb-0.5">{bid.name}</Text>
                  <Text className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{bid.time}</Text>
                </View>
              </View>
              <Text className="font-bold text-[#7C3AED] text-sm">
                ${bid.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
              </Text>
            </View>
          ))}
        </View>

        {/* --- TARJETA DEL DUEÑO --- */}
        {auctionOwner && (
          <View className="bg-white rounded-3xl p-5 mb-10 shadow-sm shadow-slate-200 flex-row items-center">
            <View className="relative">
              <Image source={{ uri: auctionOwner.avatar }} className="w-14 h-14 rounded-full bg-purple-100" />
              <View className="absolute bottom-0 right-0 bg-[#7C3AED] rounded-full p-0.5 border-2 border-white">
                <Feather name="check" size={10} color="white" />
              </View>
            </View>
            <View className="ml-4 justify-center">
              <Text className="text-[10px] font-bold text-slate-500 mb-0.5 tracking-wider uppercase">Auction Owner</Text>
              <Text className="text-base font-bold text-slate-800 mb-1">{auctionOwner.name}</Text>
              <View className="bg-[#cca038] self-start px-2 py-0.5 rounded-md">
                <Text className="text-white text-[9px] font-bold tracking-widest">{auctionOwner.badge}</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      <Footer />
    </KeyboardAvoidingView>
  );
}