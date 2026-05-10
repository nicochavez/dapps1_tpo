import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';

// Importamos los 3 JSONs
import catalogsData from '../data/catalogs.json';
import itemsData from '../data/items.json';
import usersData from '../data/users.json'; 

// 1. Agregamos route y navigation a los props
export default function CatalogItemsScreen({ route, navigation }) {
  // 2. Extraemos el catalogId de los parámetros (con 'c1' como valor por defecto)
  const catalogId = route?.params?.catalogId || 'c1';
  
  // 3. Buscamos el catálogo dinámicamente
  const activeCatalog = catalogsData.find(c => c.id === catalogId);

  // Manejo de error básico por si no encuentra el catálogo
  if (!activeCatalog) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <Text className="text-slate-500 font-bold">Catalog not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 p-2 bg-purple-100 rounded-lg">
          <Text className="text-[#7C3AED]">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catalogItems = itemsData.filter(item => item.catalogId === activeCatalog.id);
  const catalogOwner = usersData.find(u => u.id === activeCatalog.ownerId);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* --- TÍTULO DEL CATÁLOGO --- */}
        <Text className="text-2xl font-bold text-slate-800 mb-4">{activeCatalog.title}</Text>

        {/* --- TARJETA DEL DUEÑO --- */}
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm shadow-slate-200 flex-row items-center">
          <View className="relative">
            <Image 
              source={{ uri: catalogOwner.avatar }} 
              className="w-16 h-16 rounded-full bg-purple-100" 
            />
            <View className="absolute bottom-0 right-0 bg-[#7C3AED] rounded-full p-0.5 border-2 border-white">
              <Feather name="check" size={10} color="white" />
            </View>
          </View>
          
          <View className="ml-4 justify-center">
            <Text className="text-xs font-bold text-slate-500 mb-1 tracking-wider uppercase">
              {catalogOwner.role}
            </Text>
            <Text className="text-lg font-bold text-slate-800 mb-1.5">
              {catalogOwner.name}
            </Text>
            <View className="bg-[#cca038] self-start px-3 py-1 rounded-lg">
              <Text className="text-white text-[10px] font-bold tracking-wider">
                {catalogOwner.badge}
              </Text>
            </View>
          </View>
        </View>

        {/* --- LISTADO DE ITEMS --- */}
<View className="mb-10">
          {catalogItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
              // Forzamos el flex-row y una altura fija para evitar que se estire
              className="bg-white rounded-3xl p-3 mb-4 shadow-sm shadow-slate-200 flex-row items-center h-28"
            >
              {/* Imagen con fallback: si item.image falla, no rompe el diseño */}
              <Image
                source={{ uri: item.image || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8' }}
                className="w-20 h-20 rounded-2xl bg-slate-100"
                resizeMode="cover"
              />
              
              {/* Contenedor de la información */}
              <View className="flex-1 ml-4 justify-center h-full">
                
                <Text className="text-base font-bold text-slate-800 mb-1" numberOfLines={1}>
                  {item.title}
                </Text>
                
                <View className="flex-row items-center mb-2">
                  <Feather name="clock" size={12} color="#64748b" />
                  <Text className="text-xs text-slate-500 ml-1">
                    {item.timeLeft || '00:00:00'}
                  </Text>
                </View>
                
                <View className="flex-row items-end justify-between">
                  <View>
                    <Text className="text-[10px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">
                      Current Bid
                    </Text>
                    <Text className="text-sm font-bold text-[#7C3AED]">
                      ${item.currentBid ? item.currentBid.toLocaleString('en-US') : '0'}
                    </Text>
                  </View>
                  
                  <View className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                    <Text className="text-[#7C3AED] font-bold text-[10px]">View Details</Text>
                  </View>
                </View>

              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}