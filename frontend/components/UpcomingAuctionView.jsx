import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function UpcomingAuctionView({ activeCatalog, catalogItems, navigation }) {
  return (
    <View className="px-5 pt-8 pb-10">
      <Text className="text-lg font-bold text-slate-800 mb-4">
        Auction Lots
      </Text>

      {catalogItems.map((item, index) => {
        return (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            className="rounded-3xl px-4 py-4 mb-4 flex-row items-center relative overflow-hidden bg-white border border-slate-100 shadow-sm shadow-slate-200 min-h-28"
          >
            {/* Lot Number Indicator */}
            <View className="absolute top-3 left-3 z-10">
              <View className="px-2.5 py-1 rounded-full border bg-white/90 border-slate-200">
                <Text className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                  Lot {index + 1}
                </Text>
              </View>
            </View>

            {/* Imagen con fallback */}
            <View className="mr-4 relative">
              <Image
                source={{ uri: item.producto?.image || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8' }}
                className="rounded-2xl bg-slate-200 w-20 h-20"
                resizeMode="cover"
              />
            </View>
            
            {/* Contenedor de la información */}
            <View className="flex-1 justify-center min-h-20">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="font-bold flex-1 mr-2 text-base text-slate-800" numberOfLines={1}>
                  {item.producto?.descripcionCatalogo}
                </Text>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Feather name="clock" size={12} color="#64748b" />
                <Text className="text-xs ml-1 text-slate-500">
                  {activeCatalog.subasta?.fecha || '00:00:00'}
                </Text>
              </View>
              
              <View className="flex-row items-end justify-between mt-auto">
                <View>
                  <Text className="text-[10px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">
                    Starting Bid
                  </Text>
                  <Text className="font-bold text-sm text-slate-800">
                    ${item.precioBase ? item.precioBase.toLocaleString('en-US') : '0'}
                  </Text>
                </View>
                
                <View className="px-3 py-1.5 rounded-lg border bg-slate-50 border-slate-200">
                  <Text className="font-bold text-[10px] uppercase tracking-wide text-slate-500">
                    Details
                  </Text>
                </View>
              </View>

            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}