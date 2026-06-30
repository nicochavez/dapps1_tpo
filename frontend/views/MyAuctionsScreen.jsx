import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getMisProductos, buildImageUrl } from '../services/api';

const STATUS = {
  en_revision: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'PENDING REVIEW', hint: 'Awaiting expert inspection' },
  propuesta_enviada: { bg: 'bg-[#a78bfa]', text: 'text-white', label: 'PROPOSAL', hint: 'Review and accept the auction terms' },
  aceptado_por_usuario: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'ACCEPTED', hint: 'Terms accepted' },
  incluido_en_subasta: { bg: 'bg-[#a78bfa]', text: 'text-white', label: 'IN AUCTION', hint: 'Included in the auction' },
  rechazado: { bg: 'bg-red-100', text: 'text-red-700', label: 'REJECTED', hint: 'Rejected during inspection' },
  rechazado_por_usuario: { bg: 'bg-slate-200', text: 'text-slate-600', label: 'DECLINED', hint: 'You declined the terms' },
};

// Una vez aceptado por ambas partes, la card refleja el estado de la subasta.
const EN_SUBASTA_ESTADOS = ['aceptado_por_usuario', 'incluido_en_subasta'];

const AUCTION_STATUS = {
  upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'UPCOMING', hint: 'Scheduled — auction has not started yet' },
  live:     { bg: 'bg-red-100', text: 'text-red-700', label: 'LIVE', hint: 'The auction is live right now' },
  ended:    { bg: 'bg-slate-200', text: 'text-slate-600', label: 'ENDED', hint: 'The auction has finished' },
};

/** Deriva upcoming/live/ended del resumen de subasta (estado + fecha/hora). */
function getAuctionState(subasta) {
  const estado = (subasta?.estado || '').toLowerCase();
  if (estado === 'finalizada' || estado === 'cerrada') return 'ended';
  if (subasta?.fecha) {
    const dt = new Date(`${subasta.fecha}T${subasta.hora || '00:00:00'}`);
    if (!isNaN(dt.getTime()) && dt.getTime() > Date.now()) return 'upcoming';
  }
  return 'live';
}

function getStatus(item) {
  // Si ya fue aceptado y tiene subasta asignada, mostramos el estado de la subasta.
  if (EN_SUBASTA_ESTADOS.includes(item?.estado) && item?.subasta) {
    return AUCTION_STATUS[getAuctionState(item.subasta)];
  }
  return STATUS[item?.estado] ?? { bg: 'bg-slate-200', text: 'text-slate-500', label: item?.estado ?? '—', hint: '' };
}

export default function MyAuctionsScreen() {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      setItems(await getMisProductos(currentUser.token));
    } catch (error) {
      Alert.alert('No se pudieron cargar tus artículos', error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  useEffect(() => {
    if (!currentUser) {
      Alert.alert(
        'Sign in required',
        'You need to be logged in to view your auctions.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
        ]
      );
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // Una vez aceptado por ambas partes el item ya es un lote de subasta: se ve como tal.
  const handlePress = (item) => {
    if (EN_SUBASTA_ESTADOS.includes(item.estado)) {
      navigation.navigate('ItemDetail', { productoId: item.identificador, producto: item });
    } else {
      navigation.navigate('AuctionUnderReview', { productoId: item.identificador });
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Items</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-800 mb-2">My Items</Text>
          <Text className="text-slate-500 text-sm leading-5">
            Manage your listed items and track their auction status.
          </Text>
        </View>

        <View className="mb-4">
          {loading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator color="#7C3AED" />
            </View>
          ) : items.length > 0 ? (
            items.map((item) => {
              const statusStyle = getStatus(item);
              const isActionable = item.estado === 'propuesta_enviada';
              const imageUrl = buildImageUrl(item.fotos?.[0]?.url);

              return (
                <TouchableOpacity
                  key={item.identificador}
                  onPress={() => handlePress(item)}
                  className={`bg-white rounded-2xl p-3 mb-4 shadow-sm shadow-slate-100 flex-row items-center ${isActionable ? 'border border-purple-200' : ''}`}
                  activeOpacity={0.75}
                >
                  <View className="relative">
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} className="w-16 h-16 rounded-2xl bg-slate-100" resizeMode="cover" />
                    ) : (
                      <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center">
                        <Feather name="image" size={20} color="#cbd5e1" />
                      </View>
                    )}
                  </View>

                  <View className="flex-1 ml-4 justify-center">
                    <View className="flex-row items-center mb-1">
                      <View className={`px-2 py-0.5 rounded-md mr-2 ${statusStyle.bg}`}>
                        <Text className={`text-[8px] font-bold uppercase tracking-widest ${statusStyle.text}`}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-base font-bold text-slate-800 mb-0.5" numberOfLines={1}>
                      {item.descripcionCatalogo || item.descripcionCompleta}
                    </Text>

                    <Text className="text-xs text-slate-400" numberOfLines={1}>
                      {statusStyle.hint}
                    </Text>
                  </View>

                  <View className="ml-2 pl-2">
                    <Feather name="chevron-right" size={16} color={isActionable ? '#7C3AED' : '#94a3b8'} />
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
