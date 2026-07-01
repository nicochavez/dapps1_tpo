import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getCatalogos, buildImageUrl } from '../services/api';

const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);

export default function ViewAuctionScreen({ route, navigation }) {
  const catalogId = route?.params?.catalogId;
  const { user: currentUser } = useContext(AuthContext);

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCatalogos(currentUser?.token);
      const found = (data || []).find(c => String(c.identificador) === String(catalogId));
      setCatalog(found || null);
    } catch (error) {
      Alert.alert('No se pudo cargar la subasta', error.message);
    } finally {
      setLoading(false);
    }
  }, [catalogId, currentUser?.token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (!catalog) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <Text className="text-slate-500 font-bold">Auction not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 rounded-xl bg-purple-100">
          <Text className="text-[#7C3AED] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const items = catalog.items || [];
  const potentialEarnings = items.reduce((sum, it) => sum + num(it.currentBid ?? it.precioBase), 0);
  const heroImage = buildImageUrl(catalog.image);
  const schedule = [catalog.subasta?.fecha, catalog.subasta?.hora].filter(Boolean).join(' · ') || 'To be confirmed';
  const isLive = catalog.subasta?.estado === 'abierta';

  return (
    <View className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Auctions</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View className="mb-4 relative">
          {heroImage ? (
            <Image source={{ uri: heroImage }} className="w-full h-48 rounded-3xl bg-slate-200" resizeMode="cover" />
          ) : (
            <View className="w-full h-48 rounded-3xl bg-slate-100 items-center justify-center">
              <Feather name="image" size={28} color="#cbd5e1" />
            </View>
          )}
          {isLive && (
            <View className="absolute top-4 left-4 bg-purple-300/90 px-3 py-1.5 rounded-full flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">LIVE</Text>
            </View>
          )}
        </View>

        {/* POTENTIAL EARNINGS */}
        <View className="bg-[#a78bfa] rounded-3xl p-6 mb-4 shadow-md shadow-purple-200">
          <Text className="text-purple-100 text-[10px] font-bold tracking-widest uppercase mb-1">
            Potential Earnings
          </Text>
          <Text className="text-white text-4xl font-bold tracking-tight">
            ${potentialEarnings.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </Text>
        </View>

        {/* SCHEDULE */}
        <View className="flex-row items-center mb-6 px-1">
          <Feather name="clock" size={20} color="#7C3AED" />
          <Text className="text-[#7C3AED] font-bold text-lg ml-2">{schedule}</Text>
        </View>

        {/* CATALOG OBJECTS (read-only) */}
        <Text className="text-xl font-bold text-slate-800 mb-4 px-1">Catalog Objects</Text>

        <View className="mb-10">
          {items.length > 0 ? items.map((item, index) => (
            <TouchableOpacity
              key={item.identificador}
              onPress={() => navigation.navigate('ManageObject', { catalogoId: catalog.identificador, itemId: item.identificador })}
              className="bg-white rounded-3xl p-3 mb-4 shadow-sm shadow-slate-200 flex-row items-center"
            >
              {buildImageUrl(item.imagenPrincipal) ? (
                <Image source={{ uri: buildImageUrl(item.imagenPrincipal) }} className="w-16 h-16 rounded-2xl bg-slate-100" />
              ) : (
                <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center">
                  <Feather name="image" size={20} color="#cbd5e1" />
                </View>
              )}
              <View className="flex-1 ml-4">
                <Text className="text-[#7C3AED] text-[9px] font-bold tracking-widest uppercase mb-0.5">
                  LOT {item.numeroPieza ?? index + 1}
                </Text>
                <Text className="font-bold text-slate-800 text-sm mb-1" numberOfLines={1}>{item.descripcion}</Text>
                <View className="flex-row items-center">
                  <Text className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">Base Price</Text>
                  <Text className="text-[#7C3AED] font-bold text-xs">
                    ${num(item.currentBid ?? item.precioBase).toLocaleString('en-US')}
                  </Text>
                </View>
              </View>
              <View className="p-3">
                <Feather name="chevron-right" size={20} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          )) : (
            <Text className="text-slate-400 text-center mt-4">No items in this catalog yet.</Text>
          )}
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}
