import React, { useContext, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import itemsData from '../data/items.json';

export default function ManageObjectScreen({ route, navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const itemId = route?.params?.itemId || 'i7';
  const item = itemsData.find(i => i.id === itemId) || itemsData[0];

  const [activeImage, setActiveImage] = useState(item?.producto?.image || item?.image);

  const itemOwnerId = item?.ownerId || item?.producto?.duenioId;
  const isOwner = Boolean(currentUser?.id && itemOwnerId && currentUser.id === itemOwnerId);
  const lotState = item?.estadoLote || (item?.subastado === 'si' ? 'subastado' : 'pendiente');

  const lotLabel = item?.numeroPieza ? `LOT ${item.numeroPieza}` : item?.pieceNumber || 'LOT';
  const coverImage = item?.producto?.image || item?.image || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8';
  const photos = [coverImage].filter(Boolean);
  const priceLabel = lotState === 'subastado'
    ? item?.importeAdjudicado || item?.currentBid || item?.precioBase || 0
    : item?.currentBid || item?.precioBase || 0;

  const screenTitle = useMemo(() => {
    if (lotState === 'en_puja') return 'Owner View - Live Lot';
    if (lotState === 'subastado') return 'Owner View - Ended Lot';
    return 'Owner View - Upcoming Lot';
  }, [lotState]);

  if (!item) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <Text className="text-slate-500 font-bold">Item not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 rounded-xl bg-purple-100">
          <Text className="text-[#7C3AED] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <View className="w-full bg-white rounded-3xl p-6 shadow-sm shadow-slate-200 items-center">
          <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="lock" size={22} color="#dc2626" />
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-2">Owner view restricted</Text>
          <Text className="text-slate-500 text-center leading-6">
            This screen is only available to the owner of the item.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-6 px-4 py-3 rounded-2xl bg-[#7C3AED]">
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">{screenTitle}</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <View className="relative mb-3">
            <Image
              source={{ uri: activeImage }}
              className="w-full h-56 rounded-3xl bg-slate-200"
              resizeMode="cover"
            />
            <View className={`absolute top-4 left-4 px-3 py-1.5 rounded-full flex-row items-center backdrop-blur-md ${lotState === 'en_puja' ? 'bg-rose-600/90' : lotState === 'subastado' ? 'bg-slate-700/90' : 'bg-blue-600/90'}`}>
              <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                {lotState === 'en_puja' ? 'LIVE' : lotState === 'subastado' ? 'ENDED' : 'UPCOMING'}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {photos.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveImage(img)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 mr-3 ${activeImage === img ? 'border-[#7C3AED]' : 'border-transparent'}`}
              >
                <Image source={{ uri: img }} className="w-full h-full bg-slate-200" resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm shadow-slate-200">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-slate-800 mb-1">{item.producto?.descripcionCatalogo || item.title}</Text>
              <Text className="text-xs text-slate-500 mb-4">{item.producto?.descripcionCompleta || item.description || 'No description available.'}</Text>
            </View>
            <View className="bg-purple-100 px-3 py-1 rounded-full">
              <Text className="text-[#7C3AED] text-[10px] font-bold tracking-widest uppercase">{lotLabel}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-widest mb-1">
                {lotState === 'subastado' ? 'Winning Bid' : 'Current Price'}
              </Text>
              <Text className="text-3xl font-bold text-[#7C3AED]">
                ${Number(priceLabel).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Owner</Text>
              <Text className="text-slate-800 font-bold text-sm">{currentUser?.name || 'Owner'}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="bg-white rounded-3xl p-4 items-center justify-center flex-1 mr-2 shadow-sm shadow-slate-200">
            <Feather name="eye" size={20} color="#a78bfa" className="mb-2" />
            <Text className="text-lg font-bold text-slate-800">1,248</Text>
            <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Views</Text>
          </View>

          <View className="bg-white rounded-3xl p-4 items-center justify-center flex-1 mx-1 shadow-sm shadow-slate-200">
            <MaterialCommunityIcons name="gavel" size={20} color="#a78bfa" className="mb-2" />
            <Text className="text-lg font-bold text-slate-800">42</Text>
            <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bids</Text>
          </View>

          <View className="bg-white rounded-3xl p-4 items-center justify-center flex-1 ml-2 shadow-sm shadow-slate-200">
            <Feather name="star" size={20} color="#a78bfa" className="mb-2" />
            <Text className="text-lg font-bold text-slate-800">86</Text>
            <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Watchers</Text>
          </View>
        </View>

        {lotState === 'en_puja' ? (
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800">Live Lot Snapshot</Text>
              <View className="bg-rose-100 px-2 py-0.5 rounded">
                <Text className="text-rose-600 text-[9px] font-bold uppercase tracking-wider">Read only</Text>
              </View>
            </View>
            <Text className="text-slate-500 leading-6 text-sm mb-3">
              The lot is currently active. You can monitor the current price and bidding pressure, but no edit actions are available from this screen.
            </Text>
            <Text className="text-slate-700 font-semibold text-sm">Current state: live</Text>
          </View>
        ) : lotState === 'subastado' ? (
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800">Ended Lot Result</Text>
              <View className="bg-slate-200 px-2 py-0.5 rounded">
                <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Final</Text>
              </View>
            </View>
            <Text className="text-slate-500 leading-6 text-sm mb-2">Winner: {item.ganadorNombre || 'Unknown bidder'}</Text>
            <Text className="text-slate-500 leading-6 text-sm mb-2">Final bid: ${Number(item.importeAdjudicado || item.currentBid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            <Text className="text-slate-500 leading-6 text-sm">This item is closed and cannot be edited.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800">Upcoming Lot</Text>
              <View className="bg-blue-100 px-2 py-0.5 rounded">
                <Text className="text-blue-600 text-[9px] font-bold uppercase tracking-wider">Preview</Text>
              </View>
            </View>
            <Text className="text-slate-500 leading-6 text-sm mb-2">This publication has not started yet.</Text>
            <Text className="text-slate-500 leading-6 text-sm">The owner can only preview the item data here, not edit it.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}