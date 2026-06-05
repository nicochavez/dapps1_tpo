import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CreateObjectStep1({ navigation }) {
  // Estados para almacenar los datos del formulario
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [condition, setCondition] = useState('New');
  const [description, setDescription] = useState('');

  // Estados para manejar si los desplegables están abiertos o cerrados
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);

  // Listas de opciones para los desplegables (simulando los datos de tu plataforma)
  const categoriesList = ['Luxury Watches', 'Fine Art', 'Classic Cars', 'Jewelry', 'Electronics'];
  const subCategoriesList = ['Vintage', 'Modern', 'Contemporary', 'Antique', 'Limited Edition'];

  // Validación: Todos los campos deben estar completos
  const isFormValid = title.trim().length > 0 && category.length > 0 && subCategory.length > 0 && description.trim().length > 0;

  const handleNext = () => {
    // Empaquetamos los datos sumando la subcategoría
    const itemData = { title, category, subCategory, condition, description };
    navigation.navigate('CreateObjectStep2', { itemData });
  };

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
            <Text className="text-[10px] text-slate-500 font-medium">Review</Text>
          </View>
        </View>

        {/* --- TÍTULO --- */}
        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">Title</Text>
        <TextInput 
          className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-6" 
          placeholder="e.g., Patek Philippe Twenty" 
          value={title}
          onChangeText={setTitle}
        />

        {/* --- DESPLEGABLE: CATEGORÍA --- */}
        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">Category</Text>
        <TouchableOpacity 
          onPress={() => {
            setIsCategoryOpen(!isCategoryOpen);
            if (isSubCategoryOpen) setIsSubCategoryOpen(false); // Cierra el otro si está abierto
          }}
          className="bg-slate-200/60 rounded-xl px-4 py-3 mb-2 flex-row justify-between items-center"
        >
          <Text className={category ? "text-slate-800 font-medium" : "text-slate-400 font-medium"}>
            {category || "Select a category"}
          </Text>
          <Feather name={isCategoryOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
        </TouchableOpacity>
        
        {/* Opciones de Categoría (Se muestran solo si isCategoryOpen es true) */}
        {isCategoryOpen && (
          <View className="bg-white border border-slate-200 rounded-xl mb-4 overflow-hidden shadow-sm">
            {categoriesList.map((cat, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => { setCategory(cat); setIsCategoryOpen(false); }}
                className={`px-4 py-3 ${index < categoriesList.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <Text className="text-slate-700">{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className={isCategoryOpen ? "" : "mb-4"} />

        {/* --- DESPLEGABLE: SUB-CATEGORÍA --- */}
        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">Sub-category</Text>
        <TouchableOpacity 
          onPress={() => {
            setIsSubCategoryOpen(!isSubCategoryOpen);
            if (isCategoryOpen) setIsCategoryOpen(false); // Cierra el otro si está abierto
          }}
          className="bg-slate-200/60 rounded-xl px-4 py-3 mb-2 flex-row justify-between items-center"
        >
          <Text className={subCategory ? "text-slate-800 font-medium" : "text-slate-400 font-medium"}>
            {subCategory || "Select a sub-category"}
          </Text>
          <Feather name={isSubCategoryOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
        </TouchableOpacity>
        
        {/* Opciones de Sub-categoría */}
        {isSubCategoryOpen && (
          <View className="bg-white border border-slate-200 rounded-xl mb-4 overflow-hidden shadow-sm">
            {subCategoriesList.map((sub, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => { setSubCategory(sub); setIsSubCategoryOpen(false); }}
                className={`px-4 py-3 ${index < subCategoriesList.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <Text className="text-slate-700">{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className={isSubCategoryOpen ? "" : "mb-4"} />

        {/* --- CONDICIÓN DEL PRODUCTO --- */}
        <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">Product Condition</Text>
        <View className="flex-row bg-slate-200/60 rounded-xl p-1 mb-6">
          <TouchableOpacity onPress={() => setCondition('New')} className={`flex-1 py-2.5 rounded-lg items-center ${condition === 'New' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold text-xs ${condition === 'New' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCondition('Used')} className={`flex-1 py-2.5 rounded-lg items-center ${condition === 'Used' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold text-xs ${condition === 'Used' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>Used</Text>
          </TouchableOpacity>
        </View>

        {/* --- DESCRIPCIÓN DETALLADA (Hecha más grande) --- */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="font-bold text-[10px] text-slate-800 tracking-widest uppercase">Detailed Description</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[8px] font-bold uppercase tracking-widest">Required</Text>
          </View>
        </View>
        {/* Le agregamos min-h-[120px] y numberOfLines={8} para que el cuadro de texto sea el doble de alto */}
        <TextInput 
          className="bg-slate-200/60 rounded-xl px-4 py-4 text-slate-800 font-medium mb-6 min-h-[120px]" 
          placeholder="Describe the characteristics, history, state of preservation, and any other relevant details..." 
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

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
    </KeyboardAvoidingView>
  );
}