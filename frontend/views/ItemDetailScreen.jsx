import React, { useContext } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemDetailLiveView from '../components/ItemDetailLiveView';
import ItemDetailUpcomingView from '../components/ItemDetailUpcomingView';
import ItemDetailEndedView from '../components/ItemDetailEndedView';

import itemsData from '../data/items.json';
import catalogsData from '../data/catalogs.json';
import { AuthContext } from '../context/AuthContext';

// ─── Regla de negocio de categorías ─────────────────────────────────────────
// Misma tabla que CatalogItemsScreen — mantener sincronizadas.
const CATEGORY_RANK = {
  comun:    0,
  especial: 1,
  plata:    2, silver:   2,
  oro:      3, gold:     3,
  platino:  4, platinum: 4,
  admin:    99,
};

const hasEnoughCategory = (userCategory, catalogCategory) => {
  const userRank     = CATEGORY_RANK[userCategory?.toLowerCase()]    ?? -1;
  const requiredRank = CATEGORY_RANK[catalogCategory?.toLowerCase()] ?? 0;
  return userRank >= requiredRank;
};
// ────────────────────────────────────────────────────────────────────────────

export default function ItemDetailScreen({ route, navigation }) {
  const { user: currentUser } = useContext(AuthContext);

  const itemId = route?.params?.itemId || 'i3';
  const item   = itemsData.find(i => i.id === itemId);
  const parentCatalog = item ? catalogsData.find(c => c.id === item.catalogo) : null;
  const lotState = item?.estadoLote || (item?.subastado === 'si' ? 'subastado' : 'pendiente');

  // ── Evaluación de acceso ─────────────────────────────────────────────────
  const requiredCategory = parentCatalog?.subasta?.categoria;
  const isLoggedIn       = !!currentUser;
  const isOwner          = isLoggedIn && String(currentUser.id) === String(item?.ownerId);
  const categoryOk       = isLoggedIn && hasEnoughCategory(currentUser.category, requiredCategory);
  const canAccessPrices  = isLoggedIn && categoryOk;

  // Motivo de bloqueo — se pasa a los sub-componentes para mostrar el banner
  const lockReason = !isLoggedIn ? 'sign-in' : !categoryOk ? 'category' : null;

  // Etiqueta legible de la categoría requerida
  const requiredLabel = requiredCategory
    ? requiredCategory.charAt(0).toUpperCase() + requiredCategory.slice(1)
    : '—';
  // ────────────────────────────────────────────────────────────────────────

  // El dueño del item siempre puede ver los precios de su propio item
  const MASKED = '$ —,—';
  const maskedItem = (canAccessPrices || isOwner)
    ? item
    : {
        ...item,
        currentBid:        MASKED,
        precioBase:        MASKED,
        comision:          MASKED,
        importeAdjudicado: MASKED,
      };

  const sharedProps = {
    item: maskedItem,
    parentCatalog,
    navigation,
    canAccessPrices,
    lockReason: isOwner ? null : lockReason,
    requiredLabel,
    currentUser,
    isOwner,
  };

  const renderStateView = () => {
    if (lotState === 'en_puja')   return <ItemDetailLiveView     {...sharedProps} />;
    if (lotState === 'subastado') return <ItemDetailEndedView    {...sharedProps} />;
    return                               <ItemDetailUpcomingView {...sharedProps} />;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      <Header />

      {item ? (
        renderStateView()
      ) : (
        <View className="flex-1 items-center justify-center px-6 py-16">
          <Text className="text-slate-500 font-bold">Item not found.</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-100"
          >
            <Text className="text-[#7C3AED] font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <Footer />
    </KeyboardAvoidingView>
  );
}
