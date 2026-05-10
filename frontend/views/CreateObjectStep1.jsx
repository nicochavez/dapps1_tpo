import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CreateObjectStep1({ navigation }) {
  const [status, setStatus] = useState('New');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
      <View className="flex-row items-center px-6 pt-14 pb-2 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800">Create Object</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <Text className="text-3xl font-light text-slate-800 mt-4 mb-2">Add Object</Text>
        <Text className="text-slate-500 mb-8">List your item in the global marketplace in minutes.</Text>

        {/* STEPPER */}
        <View className="flex-row items-center justify-between mb-10 px-4">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-2">
              <Text className="text-white font-bold text-xs">1</Text>
            </View>
            <Text className="text-[10px] text-[#7C3AED] font-bold">Details</Text>
          </View>
          <View className="flex-1 h-[1px] bg-slate-200 mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Text className="text-slate-500 font-bold text-xs">2</Text>
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Photos</Text>
          </View>
          <View className="flex-1 h-[1px] bg-slate-200 mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Text className="text-slate-500 font-bold text-xs">3</Text>
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Price</Text>
          </View>
        </View>

        {/* FORMULARIO */}
        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest">Title</Text>
        <TextInput className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-4" placeholder="Patek Philippe Twenty" />

        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest">Category</Text>
        <TextInput className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-4" placeholder="Luxury Watches" />

        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest">Sub-category</Text>
        <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-6 flex-row justify-between items-center">
          <Text className="text-slate-800 font-medium">Vintage Watches</Text>
          <Feather name="chevron-down" size={18} color="#64748b" />
        </View>

        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest">Product Status</Text>
        <View className="flex-row bg-slate-200/60 rounded-xl p-1 mb-6">
          <TouchableOpacity onPress={() => setStatus('New')} className={`flex-1 py-2.5 rounded-lg items-center ${status === 'New' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold text-xs ${status === 'New' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatus('Used')} className={`flex-1 py-2.5 rounded-lg items-center ${status === 'Used' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold text-xs ${status === 'Used' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>Used</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <Text className="font-bold text-[10px] text-slate-800 tracking-widest">Detailed Description</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[8px] font-bold uppercase tracking-widest">Required</Text>
          </View>
        </View>
        <TextInput 
          className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-6" 
          placeholder="Describe the characteristics, history, state of preservation, and any other details relevant to bidders." 
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* TIP CARD */}
        <View className="bg-purple-50 rounded-2xl p-4 flex-row mb-8 border border-purple-100">
          <Feather name="check-circle" size={18} color="#7C3AED" className="mt-0.5 mr-3" />
          <View className="flex-1">
            <Text className="text-[#7C3AED] font-bold text-xs mb-1">Expert Tip</Text>
            <Text className="text-slate-500 text-[11px] leading-4">Auctions with descriptions of more than 200 words and precise technical details typically receive 35% more bids.</Text>
          </View>
        </View>

      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="flex-row px-6 py-4 bg-white border-t border-slate-100 space-x-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-1 py-4 border border-slate-200 rounded-2xl items-center flex-row justify-center">
          <Feather name="chevron-left" size={16} color="#64748b" />
          <Text className="font-bold text-slate-600 text-sm ml-1">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CreateObjectStep2')} className="flex-1 py-4 bg-[#a78bfa] rounded-2xl items-center flex-row justify-center shadow-sm shadow-purple-200">
          <Text className="font-bold text-white text-sm mr-1">Next</Text>
          <Feather name="chevron-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}