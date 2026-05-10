import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Importamos la data para leer el nombre del catálogo
import catalogsData from '../data/catalogs.json';

export default function AuctionUnderReviewScreen({ route, navigation }) {
  // Recibimos el ID, por defecto usamos 'c5' que es el que pusimos en estado REVIEW
  const catalogId = route?.params?.catalogId || 'c5';
  const catalog = catalogsData.find(c => c.id === catalogId) || catalogsData[4];

  return (
    <View className="flex-1 bg-white">
      
      {/* HEADER SIMPLE */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800 ml-4">Auction Under Review</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* --- ICONO CENTRAL --- */}
        <View className="w-24 h-24 rounded-full bg-purple-50 items-center justify-center mx-auto mb-8 mt-4">
          <View className="relative">
            <Feather name="clipboard" size={36} color="#7C3AED" />
            {/* Reloj superpuesto */}
            <View className="absolute -bottom-2 -right-2 bg-purple-50 rounded-full p-0.5">
              <View className="bg-[#7C3AED] rounded-full p-0.5">
                <Feather name="clock" size={12} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* --- TEXTOS PRINCIPALES --- */}
        <Text className="text-3xl font-bold text-center text-slate-800 mb-4 px-4 leading-10">
          Auction Under Review
        </Text>
        <Text className="text-center text-slate-500 mb-10 px-2 leading-6">
          Your catalog <Text className="font-bold text-slate-700">'{catalog.title}'</Text> has been successfully submitted and is currently being reviewed by our curation team.
        </Text>

        {/* --- TARJETA DE INFORMACIÓN (WHAT HAPPENS NEXT) --- */}
        <View className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-6">
            What happens next?
          </Text>

          <View className="flex-row items-start mb-5">
            <Feather name="mail" size={18} color="#7C3AED" className="mt-0.5 mr-4" />
            <Text className="flex-1 text-xs text-slate-500 leading-5">
              Check your email for a detailed confirmation and further instructions.
            </Text>
          </View>

          <View className="flex-row items-start mb-5">
            <Feather name="bell" size={18} color="#7C3AED" className="mt-0.5 mr-4" />
            <Text className="flex-1 text-xs text-slate-500 leading-5">
              Keep an eye on your app notifications for status updates.
            </Text>
          </View>

          <View className="flex-row items-start">
            <Feather name="trending-up" size={18} color="#7C3AED" className="mt-0.5 mr-4" />
            <Text className="flex-1 text-xs text-slate-500 leading-5">
              You can monitor your submission's progress in 'My Auctions'.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* --- BOTONES DEL FOOTER --- */}
      <View className="px-6 pb-12 bg-white">
        <TouchableOpacity 
          onPress={() => navigation.navigate('MyAuctions')}
          className="bg-[#a78bfa] rounded-full py-4 items-center shadow-sm shadow-purple-200 mb-4"
        >
          <Text className="text-white font-bold text-base">Go to My Auctions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          className="py-4 items-center"
        >
          <Text className="text-[#7C3AED] font-bold text-sm">Back to Home</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}