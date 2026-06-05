import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemDetailLiveView from '../components/ItemDetailLiveView';
import ItemDetailUpcomingView from '../components/ItemDetailUpcomingView';
import ItemDetailEndedView from '../components/ItemDetailEndedView';

import itemsData from '../data/items.json';
import catalogsData from '../data/catalogs.json';

export default function ItemDetailScreen({ route, navigation }) {
  const itemId = route?.params?.itemId || 'i3';
  const item = itemsData.find(i => i.id === itemId);
  const parentCatalog = item ? catalogsData.find(c => c.id === item.catalogo) : null;
  const lotState = item?.estadoLote || (item?.subastado === 'si' ? 'subastado' : 'pendiente');

  const renderStateView = () => {
    if (lotState === 'en_puja') {
      return <ItemDetailLiveView item={item} parentCatalog={parentCatalog} navigation={navigation} />;
    }

    if (lotState === 'subastado') {
      return <ItemDetailEndedView item={item} parentCatalog={parentCatalog} navigation={navigation} />;
    }

    return <ItemDetailUpcomingView item={item} parentCatalog={parentCatalog} navigation={navigation} />;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">
      <Header />

      {item ? (
        renderStateView()
      ) : (
        <View className="flex-1 items-center justify-center px-6 py-16">
          <Text className="text-slate-500 font-bold">Item not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 rounded-xl bg-purple-100">
            <Text className="text-[#7C3AED] font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <Footer />
    </KeyboardAvoidingView>
  );
}
