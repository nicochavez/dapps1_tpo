import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Footer from '../components/Footer';

// Importamos el contexto y la base de datos
import { AuthContext } from '../context/AuthContext';
import catalogsData from '../data/catalogs.json';

export default function MyAuctionsScreen() {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

  if (!currentUser) return null;

  const myCatalogs = catalogsData.filter(catalog => catalog.ownerId === currentUser.id);

  // Función para determinar el color de la etiqueta según el estado
  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case 'LIVE':
        return { bg: 'bg-[#a78bfa]', text: 'text-white' };
      case 'SCHEDULED':
      case 'UPCOMING': // Usamos 'upcoming' que tenías en tu JSON para que coincida con Figma
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#64748b]' };
      case 'ENDED':
        return { bg: 'bg-transparent border border-slate-300', text: 'text-slate-400' };
      case 'REVIEW':
        return { bg: 'bg-[#fca5a5]', text: 'text-white' };
      default:
        return { bg: 'bg-slate-200', text: 'text-slate-500' };
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER TIPO FIGMA (Simple, con flecha atrás) */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Auctions</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* TÍTULO Y SUBTÍTULO */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-800 mb-2">My Auctions</Text>
          <Text className="text-slate-500 text-sm leading-5">
            Manage your curated collections and live catalogs.
          </Text>
        </View>

        {/* LISTA DE SUBASTAS CONDENSADA */}
        <View className="mb-4">
          {myCatalogs.map((catalog) => {
            const statusStyle = getStatusStyle(catalog.status);
            
            return (
              <TouchableOpacity 
                key={catalog.id} 
                onPress={() => navigation.navigate('ManageAuctionScreen', { catalogId: catalog.id })}
                className="bg-white rounded-2xl p-3 mb-4 shadow-sm shadow-slate-100 flex-row items-center"
              >
                {/* Imagen Cuadrada Redondeada */}
                <Image 
                  source={{ uri: catalog.image }} 
                  className="w-16 h-16 rounded-2xl bg-slate-100" 
                  resizeMode="cover"
                />
                
                {/* Contenido Central */}
                <View className="flex-1 ml-4 justify-center">
                  
                  {/* Fila: Status Pill + Piezas */}
                  <View className="flex-row items-center mb-1">
                    <View className={`px-2 py-0.5 rounded-md mr-2 ${statusStyle.bg}`}>
                      <Text className={`text-[8px] font-bold uppercase tracking-widest ${statusStyle.text}`}>
                        {catalog.status === 'Upcoming' ? 'SCHEDULED' : catalog.status}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-500 font-medium">
                      {/* Formateamos el número para que siempre tenga 2 dígitos (ej: 05 pieces) */}
                      {catalog.totalItems.toString().padStart(2, '0')} pieces
                    </Text>
                  </View>

                  {/* Título de la subasta */}
                  <Text className="text-base font-bold text-slate-800 mb-0.5" numberOfLines={1}>
                    {catalog.title}
                  </Text>

                  {/* Fecha/Tiempo restante */}
                  <Text className="text-xs text-slate-400">
                    {catalog.endDate}
                  </Text>
                  
                </View>

                {/* Ícono de la derecha (Flecha o Lápiz dependiendo del estado) */}
                <View className="ml-2 pl-2">
                  {catalog.status.toUpperCase() === 'UPCOMING' ? (
                    <View className="bg-slate-200 p-2 rounded-full">
                      <Feather name="edit-2" size={12} color="#64748b" />
                    </View>
                  ) : (
                    <Feather name="chevron-right" size={16} color="#94a3b8" />
                  )}
                </View>

              </TouchableOpacity>
            );
          })}
        </View>

        {/* BOTÓN DE NUEVO CATÁLOGO (Igual al Figma) */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateAuction')}
          className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 items-center mb-10 bg-slate-50/50"
        >
          <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-4">
            <Feather name="plus" size={24} color="#7C3AED" />
          </View>
          <Text className="text-slate-800 font-bold text-base mb-2">New Catalog</Text>
          <Text className="text-slate-500 text-xs text-center leading-5 px-4">
            Create a new curated auction and start accepting bids from global collectors.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <Footer />
    </View>
  );
}