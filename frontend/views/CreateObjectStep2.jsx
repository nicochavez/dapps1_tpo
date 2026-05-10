import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CreateObjectStep2({ navigation }) {
  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      <View className="flex-row justify-between items-center px-6 pt-14 pb-2 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800">Create Object</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAuction')} className="w-8 items-end">
          <Feather name="x" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <Text className="text-3xl font-light text-slate-800 mt-4 mb-2">Add Object</Text>
        <Text className="text-slate-500 mb-8">List your item in the global marketplace in minutes.</Text>

        {/* STEPPER */}
        <View className="flex-row items-center justify-between mb-10 px-4">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Feather name="check" size={14} color="#64748b" />
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Details</Text>
          </View>
          <View className="flex-1 h-[1px] bg-[#7C3AED] mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-2">
              <Text className="text-white font-bold text-xs">2</Text>
            </View>
            <Text className="text-[10px] text-[#7C3AED] font-bold">Photos</Text>
          </View>
          <View className="flex-1 h-[1px] bg-slate-200 mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Text className="text-slate-500 font-bold text-xs">3</Text>
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Price</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-light text-slate-800">1. Photos</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[8px] font-bold uppercase tracking-widest">Required</Text>
          </View>
        </View>

        {/* PHOTO GRID */}
        <TouchableOpacity className="border-2 border-dashed border-slate-300 bg-white rounded-3xl p-8 items-center justify-center mb-4">
          <View className="bg-purple-100 p-4 rounded-2xl mb-3">
            <Feather name="camera" size={24} color="#7C3AED" />
          </View>
          <Text className="text-slate-700 font-medium text-sm mb-1">Main Cover Photo</Text>
          <Text className="text-slate-400 text-[10px]">Drag and drop or click to upload</Text>
        </TouchableOpacity>

        <View className="flex-row flex-wrap justify-between mb-8">
          {[1, 2, 3, 4].map((slot) => (
            <TouchableOpacity key={slot} className="w-[48%] aspect-square border-2 border-dashed border-slate-300 bg-white rounded-3xl items-center justify-center mb-4">
              <Feather name="plus" size={24} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* TIP CARD */}
        <View className="bg-purple-50 rounded-2xl p-4 flex-row mb-8 border border-purple-100">
          <Feather name="check-circle" size={18} color="#7C3AED" className="mt-0.5 mr-3" />
          <View className="flex-1">
            <Text className="text-[#7C3AED] font-bold text-xs mb-1">Expert Tip</Text>
            <Text className="text-slate-500 text-[11px] leading-4">Auctions with good, clear photos usually receive 40% more bids.</Text>
          </View>
        </View>

      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="flex-row px-6 py-4 bg-white border-t border-slate-100 space-x-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-1 py-4 border border-slate-200 rounded-2xl items-center flex-row justify-center">
          <Feather name="chevron-left" size={16} color="#64748b" />
          <Text className="font-bold text-slate-600 text-sm ml-1">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CreateObjectStep3')} className="flex-1 py-4 bg-[#a78bfa] rounded-2xl items-center flex-row justify-center shadow-sm shadow-purple-200">
          <Text className="font-bold text-white text-sm mr-1">Next</Text>
          <Feather name="chevron-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}