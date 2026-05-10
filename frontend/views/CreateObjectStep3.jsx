import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CreateObjectStep3({ navigation }) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      
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
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Feather name="check" size={14} color="#64748b" />
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Photos</Text>
          </View>
          <View className="flex-1 h-[1px] bg-[#7C3AED] mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-2">
              <Text className="text-white font-bold text-xs">3</Text>
            </View>
            <Text className="text-[10px] text-[#7C3AED] font-bold">Price</Text>
          </View>
        </View>

        {/* PREVIEW CARD */}
        <View className="bg-white rounded-3xl p-4 mb-8 shadow-sm shadow-slate-200 flex-row items-center border-l-4 border-[#7C3AED]">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1548171915-e76a380eb922?q=80&w=200&auto=format&fit=crop' }} 
            className="w-20 h-20 rounded-2xl bg-slate-100" 
            resizeMode="cover"
          />
          <View className="flex-1 ml-4 justify-center">
            <Text className="text-lg font-bold text-slate-800 mb-1">Patek Philippe Twenty</Text>
            <Text className="text-sm text-slate-500">Category: Luxury Watches</Text>
          </View>
        </View>

        {/* FORM */}
        <Text className="font-bold text-[10px] text-slate-500 mb-2 tracking-widest uppercase">Base Price</Text>
        <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-8 flex-row items-center">
          <Text className="text-slate-600 font-medium mr-2">USD <Feather name="chevron-down" size={14} color="#64748b" /></Text>
          <TextInput 
            className="flex-1 text-slate-800 font-bold" 
            placeholder="4,500" 
            keyboardType="numeric"
          />
        </View>

        {/* TERMS CHECKBOX */}
        <TouchableOpacity className="flex-row items-start mb-8 pr-4" onPress={() => setIsChecked(!isChecked)}>
          <View className={`w-5 h-5 rounded border mt-0.5 ${isChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
            {isChecked && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-slate-500 text-xs leading-5 flex-1">
            I certify the lawful origin and ownership of this item, accepting the <Text className="text-[#7C3AED] underline">Terms of Service</Text> and the applicable platform fees after the successful sale.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="flex-row px-6 py-4 bg-white border-t border-slate-100 space-x-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-1 py-4 border border-slate-200 rounded-2xl items-center flex-row justify-center">
          <Feather name="chevron-left" size={16} color="#64748b" />
          <Text className="font-bold text-slate-600 text-sm ml-1">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateAuction')} 
          className="flex-[2] py-4 bg-[#a78bfa] rounded-2xl items-center flex-row justify-center shadow-sm shadow-purple-200"
        >
          <Text className="font-bold text-white text-sm">Add Object</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}