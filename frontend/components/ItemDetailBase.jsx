import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * ItemDetailBase
 * Componente base compartido por LiveView, UpcomingView y EndedView.
 * Renderiza: back, imágenes, metadatos, descripción y banner de acceso.
 * Recibe `children` para que cada sub-componente inyecte su sección de precio/puja.
 */
export default function ItemDetailBase({
  item,
  parentCatalog,
  navigation,
  canAccessPrices,
  lockReason,
  requiredLabel,
  currentUser,
  isOwner,
  won,          // true si el usuario ganó este item (vista de solo lectura)
  badgeColor,   // color del badge de estado (ej: 'bg-red-500/90')
  badgeLabel,   // texto del badge (ej: 'Live Auction')
  children,     // sección específica de cada estado (precio, puja, historial...)
}) {
  const fallbackImage = 'https://ui-avatars.com/api/?name=Item&background=e2e8f0&color=94a3b8';
  // Si el item trae una galeria completa (producto real), la usamos; si no, caemos
  // al esquema original main + catalogo (flujo del postor con data estatica).
  const galleryImages = (item?.producto?.images && item.producto.images.length > 0)
    ? item.producto.images.filter(Boolean)
    : [item?.producto?.image || parentCatalog?.image || fallbackImage, parentCatalog?.image].filter(Boolean);
  const mainImage    = galleryImages[0] || fallbackImage;
  const [activeImage, setActiveImage] = useState(mainImage);

  const lotLabel      = item?.numeroPieza ? `LOT ${item.numeroPieza}` : item?.pieceNumber || 'LOT';
  const catalogLabel  = parentCatalog?.descripcion || 'Unknown catalog';
  const categoryLabel = parentCatalog?.subasta?.categoria || 'general';
  const description   = item?.producto?.descripcionCompleta || 'No description available.';

  return (
    <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>

      {/* Botón back */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="mb-4 self-start flex-row items-center"
      >
        <Feather name="arrow-left" size={18} color="#7C3AED" />
        <Text className="text-[#7C3AED] font-bold text-sm ml-1">Back</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text className="text-2xl font-bold text-slate-800 mb-4">
        {item?.producto?.descripcionCatalogo || 'Item details'}
      </Text>

      {/* Imágenes */}
      <View className="mb-6">
        <View className="relative mb-3">
          <Image
            source={{ uri: activeImage }}
            className="w-full h-56 rounded-3xl bg-slate-200"
            resizeMode="cover"
          />
          <View className={`absolute top-4 left-4 ${badgeColor} px-3 py-1.5 rounded-full flex-row items-center`}>
            <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{badgeLabel}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {galleryImages.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveImage(img)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 mr-3 ${
                activeImage === img ? 'border-[#7C3AED]' : 'border-transparent'
              }`}
            >
              <Image source={{ uri: img }} className="w-full h-full bg-slate-200" resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Metadatos */}
      <View className="flex-row flex-wrap items-center justify-between mb-8">
        <View className="flex-row mb-3 w-full justify-between">
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-[#7C3AED] text-[10px] font-bold tracking-widest uppercase">{lotLabel}</Text>
          </View>
          <View className="bg-[#a78bfa] px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
              Category: {categoryLabel}
            </Text>
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

      {/* Cartel de ganador (solo lectura) */}
      {won && (
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex-row items-center">
          <View className="bg-emerald-500 p-2 rounded-full mr-3">
            <Feather name="award" size={16} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-emerald-700 font-bold text-sm mb-0.5">You won this item</Text>
            <Text className="text-emerald-600 text-xs leading-5">
              Congratulations! This lot was adjudicated to you. This is a read-only view of your won item.
            </Text>
          </View>
        </View>
      )}

      {/* Cartel de dueño */}
      {isOwner && (
        <View className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex-row items-center">
          <View className="bg-[#7C3AED] p-2 rounded-full mr-3">
            <Feather name="user-check" size={16} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-[#7C3AED] font-bold text-sm mb-0.5">You own this item</Text>
            <Text className="text-purple-500 text-xs leading-5">
              You are viewing your own listing. Bidding is not available for your own items.
            </Text>
          </View>
        </View>
      )}

      {/* Descripción */}
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <Text className="text-lg font-light text-slate-800 mb-4">Description</Text>
        <Text className="text-slate-500 leading-6 text-sm">{description}</Text>
      </View>

      {/* Datos de arte/diseño (RF-15): artista/diseñador, fecha de la obra y reseña histórica.
          Solo se muestra si el producto tiene alguno de estos datos cargados. */}
      {(item?.producto?.artista || item?.producto?.fechaObra || item?.producto?.resenia) && (
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
          <Text className="text-lg font-light text-slate-800 mb-4">Artwork details</Text>

          {item?.producto?.artista ? (
            <View className="flex-row items-start mb-3">
              <Feather name="user" size={15} color="#7C3AED" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Artist / Designer</Text>
                <Text className="text-slate-700 text-sm">{item.producto.artista}</Text>
              </View>
            </View>
          ) : null}

          {item?.producto?.fechaObra ? (
            <View className="flex-row items-start mb-3">
              <Feather name="calendar" size={15} color="#7C3AED" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Date</Text>
                <Text className="text-slate-700 text-sm">{item.producto.fechaObra}</Text>
              </View>
            </View>
          ) : null}

          {item?.producto?.resenia ? (
            <View className="flex-row items-start">
              <Feather name="book-open" size={15} color="#7C3AED" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Historical review</Text>
                <Text className="text-slate-600 text-sm leading-6">{item.producto.resenia}</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Banner de acceso restringido */}
      {lockReason && (
        <View className="mb-6 rounded-2xl overflow-hidden">
          {lockReason === 'sign-in' ? (
            <View className="bg-slate-800 flex-row items-start p-4">
              <View className="bg-white/10 p-2 rounded-full mr-3">
                <Feather name="lock" size={16} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm mb-1">Sign in to see prices & bid</Text>
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

      {/* Sección específica de cada estado (precio, puja, historial...) */}
      {children}

    </ScrollView>
  );
}
