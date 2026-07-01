import React, { useContext, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { getItemCatalogoDetalle, buildImageUrl } from '../services/api';

export default function ManageObjectScreen({ route, navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const catalogoId = route?.params?.catalogoId;
  const itemId = route?.params?.itemId;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const d = await getItemCatalogoDetalle(catalogoId, itemId, currentUser?.token);
      setDetail(d);
      const first = buildImageUrl(d?.producto?.fotos?.[0]?.url);
      setActiveImage(first || null);
    } catch (error) {
      Alert.alert('No se pudo cargar el item', error.message);
    } finally {
      setLoading(false);
    }
  }, [catalogoId, itemId, currentUser?.token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const lotState = detail?.estadoLote || (detail?.subastado === 'si' ? 'subastado' : 'pendiente');
  const screenTitle = useMemo(() => {
    if (lotState === 'en_puja') return 'Owner View - Live Lot';
    if (lotState === 'subastado') return 'Owner View - Ended Lot';
    return 'Owner View - Upcoming Lot';
  }, [lotState]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <Text className="text-slate-500 font-bold">Item not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 rounded-xl bg-purple-100">
          <Text className="text-[#7C3AED] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = !!currentUser?.id && String(currentUser.id) === String(detail.producto?.duenioId);

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

  const photos = (detail.producto?.fotos || []).map(f => buildImageUrl(f.url)).filter(Boolean);
  const cover = activeImage || photos[0] || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8';
  const price = Number(detail.precioBase) || 0;

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
              source={{ uri: cover }}
              className="w-full h-56 rounded-3xl bg-slate-200"
              resizeMode="cover"
            />
            <View className={`absolute top-4 left-4 px-3 py-1.5 rounded-full flex-row items-center ${lotState === 'en_puja' ? 'bg-rose-600/90' : lotState === 'subastado' ? 'bg-slate-700/90' : 'bg-blue-600/90'}`}>
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
              <Text className="text-xl font-bold text-slate-800 mb-1">{detail.producto?.descripcionCatalogo}</Text>
              <Text className="text-xs text-slate-500 mb-4">{detail.producto?.descripcionCompleta || 'No description available.'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-widest mb-1">Base Price</Text>
              <Text className="text-3xl font-bold text-[#7C3AED]">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Owner</Text>
              <Text className="text-slate-800 font-bold text-sm">{currentUser?.nombre || 'Owner'}</Text>
            </View>
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
            <Text className="text-slate-500 leading-6 text-sm">
              The lot is currently active. You can monitor it, but no edit actions are available from this screen.
            </Text>
          </View>
        ) : lotState === 'subastado' ? (
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800">Ended Lot Result</Text>
              <View className="bg-slate-200 px-2 py-0.5 rounded">
                <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Final</Text>
              </View>
            </View>
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
            <Text className="text-slate-500 leading-6 text-sm">This publication has not started yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
