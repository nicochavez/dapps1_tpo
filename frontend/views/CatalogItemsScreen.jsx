import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import Footer from '../components/Footer';

import { AuthContext } from '../context/AuthContext';
import { getCatalogos, buildImageUrl } from '../services/api';

// Adapta un item del catálogo (backend) al shape que usa esta pantalla.
function mapItem(it) {
  return {
    id: it.identificador,
    numeroPieza: it.numeroPieza,
    estadoLote: it.estadoLote,
    subastado: it.subastado,
    currentBid: it.currentBid,
    precioBase: it.precioBase,
    comision: it.comision,
    importeAdjudicado: it.importeAdjudicado,
    producto: {
      image: buildImageUrl(it.imagenPrincipal),
      descripcionCatalogo: it.descripcion,
    },
  };
}

// ─── Regla de negocio de categorías ─────────────────────────────────────────
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

// Formatea un precio: si es número lo localiza, si es string (enmascarado) lo muestra tal cual
const formatPrice = (value) => {
  if (value === null || value === undefined) return '$ —,—';
  if (typeof value === 'string') return value;
  return `$${Number(value).toLocaleString('en-US')}`;
};

export default function CatalogItemsScreen({ route, navigation }) {
  const catalogId = route?.params?.catalogId;
  const { user: currentUser } = useContext(AuthContext);

  const [activeCatalog, setActiveCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  // silent=true: refresco de polling sin spinner ni alertas (no interrumpe la UI).
  const cargar = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getCatalogos(currentUser?.token);
      const found = (data || []).find(c => String(c.identificador) === String(catalogId));
      setActiveCatalog(found
        ? { ...found, id: found.identificador, image: buildImageUrl(found.image), totalItems: found.cantidadItems }
        : null);
    } catch (error) {
      if (!silent) Alert.alert('No se pudo cargar el catálogo', error.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [catalogId, currentUser?.token]);

  // Recarga al enfocar + polling cada 5s para ver en tiempo real los cambios de lote
  // (lote actual, vendidos, cierre) que hace el scheduler del backend.
  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(() => cargar(true), 5000);
      return () => clearInterval(intervalo);
    }, [cargar])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (!activeCatalog) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <Text className="text-slate-500 font-bold">Catalog not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 p-3 bg-purple-100 rounded-xl">
          <Text className="text-[#7C3AED] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Evaluación de acceso ─────────────────────────────────────────────────
  const requiredCategory = activeCatalog.subasta?.categoria;
  const isLoggedIn       = !!currentUser;
  const categoryOk       = isLoggedIn && hasEnoughCategory(currentUser.category, requiredCategory);
  // Los precios se ven con solo estar registrado; la categoria solo limita el pujar.
  const canAccessPrices  = isLoggedIn;
  const lockReason       = !isLoggedIn ? 'sign-in' : !categoryOk ? 'category' : null;
  const requiredLabel    = requiredCategory
    ? requiredCategory.charAt(0).toUpperCase() + requiredCategory.slice(1)
    : '—';
  // ────────────────────────────────────────────────────────────────────────

  // Items ordenados, con precios enmascarados si no tiene acceso
  const MASKED = '$ \u2014,\u2014';
  const catalogItems = (activeCatalog.items || [])
    .map(mapItem)
    .sort((l, r) => Number(l.numeroPieza ?? 0) - Number(r.numeroPieza ?? 0))
    .map(item => canAccessPrices ? item : {
      ...item,
      currentBid:        MASKED,
      precioBase:        MASKED,
      comision:          MASKED,
      importeAdjudicado: MASKED,
    });

  // Estado general de la subasta
  const statusDb      = activeCatalog.subasta?.estado || 'pendiente';
  const isLive        = statusDb === 'abierta';
  const isEnded       = statusDb === 'cerrada' || statusDb === 'finalizada';
  const statusDisplay = isLive ? 'LIVE' : isEnded ? 'ENDED' : 'UPCOMING';

  const statusColors = isLive
    ? { bg: 'bg-red-500',   dot: true  }
    : isEnded
    ? { bg: 'bg-slate-500', dot: false }
    : { bg: 'bg-blue-500',  dot: false };

  const statusIcon = isLive ? null : isEnded ? 'flag' : 'calendar';

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View className="relative w-full h-80">
          <Image
            source={{ uri: activeCatalog.image || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.82)']}
            locations={[0, 0.4, 1]}
            className="absolute inset-0"
          />

          {/* Botón back */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-4 left-4 bg-black/30 rounded-full p-2"
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>

          {/* Contenido inferior del hero */}
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className={`flex-row items-center px-3 py-1.5 rounded-full ${statusColors.bg}`}>
                {statusColors.dot && <View className="w-2 h-2 rounded-full bg-white mr-2" />}
                {statusIcon && <Feather name={statusIcon} size={11} color="white" style={{ marginRight: 6 }} />}
                <Text className="text-white text-[11px] font-bold tracking-widest uppercase">
                  {statusDisplay}
                </Text>
              </View>
              <View className="flex-row items-center bg-white/15 px-3 py-1.5 rounded-full">
                <Feather name="layers" size={12} color="white" style={{ marginRight: 5 }} />
                <Text className="text-white text-[11px] font-bold">{activeCatalog.totalItems} Lots</Text>
              </View>
            </View>

            <Text className="text-white text-2xl font-extrabold leading-tight mb-3" numberOfLines={2}>
              {activeCatalog.descripcion}
            </Text>

            <View className="flex-row items-center flex-wrap gap-y-1">
              {requiredCategory && (
                <View className="flex-row items-center mr-4">
                  <Feather name="shield" size={12} color="rgba(255,255,255,0.7)" style={{ marginRight: 5 }} />
                  <Text className="text-white/75 text-xs font-medium capitalize">{requiredLabel}+</Text>
                </View>
              )}
              {(activeCatalog.subasta?.fecha || activeCatalog.subasta?.hora) && (
                <View className="flex-row items-center">
                  <Feather name="clock" size={12} color="rgba(255,255,255,0.7)" style={{ marginRight: 5 }} />
                  <Text className="text-white/75 text-xs font-medium">
                    {[activeCatalog.subasta?.fecha, activeCatalog.subasta?.hora].filter(Boolean).join(' \u00b7 ')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── BANNER DE ACCESO RESTRINGIDO ── */}
        {lockReason && (
          <View className="mx-4 mt-4 rounded-2xl overflow-hidden">
            {lockReason === 'sign-in' ? (
              <View className="bg-slate-800 flex-row items-start p-4">
                <View className="bg-white/10 p-2 rounded-full mr-3">
                  <Feather name="lock" size={16} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm mb-1">Sign in to see prices</Text>
                  <Text className="text-white/65 text-xs leading-5">
                    You need an account to view lot prices and place bids on this auction.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="mt-3 self-start bg-white px-4 py-2 rounded-xl"
                  >
                    <Text className="text-slate-800 font-bold text-xs">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="bg-amber-50 border border-amber-200 flex-row items-start p-4">
                <View className="bg-amber-100 p-2 rounded-full mr-3">
                  <Feather name="shield" size={16} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-amber-800 font-bold text-sm mb-1">
                    {requiredLabel} membership required
                  </Text>
                  <Text className="text-amber-700 text-xs leading-5">
                    Your current category{' '}
                    <Text className="font-bold">({currentUser?.category ?? '\u2014'})</Text>
                    {' '}doesn't meet the minimum to bid. Upgrade to{' '}
                    <Text className="font-bold">{requiredLabel}</Text>
                    {' '}or above to unlock bidding.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── LISTA DE ITEMS — renderizado unificado ── */}
        <View className="px-5 pt-8 pb-10">
          <Text className="text-lg font-bold text-slate-800 mb-4">
            {isLive ? 'Live Auction Order' : 'Auction Lots'}
          </Text>

          {catalogItems.map((item, index) => {
            const lotState = item.estadoLote || (item.subastado === 'si' ? 'subastado' : 'pendiente');
            const isActive = lotState === 'en_puja';
            const isSold   = lotState === 'subastado';
            const lotNumber = item.numeroPieza ?? index + 1;

            // Precio a mostrar según estado del lote
            const displayPrice = isSold || isActive
              ? formatPrice(item.currentBid ?? item.importeAdjudicado)
              : formatPrice(item.precioBase);

            const priceLabel = isSold ? 'Winning Bid' : isActive ? 'Current Ask' : 'Starting Bid';

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('ItemDetail', {
                  catalogoId: activeCatalog.id,
                  itemId: item.id,
                  subastaId: activeCatalog.subasta?.identificador,
                  subastaInfo: activeCatalog.subasta,
                  estadoLote: item.estadoLote,
                  catalogDescripcion: activeCatalog.descripcion,
                  catalogImage: activeCatalog.image,
                })}
                className={`rounded-3xl px-4 py-4 mb-4 flex-row items-center relative overflow-hidden ${
                  isActive
                    ? 'bg-purple-50 border-2 border-[#7C3AED] shadow-md shadow-purple-200 min-h-36'
                    : isSold
                    ? 'bg-slate-100 border border-slate-200 opacity-80 min-h-28'
                    : 'bg-white border border-slate-100 shadow-sm shadow-slate-200 min-h-28'
                }`}
              >
                {/* Número de lote */}
                <View className="absolute top-3 left-3 z-10">
                  <View className={`px-2.5 py-1 rounded-full border ${
                    isActive ? 'bg-white/90 border-[#7C3AED]/20' : 'bg-white/80 border-slate-200'
                  }`}>
                    <Text className={`text-[10px] font-semibold tracking-widest uppercase ${
                      isActive ? 'text-[#7C3AED]' : 'text-slate-400'
                    }`}>
                      Lot {lotNumber}
                    </Text>
                  </View>
                </View>

                {/* Imagen */}
                <View className="mr-4 relative">
                  <Image
                    source={{ uri: item.producto?.image || 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8' }}
                    className="w-20 h-20 rounded-2xl bg-slate-200"
                    resizeMode="cover"
                  />
                  {isSold && (
                    <View className="absolute inset-0 bg-black/40 rounded-2xl items-center justify-center">
                      <Text className="text-white font-bold text-xs tracking-wider uppercase -rotate-12">Sold</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View className="flex-1 justify-center min-h-20">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text
                      className={`font-bold flex-1 mr-2 text-base ${isActive ? 'text-[#7C3AED]' : 'text-slate-800'}`}
                      numberOfLines={1}
                    >
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
                      {isSold
                        ? `Ended ${activeCatalog.subasta?.fecha || ''}`
                        : isActive
                        ? 'Bidding now'
                        : activeCatalog.subasta?.fecha || 'Upcoming'}
                    </Text>
                  </View>

                  <View className="flex-row items-end justify-between mt-auto">
                    <View>
                      <Text className="text-[10px] text-slate-400 font-medium mb-0.5 uppercase tracking-wider">
                        {priceLabel}
                      </Text>
                      <Text className={`font-bold ${
                        canAccessPrices
                          ? isActive ? 'text-lg text-[#7C3AED]' : isSold ? 'text-sm text-slate-600' : 'text-sm text-slate-800'
                          : 'text-sm text-slate-300'
                      }`}>
                        {displayPrice}
                      </Text>
                    </View>

                    <View className={`px-3 py-1.5 rounded-lg border ${
                      isActive ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <Text className={`font-bold text-[10px] uppercase tracking-wide ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}>
                        {isActive ? 'Join' : 'View'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
      <Footer />
    </View>
  );
}
