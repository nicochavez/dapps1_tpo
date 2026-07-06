import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function CreateObjectStep1({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      Alert.alert(
        'Sign in required',
        'You need to be logged in to list an item.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }
        ]  
      );
    }
  }, [currentUser]);

  // Estados para almacenar los datos del formulario
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [condition, setCondition] = useState('New');
  const [description, setDescription] = useState('');
  // Campos adicionales para obras de arte / objetos de diseñador
  const [artistName, setArtistName] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [itemHistory, setItemHistory] = useState('');

  // Estados para manejar si los desplegables están abiertos o cerrados
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);

  // Listas de opciones para los desplegables (simulando los datos de tu plataforma)
  const categoriesList = ['Luxury Watches', 'Fine Art', 'Classic Cars', 'Jewelry', 'Electronics', 'Designer Objects'];
  const subCategoriesList = ['Vintage', 'Modern', 'Contemporary', 'Antique', 'Limited Edition'];

  // Categorías que requieren los campos de artista / diseñador
  const ART_OR_DESIGNER = new Set(['Fine Art', 'Designer Objects']);
  const isArtOrDesigner = ART_OR_DESIGNER.has(category);

  if (!currentUser) return null;

  const artFieldsValid = !isArtOrDesigner || (
    artistName.trim().length > 0 && itemDate.trim().length > 0 && itemHistory.trim().length > 0
  );
  const isFormValid =
    title.trim().length > 0 &&
    category.length > 0 &&
    subCategory.length > 0 &&
    description.trim().length > 0 &&
    artFieldsValid;

  const handleNext = () => {
    const itemData = { title, category, subCategory, condition, description,
      ...(isArtOrDesigner && { artistName, itemDate, itemHistory }) };
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
          <TouchableOpacity onPress={() => setCondition('New')} className={`flex-1 py-2.5 rounded-lg items-center shadow-sm ${condition === 'New' ? 'bg-white' : ''}`}>
            <Text className={`font-bold text-xs ${condition === 'New' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCondition('Used')} className={`flex-1 py-2.5 rounded-lg items-center shadow-sm ${condition === 'Used' ? 'bg-white' : ''}`}>
            <Text className={`font-bold text-xs ${condition === 'Used' ? 'text-[#7C3AED]' : 'text-slate-500'}`}>Used</Text>
          </TouchableOpacity>
        </View>

        {/* --- CAMPOS ARTISTA / DISEÑADOR (solo para Fine Art / Designer Objects) --- */}
        {isArtOrDesigner && (
          <>
            <View className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex-row items-start">
              <View className="bg-[#7C3AED] p-1.5 rounded-full mr-3 mt-0.5">
                <Feather name="info" size={12} color="white" />
              </View>
              <Text className="text-purple-700 text-xs leading-5 flex-1">
                As this is an artwork or designer object, please provide the creator, date and provenance history.
              </Text>
            </View>

            <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">Artist / Designer Name</Text>
            <TextInput
              className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-6"
              placeholder="e.g., Pablo Picasso / Louis Vuitton"
              placeholderTextColor="#94a3b8"
              value={artistName}
              onChangeText={setArtistName}
            />

            <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">Date / Period</Text>
            <TextInput
              className="bg-slate-200/60 rounded-xl px-4 py-3 text-slate-800 font-medium mb-6"
              placeholder="e.g., 1923 / ca. 1910–1920"
              placeholderTextColor="#94a3b8"
              value={itemDate}
              onChangeText={setItemDate}
            />

            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-[10px] text-slate-800 tracking-widest uppercase">Provenance & History</Text>
              <View className="bg-purple-100 px-2 py-0.5 rounded">
                <Text className="text-[#7C3AED] text-[8px] font-bold uppercase tracking-widest">Required</Text>
              </View>
            </View>
            <TextInput
              className="bg-slate-200/60 rounded-xl px-4 py-4 text-slate-800 font-medium mb-6 min-h-[120px]"
              placeholder="Describe context, previous owners, exhibition history, curiosities, certificates of authenticity..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={itemHistory}
              onChangeText={setItemHistory}
            />
          </>
        )}

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