import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CreateAuctionScreen({ navigation }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Create Auction</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* --- MAIN DETAILS --- */}
        <View className="mb-6">
          <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Auction Title</Text>
          <TextInput className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-4" placeholder="The Heritage Collection" placeholderTextColor="#64748b" />

          <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">User Category</Text>
          <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center">
            <Text className="text-slate-800 font-medium">Gold</Text>
            <Feather name="chevron-down" size={18} color="#94a3b8" />
          </View>

          <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Description</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium" 
            placeholder="Enter a comprehensive overview of the catalog's heritage and craftsmanship..." 
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* --- SCHEDULE --- */}
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200">
          <View className="flex-row items-center mb-5">
            <View className="bg-purple-50 p-2 rounded-lg mr-3">
              <Feather name="calendar" size={20} color="#7C3AED" />
            </View>
            <Text className="text-lg font-bold text-slate-800">Auction Schedule</Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Start Date</Text>
              <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-medium" placeholder="11/02/2024" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Start Time</Text>
              <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-medium" placeholder="02:00 PM" />
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">End Date</Text>
              <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-medium" placeholder="14/02/2024" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-bold text-[10px] text-slate-500 mb-2 uppercase tracking-widest">End Time</Text>
              <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-medium" placeholder="02:00 PM" />
            </View>
          </View>
        </View>

        {/* --- CATALOG IMAGE --- */}
        <View className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 items-center justify-center border-dashed">
          <Feather name="image" size={24} color="#94a3b8" className="mb-2" />
          <Text className="text-slate-600 font-medium text-xs mb-1">Click to upload high-res catalog cover</Text>
          <Text className="text-slate-400 text-[10px]">Recommended: 1920x1080 (300dpi)</Text>
        </View>

        {/* --- CATALOG OBJECTS --- */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-800">Catalog Objects</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateObjectStep1')}
            className="bg-[#a78bfa] px-4 py-2 rounded-xl flex-row items-center shadow-sm shadow-purple-200"
          >
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white font-bold text-xs ml-1">Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de objetos mockeados como en el diseño */}
        <View className="mb-8">
          {[
            { id: 1, name: 'DELMA Commodore Steel', num: 'PIECE #2043', price: '4,250', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200&auto=format&fit=crop' },
            { id: 2, name: 'Perpetual 1908', num: 'PIECE #2042', price: '3,500', img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=200&auto=format&fit=crop' }
          ].map(item => (
            <View key={item.id} className="bg-white rounded-2xl p-3 mb-3 shadow-sm shadow-slate-200 flex-row items-center">
              <Image source={{ uri: item.img }} className="w-16 h-16 rounded-xl bg-slate-100" />
              <View className="flex-1 ml-4">
                <Text className="text-[#7C3AED] text-[9px] font-bold tracking-widest uppercase mb-0.5">{item.num}</Text>
                <Text className="font-bold text-slate-800 text-sm mb-1">{item.name}</Text>
                <View className="flex-row items-center">
                  <Text className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">Base Price</Text>
                  <Text className="text-[#7C3AED] font-bold text-xs">${item.price}</Text>
                </View>
              </View>
              <TouchableOpacity className="p-2">
                <Feather name="trash-2" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* PUBLISH BUTTON */}
        <TouchableOpacity className="bg-[#a78bfa] rounded-2xl py-4 items-center mb-10 shadow-md shadow-purple-200">
          <Text className="text-white font-bold text-base">Publish Auction</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}