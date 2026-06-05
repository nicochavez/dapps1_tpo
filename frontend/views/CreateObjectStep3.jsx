import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CreateObjectStep3({ route, navigation }) {
  // Recibimos los datos y las fotos persistidas de los pasos anteriores
  const { itemData, photos } = route.params || {};

  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Función para simular el POST a la API
  const handleConfirmAndSubmit = () => {
    setIsLoading(true);

    const payloadToAPI = {
      title: itemData?.title,
      category: itemData?.category,
      subCategory: itemData?.subCategory,
      condition: itemData?.condition,
      description: itemData?.description,
      photos: photos, 
    };

    console.log("Enviando a BBDD (Simulación API): ", payloadToAPI);

    // Simulamos el tiempo de respuesta del servidor (1.5 segundos)
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('AuctionUnderReview');
    }, 1500);
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-2 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8" disabled={isLoading}>
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800">Create Object</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAuction')} className="w-8 items-end" disabled={isLoading}>
          <Feather name="x" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        <Text className="text-3xl font-light text-slate-800 mt-4 mb-2">Review & Confirm</Text>
        <Text className="text-slate-500 mb-8">Review your item details before sending it for approval.</Text>

        {/* STEPPER */}
        <View className="flex-row items-center justify-between mb-8 px-4">
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
            <Text className="text-[10px] text-[#7C3AED] font-bold">Review</Text>
          </View>
        </View>

        {/* --- SUMMARY CARD MEJORADA --- */}
        <Text className="font-bold text-[10px] text-slate-500 mb-2 tracking-widest uppercase">Item Summary</Text>
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200 border border-slate-100">
          
          {/* Imagen Principal Grande */}
          <Image 
            source={photos?.main ? { uri: photos.main } : require('../assets/logo.png')} 
            className="w-full h-48 rounded-2xl bg-slate-100 mb-4" 
            resizeMode="cover"
          />
          
          {/* Título */}
          <Text className="text-xl font-bold text-slate-800 mb-3">
            {itemData?.title || 'No Title Provided'}
          </Text>

          {/* Fila de Etiquetas (Badges) */}
          <View className="flex-row flex-wrap mb-4">
            <View className="bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 mr-2 mb-2">
              <Text className="text-slate-600 text-[10px] font-bold uppercase">{itemData?.category || 'Category'}</Text>
            </View>
            <View className="bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 mr-2 mb-2">
              <Text className="text-slate-600 text-[10px] font-bold uppercase">{itemData?.subCategory || 'Sub-category'}</Text>
            </View>
            <View className={`px-2 py-1.5 rounded-lg border mr-2 mb-2 ${itemData?.condition === 'New' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
              <Text className={`text-[10px] font-bold uppercase ${itemData?.condition === 'New' ? 'text-[#7C3AED]' : 'text-orange-600'}`}>
                {itemData?.condition || 'Condition'}
              </Text>
            </View>
          </View>

          {/* Previsualización de la descripción */}
          <Text className="text-slate-500 text-sm leading-5" numberOfLines={3}>
            {itemData?.description || 'No description provided.'}
          </Text>
        </View>

        {/* --- INFO BOX: TASACIÓN (Azul) --- */}
        <View className="bg-blue-50 rounded-2xl p-4 flex-row mb-4 border border-blue-100">
          <Feather name="info" size={18} color="#3b82f6" className="mt-0.5 mr-3" />
          <View className="flex-1">
            <Text className="text-blue-600 font-bold text-xs mb-1">Pricing & Valuation</Text>
            <Text className="text-blue-600/80 text-[11px] leading-4">
              The base price and estimated value will be assigned by our expert appraisers once your item is submitted and approved.
            </Text>
          </View>
        </View>

        {/* --- NUEVA INFO BOX: PÓLIZA DE SEGURO (Verde) --- */}
        <View className="bg-emerald-50 rounded-2xl p-4 flex-row mb-8 border border-emerald-100">
          <Feather name="shield" size={18} color="#059669" className="mt-0.5 mr-3" />
          <View className="flex-1">
            <Text className="text-emerald-700 font-bold text-xs mb-1">Asset Protection & Insurance</Text>
            <Text className="text-emerald-700/80 text-[11px] leading-4">
              To guarantee the safety of your asset, an adequate transit and vault insurance policy will be automatically selected and applied once the item is appraised.
            </Text>
          </View>
        </View>

        {/* TERMS CHECKBOX */}
        <TouchableOpacity 
          className="flex-row items-start mb-8 pr-4" 
          onPress={() => !isLoading && setIsChecked(!isChecked)}
        >
          <View className={`w-5 h-5 rounded border mt-0.5 ${isChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
            {isChecked && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-slate-500 text-xs leading-5 flex-1">
            I certify the lawful origin of this item, verify that the details provided are accurate, and accept the <Text className="text-[#7C3AED] underline">Terms of Service</Text>.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="flex-row px-6 py-4 bg-white border-t border-slate-100 space-x-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          disabled={isLoading}
          className="flex-1 py-4 border border-slate-200 rounded-2xl items-center flex-row justify-center"
        >
          <Feather name="chevron-left" size={16} color={isLoading ? "#cbd5e1" : "#64748b"} />
          <Text className={`font-bold text-sm ml-1 ${isLoading ? "text-slate-300" : "text-slate-600"}`}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleConfirmAndSubmit} 
          disabled={!isChecked || isLoading}
          className={`flex-[2] py-4 rounded-2xl items-center flex-row justify-center shadow-sm ${
            isChecked ? 'bg-[#a78bfa] shadow-purple-200' : 'bg-slate-300'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-bold text-white text-sm">Confirm & Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}