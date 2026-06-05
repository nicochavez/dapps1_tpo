import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ItemDetailEndedView({ item, parentCatalog }) {
  const mainImage = item?.producto?.image || parentCatalog?.image || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8';
  const catalogImage = parentCatalog?.image || mainImage;
  const [activeImage, setActiveImage] = useState(mainImage);

  const lotLabel = item?.numeroPieza ? `LOT ${item.numeroPieza}` : item?.pieceNumber || 'LOT';
  const catalogLabel = parentCatalog?.descripcion || 'Unknown catalog';
  const categoryLabel = parentCatalog?.subasta?.categoria || 'general';
  const description = item?.producto?.descripcionCompleta || 'No description available.';
  const winningBid = item?.importeAdjudicado || item?.currentBid || item?.precioBase || 0;

  const bidHistory = [
    { id: 1, initials: 'A.R.', name: 'Alex Rivers', time: '2 MINUTES AGO', amount: 1245.0 },
    { id: 2, initials: 'J.M.', name: 'Julian Marc', time: '12 MINUTES AGO', amount: 1200.0 },
    { id: 3, initials: 'S.H.', name: 'Sarah H.', time: '1 HOUR AGO', amount: 1150.0 },
  ];

  return (
    <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold text-slate-800 mb-4">{item?.producto?.descripcionCatalogo || 'Item details'}</Text>

      <View className="mb-6">
        <View className="relative mb-3">
          <Image
            source={{ uri: activeImage }}
            className="w-full h-56 rounded-3xl bg-slate-200"
            resizeMode="cover"
          />
          <View className="absolute top-4 left-4 bg-slate-700/90 px-3 py-1.5 rounded-full flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Ended Auction</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          {[mainImage, catalogImage].filter(Boolean).map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveImage(img)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 mr-3 ${activeImage === img ? 'border-[#7C3AED]' : 'border-transparent'}`}
            >
              <Image source={{ uri: img }} className="w-full h-full bg-slate-200" resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="flex-row flex-wrap items-center justify-between mb-8">
        <View className="flex-row space-x-2 mb-3 w-full justify-between">
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-[#7C3AED] text-[10px] font-bold tracking-widest uppercase">{lotLabel}</Text>
          </View>
          <View className="bg-[#a78bfa] px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Category: {categoryLabel}</Text>
          </View>
        </View>

        <View className="flex-row items-center w-full justify-between">
          <View className="flex-row items-center">
            <Feather name="clock" size={18} color="#7C3AED" />
            <Text className="text-[#7C3AED] font-bold text-lg ml-2 tracking-wide">
              {parentCatalog?.subasta?.fecha || '00:00:00'}
            </Text>
          </View>
          <Text className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Catalog: {catalogLabel}
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <Text className="text-lg font-light text-slate-800 mb-4">Description</Text>
        <Text className="text-slate-500 leading-6 text-sm">{description}</Text>
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Winning Bid</Text>
          <View className="bg-slate-200 px-2 py-0.5 rounded">
            <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Ended</Text>
          </View>
        </View>

        <View className="flex-row items-baseline mb-4">
          <Text className="text-4xl font-bold text-slate-800">
            ${Number(winningBid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text className="text-xs text-slate-400 font-bold ml-2">USD</Text>
        </View>

        <View className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <Text className="text-sm text-slate-700 font-semibold mb-1">Auction closed.</Text>
          <Text className="text-sm text-slate-500 leading-6">
            The lot can no longer receive bids, but you can review the sale outcome and bid history below.
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-light text-slate-800">Bidding History</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">12 Bids</Text>
          </View>
        </View>

        {bidHistory.map((bid, index) => (
          <View key={bid.id} className={`flex-row justify-between items-center ${index !== bidHistory.length - 1 ? 'mb-6' : ''}`}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 mr-3">
                <Text className="text-[#7C3AED] text-[10px] font-bold tracking-wider">{bid.initials}</Text>
              </View>
              <View>
                <Text className="font-bold text-slate-800 text-sm mb-0.5">{bid.name}</Text>
                <Text className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{bid.time}</Text>
              </View>
            </View>
            <Text className="font-bold text-[#7C3AED] text-sm">
              ${bid.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
