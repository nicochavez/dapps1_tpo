import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CreateObjectStep2({ route, navigation }) {
  // Recibimos los datos del Paso 1
  const { itemData } = route.params || {};

  // Arrancamos con 5 espacios extra para cumplir el mínimo de 6 (1 principal + 5 extras)
  const [extraPhotos, setExtraPhotos] = useState([1, 2, 3, 4, 5]);
  const [selectedImages, setSelectedImages] = useState({});

  const handleAddMorePhotos = () => {
    setExtraPhotos([...extraPhotos, extraPhotos.length + 1]);
  };

  const photoCards = [
    ...extraPhotos.map((slot, index) => ({ key: `extra-${index}`, type: 'photo', label: `Photo ${index + 2}` })),
    { key: 'add-more', type: 'add' },
  ];

  const photoRows = [];
  for (let index = 0; index < photoCards.length; index += 2) {
    photoRows.push(photoCards.slice(index, index + 2));
  }

  const pickImage = async (imageKey) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => ({ ...prev, [imageKey]: result.assets[0].uri }));
    }
  };

  // --- NUEVA VALIDACIÓN ---
  // Contamos cuántas keys del objeto tienen una URI válida
  const totalPhotosUploaded = Object.values(selectedImages).filter(uri => uri).length;
  // Exigimos que esté la foto principal y que el total sea al menos 6
  const isFormValid = !!selectedImages['main'] && totalPhotosUploaded >= 6;

  const handleNext = () => {
    // Enviamos los datos del paso 1 + las fotos seleccionadas al paso 3
    navigation.navigate('CreateObjectStep3', { itemData, photos: selectedImages });
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-2 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800">Create Object</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAuction')} className="w-8 items-end">
          <Feather name="x" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
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
            <Text className="text-[10px] text-slate-500 font-medium">Review</Text>
          </View>
        </View>

        {/* SECCIÓN DE FOTOS */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-light text-slate-800">Photos</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[8px] font-bold uppercase tracking-widest">Min 6 Photos</Text>
          </View>
        </View>

        {/* CONTADOR DE FOTOS (Feedback visual para el usuario) */}
        <Text className="text-xs text-slate-500 mb-4">
          Uploaded: <Text className={totalPhotosUploaded >= 6 ? "text-[#7C3AED] font-bold" : "text-slate-800 font-bold"}>{totalPhotosUploaded}</Text> / 6 minimum
        </Text>

        {/* FOTO PRINCIPAL */}
        <TouchableOpacity 
          onPress={() => pickImage('main')}
          className="w-full h-44 border-2 border-dashed border-[#7C3AED] bg-purple-50 rounded-3xl items-center justify-center mb-4 overflow-hidden"
        >
          {selectedImages['main'] ? (
            <Image source={{ uri: selectedImages['main'] }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-purple-100">
                <Feather name="camera" size={24} color="#7C3AED" />
              </View>
              <Text className="text-[#7C3AED] font-bold text-sm mb-1">Main Cover Photo</Text>
              <Text className="text-slate-400 text-[10px]">Required</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* GRILLA EXTRA */}
        <View>
          {photoRows.map((row, rowIndex) => (
            <View key={`photo-row-${rowIndex}`} className="flex-row justify-between mb-2">
              {row.map((card) => {
                if (card.type === 'add') {
                  return (
                    <TouchableOpacity
                      key={card.key}
                      onPress={handleAddMorePhotos}
                      className="w-[48%] aspect-square border-2 border-dashed border-[#d8b4fe] bg-purple-50 rounded-3xl items-center justify-center"
                    >
                      <Feather name="plus" size={24} color="#7C3AED" />
                      <Text className="text-[#7C3AED] font-bold text-[11px] mt-2">Add Extra</Text>
                    </TouchableOpacity>
                  );
                }

                const hasImage = !!selectedImages[card.key];
                return (
                  <TouchableOpacity
                    key={card.key}
                    onPress={() => pickImage(card.key)}
                    className="w-[48%] aspect-square border-2 border-dashed border-slate-300 bg-white rounded-3xl items-center justify-center overflow-hidden"
                  >
                    {hasImage ? (
                      <Image source={{ uri: selectedImages[card.key] }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="items-center">
                        <Feather name="camera" size={24} color="#94a3b8" />
                        <Text className="text-slate-400 text-[10px] mt-2">{card.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View className="flex-row px-6 py-4 bg-white border-t border-slate-100 space-x-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-1 py-4 border border-slate-200 rounded-2xl items-center flex-row justify-center mr-2">
          <Feather name="chevron-left" size={16} color="#64748b" />
          <Text className="font-bold text-slate-600 text-sm ml-1">Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleNext} 
          disabled={!isFormValid}
          className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center shadow-sm ml-2 ${isFormValid ? 'bg-[#a78bfa] shadow-purple-200' : 'bg-slate-300'}`}
        >
          <Text className="font-bold text-white text-sm mr-1">Next</Text>
          <Feather name="chevron-right" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}