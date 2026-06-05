import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Footer from '../components/Footer';

// Importamos el contexto y la base de datos de ÍTEMS
import { AuthContext } from '../context/AuthContext';
import itemsData from '../data/items.json';

export default function MyAuctionsScreen() {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

  if (!currentUser) return null;

  // Filtramos los ítems donde el dueño es el usuario actual
  const myItems = itemsData.filter(item => item.ownerId === currentUser.id);

  // Adaptamos los colores de la etiqueta según el 'estadoLote' de tu JSON
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'en_puja':
        return { bg: 'bg-[#a78bfa]', text: 'text-white', label: 'LIVE' };
      case 'pendiente':
        return { bg: 'bg-[#e2e8f0]', text: 'text-[#64748b]', label: 'UPCOMING' };
      case 'subastado':
        return { bg: 'bg-transparent border border-slate-300', text: 'text-slate-400', label: 'SOLD' };
      default:
        return { bg: 'bg-slate-200', text: 'text-slate-500', label: status || 'REVIEW' };
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER TIPO FIGMA */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Items</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* TÍTULO Y SUBTÍTULO */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-800 mb-2">My Items</Text>
          <Text className="text-slate-500 text-sm leading-5">
            Manage your listed items and track their auction status.
          </Text>
        </View>

        {/* LISTA DE ÍTEMS CONDENSADA */}
        <View className="mb-4">
          {myItems.length > 0 ? (
            myItems.map((item) => {
              const statusStyle = getStatusStyle(item.estadoLote);
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  // Navegamos al detalle del ítem para gestionarlo o verlo
                  onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                  className="bg-white rounded-2xl p-3 mb-4 shadow-sm shadow-slate-100 flex-row items-center"
                >
                  {/* Imagen Cuadrada Redondeada */}
                  <Image 
                    source={{ uri: item.image || item.producto?.image }} 
                    className="w-16 h-16 rounded-2xl bg-slate-100" 
                    resizeMode="cover"
                  />
                  
                  {/* Contenido Central */}
                  <View className="flex-1 ml-4 justify-center">
                    
                    {/* Fila: Status Pill + Número de Lote */}
                    <View className="flex-row items-center mb-1">
                      <View className={`px-2 py-0.5 rounded-md mr-2 ${statusStyle.bg}`}>
                        <Text className={`text-[8px] font-bold uppercase tracking-widest ${statusStyle.text}`}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      <Text className="text-xs text-slate-500 font-medium">
                        {item.pieceNumber || `Lote ${item.numeroPieza}`}
                      </Text>
                    </View>

                    {/* Título del ítem */}
                    <Text className="text-base font-bold text-slate-800 mb-0.5" numberOfLines={1}>
                      {item.title}
                    </Text>

                    {/* Precio Base */}
                    <Text className="text-xs text-slate-400">
                      Base: ${item.precioBase?.toLocaleString('en-US')}
                    </Text>
                    
                  </View>

                  {/* Ícono de la derecha */}
                  <View className="ml-2 pl-2">
                    <Feather name="chevron-right" size={16} color="#94a3b8" />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="py-10 items-center justify-center">
              <Text className="text-slate-400 font-medium">You don't have any items yet.</Text>
            </View>
          )}
        </View>

        {/* BOTÓN DE NUEVO ÍTEM */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateObjectStep1')}
          className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 items-center mb-10 bg-slate-50/50"
        >
          <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-4">
            <Feather name="plus" size={24} color="#7C3AED" />
          </View>
          <Text className="text-slate-800 font-bold text-base mb-2">New Item</Text>
          <Text className="text-slate-500 text-xs text-center leading-5 px-4">
            List a new item and start accepting bids from global collectors.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <Footer />
    </View>
  );
}