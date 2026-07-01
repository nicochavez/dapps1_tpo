import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getCatalogos, buildImageUrl } from '../services/api';

const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);

export default function ManageAuctionScreen({ route, navigation }) {
  const catalogId = route?.params?.catalogId;
  const { user: currentUser } = useContext(AuthContext);

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCatalogos(currentUser?.token);
      setCatalog((data || []).find(c => String(c.identificador) === String(catalogId)) || null);
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

  const heroImage = buildImageUrl(catalog.image);
  const items = catalog.items || [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Auctions</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View className="px-6 mb-8">
          <View className="relative">
            {heroImage ? (
              <Image source={{ uri: heroImage }} className="w-full h-52 rounded-3xl bg-slate-200" resizeMode="cover" />
            ) : (
              <View className="w-full h-52 rounded-3xl bg-slate-100 items-center justify-center">
                <Feather name="image" size={28} color="#cbd5e1" />
              </View>
            )}
          </View>
        </View>

        {/* FORM */}
        <View className="px-6 mb-8">
          <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Auction Title</Text>
          <TextInput
            className="bg-slate-200/60 rounded-2xl px-5 py-4 text-slate-800 font-medium mb-5 border border-slate-100"
            defaultValue={catalog.descripcion}
          />

          <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Category</Text>
          <View className="bg-slate-200/60 rounded-2xl px-5 py-4 mb-5 flex-row justify-between items-center border border-slate-100">
            <Text className="text-slate-800 font-medium capitalize">{catalog.subasta?.categoria || '—'}</Text>
            <Feather name="chevron-down" size={20} color="#94a3b8" />
          </View>

          <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Item Category</Text>
          <View className="bg-slate-200/60 rounded-2xl px-5 py-4 border border-slate-100">
            <Text className="text-slate-800 font-medium">{catalog.itemCategory || '—'}</Text>
          </View>
        </View>

        {/* SCHEDULE */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-[32px] p-6 shadow-sm shadow-slate-200">
            <View className="flex-row items-center mb-6">
              <View className="bg-purple-50 p-2 rounded-xl mr-3">
                <Feather name="calendar" size={20} color="#7C3AED" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Auction Schedule</Text>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-3">
                <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Date</Text>
                <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-bold" defaultValue={catalog.subasta?.fecha || ''} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Time</Text>
                <TextInput className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 font-bold" defaultValue={catalog.subasta?.hora || ''} />
              </View>
            </View>
          </View>
        </View>

        {/* CATALOG OBJECTS */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-slate-800">Catalog Objects</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateObjectStep1')}
              className="bg-[#7C3AED] px-4 py-2 rounded-xl flex-row items-center shadow-sm shadow-purple-200"
            >
              <Feather name="plus" size={16} color="white" />
              <Text className="text-white font-bold text-xs ml-1">Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <TouchableOpacity
              key={item.identificador}
              onPress={() => navigation.navigate('EditAuctionItem', { catalogoId: catalog.identificador, itemId: item.identificador })}
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
          ))}
        </View>

        <View className="px-6 mb-12">
          <TouchableOpacity className="bg-[#7C3AED] rounded-3xl py-5 items-center shadow-md shadow-purple-200">
            <Text className="text-white font-bold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Footer />
    </KeyboardAvoidingView>
  );
}
