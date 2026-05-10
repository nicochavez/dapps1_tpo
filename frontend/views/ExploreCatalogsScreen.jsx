import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';

import catalogsData from '../data/catalogs.json';

export default function ExploreCatalogsScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. GENERACIÓN DINÁMICA DE CATEGORÍAS
  // Extraemos todas las categorías, quitamos los duplicados con Set, y filtramos los undefined/null
  const uniqueCategories = [...new Set(catalogsData.map(c => c.category).filter(Boolean))];
  
  // Armamos el array final poniendo 'All' siempre al principio
  const dynamicCategories = ['All', ...uniqueCategories];

  // 2. LÓGICA DE FILTRADO (Búsqueda + Categoría)
  const filteredCatalogs = catalogsData.filter((catalog) => {
    
    // A) Chequeo de Categoría
    const matchesCategory = activeCategory === 'All' || catalog.category === activeCategory;

    // B) Chequeo de Búsqueda (Texto seguro)
    const query = searchQuery.toLowerCase().trim();
    
    // Nos aseguramos de que existan antes de pasarlos a minúsculas para evitar crasheos
    const title = catalog.title ? catalog.title.toLowerCase() : '';
    const description = catalog.description ? catalog.description.toLowerCase() : '';
    
    const matchesSearch = query === '' || title.includes(query) || description.includes(query);

    // Solo se muestra si pasa ambos filtros
    return matchesCategory && matchesSearch;
  });

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header />

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        
        <Text className="text-3xl font-bold text-slate-800 mb-6">
          Explore Catalogs
        </Text>
        
        {/* --- BARRA DE BÚSQUEDA --- */}
        <View className="flex-row items-center bg-slate-200/60 rounded-2xl px-4 py-4 mb-6">
          <Feather name="search" size={20} color="#64748b" />
          <TextInput 
            className="flex-1 ml-3 text-slate-800"
            placeholder="Search catalogs, auctions..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none" // Ayuda a que el teclado del celu no joda con las mayúsculas en las búsquedas
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Feather name="x-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* --- FILTROS DE CATEGORÍAS (AHORA DINÁMICOS) --- */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            {dynamicCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <TouchableOpacity 
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full mr-3 border ${
                    isActive 
                      ? 'bg-[#a78bfa] border-[#a78bfa]' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-600'}`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* --- RESULTADOS --- */}
        <View className="mb-10">
          {filteredCatalogs.length > 0 ? (
            filteredCatalogs.map((catalog) => (
              <TouchableOpacity 
                key={catalog.id} 
                className="bg-white rounded-3xl mb-6 shadow-sm shadow-slate-200 overflow-hidden"
                onPress={() => navigation.navigate('CatalogItems', { catalogId: catalog.id })}
              >
                
                <View className="relative">
                  <Image 
                    source={{ uri: catalog.image }} 
                    className="w-full h-44" 
                    resizeMode="cover"
                  />
                  
                  <View className="absolute top-4 left-4 bg-purple-100/95 px-2.5 py-1 rounded-lg flex-row items-center">
                    {catalog.status === 'LIVE' && (
                      <View className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mr-1.5" />
                    )}
                    <Text className="text-[#7C3AED] font-bold text-[10px] uppercase tracking-wider">
                      {catalog.status}
                    </Text>
                  </View>
                </View>

                <View className="p-5">
                  <Text className="text-xl font-bold text-slate-800 mb-2">{catalog.title}</Text>
                  <Text className="text-sm text-slate-500 mb-5 leading-5" numberOfLines={2}>
                    {catalog.description}
                  </Text>
                  
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-6">
                      <Feather name="package" size={14} color="#64748b" />
                      <Text className="text-xs text-slate-600 font-medium ml-1.5">
                        {catalog.totalItems} Items
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <Feather name="calendar" size={14} color="#64748b" />
                      <Text className="text-xs text-slate-600 font-medium ml-1.5">
                        {catalog.endDate}
                      </Text>
                    </View>
                  </View>
                </View>

              </TouchableOpacity>
            ))
          ) : (
            /* Estado vacío si la búsqueda no encuentra nada */
            <View className="items-center justify-center py-10 mt-4 bg-white rounded-3xl border border-slate-100 border-dashed">
              <Feather name="search" size={32} color="#cbd5e1" className="mb-3" />
              <Text className="text-slate-800 font-bold text-base mb-1">No results found</Text>
              <Text className="text-slate-400 text-sm text-center px-6">
                Try adjusting your search "{searchQuery}" or selecting a different category.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
      <Footer />
    </View>
  );
}