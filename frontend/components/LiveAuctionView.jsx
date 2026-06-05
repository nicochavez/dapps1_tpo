import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function LiveAuctionView({ activeCatalog, catalogItems, navigation }) {
  const sortedItems = [...catalogItems].sort((left, right) => {
    const leftPiece = Number(left.numeroPieza ?? 0);
    const rightPiece = Number(right.numeroPieza ?? 0);

    return leftPiece - rightPiece;
  });

  return (
    <View className="px-5 pt-8 pb-10">
      <Text className="text-lg font-bold text-slate-800 mb-4">
        Live Auction Order
      </Text>

      {sortedItems.map((item, index) => {
        const lotState = item.estadoLote || (item.subastado === 'si' ? 'subastado' : 'pendiente');
        const isActive = lotState === 'en_puja';
        const isSold = lotState === 'subastado';
        const lotNumber = item.numeroPieza ?? index + 1;

        return (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            className={`rounded-3xl px-4 py-4 mb-4 flex-row items-center relative overflow-hidden ${
              isActive 
                ? 'bg-purple-50 border-2 border-[#7C3AED] shadow-md shadow-purple-200 min-h-36' 
                : isSold
                  ? 'bg-slate-100 border border-slate-200 opacity-80 min-h-28'
                  : 'bg-white border border-slate-100 shadow-sm shadow-slate-200 min-h-28'
            }`}
          >
            {/* Lot Number Indicator */}
            <View className="absolute top-3 left-3 z-10">
              <View className={`px-2.5 py-1 rounded-full border ${
                isActive ? 'bg-white/90 border-[#7C3AED]/20' : isSold ? 'bg-white/80 border-slate-200' : 'bg-white/90 border-slate-200'
              }`}>
                <Text className={`text-[10px] font-semibold tracking-widest uppercase ${
                  isActive ? 'text-[#7C3AED]' : 'text-slate-400'
                }`}>
                  Lot {lotNumber}
                </Text>
              </View>
            </View>

            {/* Imagen con fallback */}
            <View className="mr-4 relative">
              <Image
                source={{ uri: item.producto?.image || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8' }}
                className="w-20 h-20 rounded-2xl bg-slate-200"
                resizeMode="cover"
              />
              {isSold && (
                <View className="absolute inset-0 bg-black/40 rounded-2xl items-center justify-center">
                  <Text className="text-white font-bold text-xs tracking-wider uppercase transform -rotate-12">Sold</Text>
                </View>
              )}
            </View>
            
            {/* Contenedor de la información */}
            <View className="flex-1 justify-center min-h-20">
              <View className="flex-row justify-between items-start mb-1">
                <Text className={`font-bold flex-1 mr-2 ${isActive ? 'text-base text-[#7C3AED]' : 'text-base text-slate-800'}`} numberOfLines={1}>
                  {item.producto?.descripcionCatalogo}
                </Text>
                {isActive && (
                  <View className="bg-red-100 px-2 py-0.5 rounded-full flex-row items-center">
                    <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
                    <Text className="text-red-600 text-[10px] font-bold">BIDDING</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-row items-center mb-2">
                <Feather name="clock" size={12} color={isActive ? '#7C3AED' : '#64748b'} />
                <Text className={`text-xs ml-1 ${isActive ? 'text-[#7C3AED] font-medium' : 'text-slate-500'}`}>
                  {isSold ? 'Ended' : isActive ? 'Bidding now' : 'Upcoming'}
                </Text>
              </View>
              
              <View className="flex-row items-end justify-between mt-auto">
                <View>
                  <Text className="text-[10px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">
                    {isSold ? 'Winning Bid' : isActive ? 'Current Ask' : 'Starting Bid'}
                  </Text>
                  <Text className={`font-bold ${isActive ? 'text-lg text-[#7C3AED]' : isSold ? 'text-sm text-slate-600' : 'text-sm text-slate-800'}`}>
                    ${(isSold || isActive ? (item.currentBid || item.importeAdjudicado) : item.precioBase)?.toLocaleString('en-US') || '0'}
                  </Text>
                </View>
                
                <View className={`px-3 py-1.5 rounded-lg border ${
                  isActive ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Text className={`font-bold text-[10px] uppercase tracking-wide ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}>
                    {isSold ? 'View' : isActive ? 'Join' : 'View'}
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