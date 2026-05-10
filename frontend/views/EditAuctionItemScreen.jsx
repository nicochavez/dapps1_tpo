import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

import itemsData from '../data/items.json';

export default function EditAuctionItemScreen({ route, navigation }) {
  // Recibimos el ID del ítem, por defecto usamos uno de los relojes
  const itemId = route?.params?.itemId || 'i7';
  const item = itemsData.find(i => i.id === itemId) || itemsData[0];

  // Estados inicializados con la data existente para poder editarla
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState(item.category || 'Luxury Watches');
  const [description, setDescription] = useState(item.description);
  const [basePrice, setBasePrice] = useState(item.currentBid ? item.currentBid.toString() : '');
  const [status, setStatus] = useState('New'); // 'New' o 'Used'

  // Armamos un array de fotos simulado mezclando la principal y la galería
  const photos = item.gallery ? [item.image, ...item.gallery] : [item.image, item.image, item.image];

  const handleSave = () => {
    console.log('Guardando cambios del ítem...', { title, category, description, basePrice, status });
    // Acá harías un PUT a tu backend
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">Edit Auction Item</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* --- CHANGE PHOTOS --- */}
        <Text className="text-xl font-bold text-slate-800 mt-2 mb-4">Change Photos</Text>
        
        <View className="mb-6">
          {/* Foto Principal */}
          <View className="relative mb-3">
            <Image 
              source={{ uri: photos[0] }} 
              className="w-full h-48 rounded-3xl bg-slate-200" 
              resizeMode="cover"
            />
            <TouchableOpacity className="absolute bottom-3 left-3 bg-white/90 p-2 rounded-full shadow-sm">
              <Feather name="edit-2" size={14} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          {/* Miniaturas horizontales */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {photos.slice(0, 3).map((img, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri: img }} className="w-16 h-16 rounded-xl bg-slate-200 border border-slate-200" resizeMode="cover" />
                <TouchableOpacity className="absolute bottom-1 left-1 bg-white/90 p-1 rounded-full shadow-sm">
                  <Feather name="edit-2" size={10} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            ))}
            {/* Botón de Agregar Foto */}
            <TouchableOpacity className="w-16 h-16 rounded-xl bg-slate-200 items-center justify-center border border-slate-300">
              <Feather name="image" size={16} color="#64748b" className="mb-1" />
              <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* --- ETIQUETAS DE INFO --- */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="bg-purple-100 px-3 py-1.5 rounded-full">
            <Text className="text-[#7C3AED] text-[10px] font-bold tracking-widest uppercase">{item.pieceNumber}</Text>
          </View>
          <Text className="text-[#7C3AED] font-medium text-sm">Starts in 04h 22m 15s</Text>
        </View>

        {/* --- FORMULARIO --- */}
        <View className="mb-10">
          <Text className="font-bold text-[10px] text-slate-600 mb-2">Title</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-4 border border-slate-100" 
            value={title}
            onChangeText={setTitle}
          />

          <Text className="font-bold text-[10px] text-slate-600 mb-2">Category</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-4 border border-slate-100" 
            value={category}
            onChangeText={setCategory}
          />

          <Text className="font-bold text-[10px] text-slate-600 mb-2">Sub-category</Text>
          <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-4 flex-row justify-between items-center border border-slate-100">
            <Text className="text-slate-800 font-medium">Vintage Watches</Text>
            <Feather name="chevron-down" size={18} color="#64748b" />
          </View>

          <Text className="font-bold text-[10px] text-slate-600 mb-2">Description</Text>
          <TextInput 
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-4 border border-slate-100" 
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <Text className="font-bold text-[10px] text-slate-600 mb-2">Base Price</Text>
          <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-6 flex-row items-center border border-slate-100">
            <Text className="text-slate-600 font-medium mr-2">USD <Feather name="chevron-down" size={14} color="#64748b" /></Text>
            <TextInput 
              className="flex-1 text-slate-800 font-medium" 
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
            />
          </View>

          <Text className="font-bold text-[10px] text-slate-600 mb-2">Product Status</Text>
          <View className="flex-row bg-slate-200/60 rounded-xl p-1 mb-8 border border-slate-100">
            <TouchableOpacity 
              onPress={() => setStatus('New')} 
              className={`flex-1 py-2.5 rounded-lg items-center ${status === 'New' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-xs ${status === 'New' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setStatus('Used')} 
              className={`flex-1 py-2.5 rounded-lg items-center ${status === 'Used' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-xs ${status === 'Used' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>Used</Text>
            </TouchableOpacity>
          </View>

          {/* BOTÓN SAVE */}
          <TouchableOpacity 
            onPress={handleSave}
            className="bg-[#a78bfa] rounded-2xl py-4 items-center shadow-sm shadow-purple-200 mb-6"
          >
            <Text className="text-white font-bold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}