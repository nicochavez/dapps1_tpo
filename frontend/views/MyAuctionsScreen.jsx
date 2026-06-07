import React, { useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import itemsData from '../data/items.json';

const STATUS = {
  en_puja: {
    bg: 'bg-[#a78bfa]',
    text: 'text-white',
    label: 'LIVE',
  },
  pendiente: {
    bg: 'bg-slate-200',
    text: 'text-slate-600',
    label: 'UPCOMING',
  },
  subastado: {
    bg: 'bg-transparent border border-slate-300',
    text: 'text-slate-400',
    label: 'SOLD',
  },
  verificacion_pendiente: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'PENDING REVIEW',
  },
};

function getStatus(estadoLote) {
  return STATUS[estadoLote] ?? { bg: 'bg-slate-200', text: 'text-slate-500', label: estadoLote ?? '—' };
}

export default function MyAuctionsScreen() {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

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

  const myItems = itemsData.filter(item => item.ownerId === currentUser.id);

  const handlePress = (item) => {
    if (item.estadoLote === 'verificacion_pendiente') {
      navigation.navigate('AuctionUnderReview');
    } else {
      navigation.navigate('ItemDetail', { itemId: item.id });
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
          {myItems.length > 0 ? (
            myItems.map((item) => {
              const statusStyle = getStatus(item.estadoLote);
              const isPending = item.estadoLote === 'verificacion_pendiente';

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handlePress(item)}
                  className={`bg-white rounded-2xl p-3 mb-4 shadow-sm shadow-slate-100 flex-row items-center ${isPending ? 'border border-amber-100' : ''}`}
                  activeOpacity={0.75}
                >
                  {/* Imagen */}
                  <View className="relative">
                    <Image
                      source={{ uri: item.image || item.producto?.image }}
                      className={`w-16 h-16 rounded-2xl bg-slate-100 ${isPending ? 'opacity-60' : ''}`}
                      resizeMode="cover"
                    />
                    {isPending && (
                      <View className="absolute inset-0 rounded-2xl items-center justify-center">
                        <Feather name="clock" size={20} color="#d97706" />
                      </View>
                    )}
                  </View>

                  {/* Contenido central */}
                  <View className="flex-1 ml-4 justify-center">
                    <View className="flex-row items-center mb-1">
                      <View className={`px-2 py-0.5 rounded-md mr-2 ${statusStyle.bg}`}>
                        <Text className={`text-[8px] font-bold uppercase tracking-widest ${statusStyle.text}`}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      {!isPending && item.pieceNumber ? (
                        <Text className="text-xs text-slate-500 font-medium">{item.pieceNumber}</Text>
                      ) : null}
                    </View>

                    <Text className="text-base font-bold text-slate-800 mb-0.5" numberOfLines={1}>
                      {item.title}
                    </Text>

                    {isPending ? (
                      <Text className="text-xs text-amber-600">
                        Awaiting expert inspection
                      </Text>
                    ) : (
                      <Text className="text-xs text-slate-400">
                        {'Base: $' + (item.precioBase?.toLocaleString('en-US') ?? '—')}
                      </Text>
                    )}
                  </View>

                  {/* Ícono derecha */}
                  <View className="ml-2 pl-2">
                    <Feather
                      name={isPending ? 'chevron-right' : 'chevron-right'}
                      size={16}
                      color={isPending ? '#d97706' : '#94a3b8'}
                    />
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

        {/* Botón nuevo ítem */}
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
