import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { createProducto } from '../services/api';

function SectionTitle({ label }) {
  return (
    <Text className="font-bold text-[10px] text-slate-400 mb-3 tracking-widest uppercase">
      {label}
    </Text>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-slate-50">
      <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-1">{label}</Text>
      <Text className="text-[13px] font-medium text-slate-700 flex-1 text-right">{value}</Text>
    </View>
  );
}

export default function CreateObjectStep3({ route, navigation }) {
  const { itemData, photos } = route.params || {};
  const { user } = useContext(AuthContext);

  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const submittingRef = useRef(false);

  // [DEBUG-TEMP] detectar re-montajes de la pantalla
  console.log('[Step3] RENDER');
  useEffect(() => {
    console.log('[Step3] MOUNT');
    return () => console.log('[Step3] UNMOUNT');
  }, []);

  const photoCount = Object.values(photos || {}).filter(Boolean).length;
  const isArtOrDesigner = !!(itemData?.artistName);

  // RF-45 / RF-46: payload completo + declaración jurada → POST real al backend
  const handleConfirmAndSubmit = async () => {
    // Guard síncrono: evita envíos re-entrantes (el disabled por isLoading no se
    // commitea a tiempo y se colaban múltiples createProducto en paralelo).
    if (submittingRef.current) {
      console.log('[submit] ignorado: ya hay un envío en curso');
      return;
    }
    submittingRef.current = true;
    setIsLoading(true);
    try {
      const producto = await createProducto(itemData, photos, user?.token);
      navigation.navigate('AuctionUnderReview', { productoId: producto?.identificador });
    } catch (error) {
      Alert.alert('No se pudo enviar el artículo', error.message);
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">

      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-2 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8" disabled={isLoading}>
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800">Create Object</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAuction')} className="w-8 items-end" disabled={isLoading}>
          <Feather name="x" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <Text className="text-3xl font-light text-slate-800 mt-4 mb-2">Review & Confirm</Text>
        <Text className="text-slate-500 mb-8">Verify your item before sending it for inspection.</Text>

        {/* STEPPER */}
        <View className="flex-row items-center justify-between mb-8 px-4">
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Feather name="check" size={14} color="#64748b" />
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Details</Text>
          </View>
          <View className="flex-1 h-[1px] bg-[#7C3AED] mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mb-2">
              <Feather name="check" size={14} color="#64748b" />
            </View>
            <Text className="text-[10px] text-slate-500 font-medium">Photos</Text>
          </View>
          <View className="flex-1 h-[1px] bg-[#7C3AED] mx-2 -mt-4" />
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-[#7C3AED] items-center justify-center mb-2">
              <Text className="text-white font-bold text-xs">3</Text>
            </View>
            <Text className="text-[10px] text-[#7C3AED] font-bold">Review</Text>
          </View>
        </View>

        {/* ── ITEM SUMMARY (RF-45) ─────────────────────── */}
        <SectionTitle label="Item Summary" />
        <View className="bg-white rounded-3xl p-4 mb-6 shadow-sm shadow-slate-100 border border-slate-100">

          {/* Foto principal + contador */}
          <View className="relative mb-4">
            {photos?.main ? (
              <Image
                source={{ uri: photos.main }}
                className="w-full h-44 rounded-2xl bg-slate-100"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-44 rounded-2xl bg-slate-100 items-center justify-center">
                <MaterialCommunityIcons name="gavel" size={64} color="#7C3AED" />
              </View>
            )}
            <View className="absolute bottom-2 right-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
              <Feather name="image" size={11} color="white" />
              <Text className="text-white text-[10px] font-bold ml-1">{photoCount} photos</Text>
            </View>
          </View>

          {/* Badges */}
          <View className="flex-row flex-wrap mb-3">
            {itemData?.category ? (
              <View className="bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 mr-2 mb-2">
                <Text className="text-slate-600 text-[10px] font-bold uppercase">{itemData.category}</Text>
              </View>
            ) : null}
            {itemData?.subCategory ? (
              <View className="bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 mr-2 mb-2">
                <Text className="text-slate-600 text-[10px] font-bold uppercase">{itemData.subCategory}</Text>
              </View>
            ) : null}
            {itemData?.condition ? (
              <View className={`px-2 py-1.5 rounded-lg border mr-2 mb-2 ${itemData.condition === 'New' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
                <Text className={`text-[10px] font-bold uppercase ${itemData.condition === 'New' ? 'text-[#7C3AED]' : 'text-orange-600'}`}>
                  {itemData.condition}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Datos del ítem */}
          <DetailRow label="Title" value={itemData?.title} />

          {/* Campos de arte / diseño (RF-15) */}
          {isArtOrDesigner && (
            <>
              <DetailRow label="Artist / Designer" value={itemData?.artistName} />
              <DetailRow label="Date / Period" value={itemData?.itemDate} />
            </>
          )}

          {/* Descripción */}
          <View className="pt-3">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</Text>
            <Text className="text-[13px] text-slate-600 leading-5">{itemData?.description || '—'}</Text>
          </View>

          {/* Provenance (solo arte / diseño) — RF-15 */}
          {isArtOrDesigner && itemData?.itemHistory ? (
            <View className="pt-3 mt-1 border-t border-slate-50">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Provenance & History</Text>
              <Text className="text-[13px] text-slate-600 leading-5">{itemData.itemHistory}</Text>
            </View>
          ) : null}
        </View>

        {/* ── QUÉ PASA DESPUÉS (RF-48, RF-50, RF-51) ──── */}
        <SectionTitle label="What happens next" />
        <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
          <View className="flex-row items-center mb-3">
            <Feather name="search" size={16} color="#3b82f6" />
            <Text className="font-bold text-xs text-blue-600 ml-2">Expert Inspection</Text>
          </View>
          <Text className="text-[11px] text-blue-600/80 leading-5 mb-2">
            Our team will review the item. You will be notified with the result (accepted or rejected) along with the reasons.
          </Text>
          <Text className="text-[11px] text-blue-600/80 leading-5">
            If accepted, we will inform you of the auction date, location, suggested base price and applicable commissions.
            You may accept or reject these terms before the item goes live.
          </Text>
        </View>

        {/* ── SEGURO (RF-54, RF-56, RF-57) ────────────── */}
        <SectionTitle label="Insurance" />
        <View className="bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-100">
          <View className="flex-row items-center mb-3">
            <Feather name="shield" size={16} color="#059669" />
            <Text className="font-bold text-xs text-emerald-700 ml-2">Asset Insurance Policy</Text>
          </View>
          <Text className="text-[11px] text-emerald-700/80 leading-5 mb-2">
            Once the base price is set, a mandatory insurance policy will be contracted on your behalf, covering the item from the moment it enters our depot.
          </Text>
          <Text className="text-[11px] text-emerald-700/80 leading-5 mb-2">
            A single policy may cover multiple pieces from the same owner.
          </Text>
          <Text className="text-[11px] text-emerald-700/80 leading-5">
            You will be able to consult the depot location, the active policy, and the insurance company's contact details to increase coverage if needed.
          </Text>
        </View>

        {/* ── ORIGEN LÍCITO (RF-47) ────────────────────── */}
        <SectionTitle label="Lawful Origin" />
        <View className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-100">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="file-document-outline" size={16} color="#d97706" />
            <Text className="font-bold text-xs text-amber-700 ml-2">Documentation</Text>
          </View>
          <Text className="text-[11px] text-amber-700/80 leading-5">
            If our team requires additional proof of lawful origin during the inspection process, you will be contacted to provide it. Failure to do so may result in rejection.
          </Text>
        </View>

        {/* ── DECLARACIÓN JURADA (RF-46) ───────────────── */}
        <TouchableOpacity
          className="flex-row items-start mb-8 pr-4"
          onPress={() => !isLoading && setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View className={`w-5 h-5 rounded border mt-0.5 ${isChecked ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
            {isChecked && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-slate-500 text-xs leading-5 flex-1">
            {'I declare that this item is my property, that it has no legal impediments to be auctioned, and that all information provided is accurate and truthful. I accept the '}
            <Text className="text-[#7C3AED] underline">Terms of Service</Text>
            {'.'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FOOTER */}
      <View className="flex-row px-6 py-4 bg-white border-t border-slate-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          className="flex-1 py-4 border border-slate-200 rounded-2xl items-center flex-row justify-center mr-2"
        >
          <Feather name="chevron-left" size={16} color={isLoading ? '#cbd5e1' : '#64748b'} />
          <Text className={`font-bold text-sm ml-1 ${isLoading ? 'text-slate-300' : 'text-slate-600'}`}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirmAndSubmit}
          disabled={!isChecked || isLoading}
          className={`flex-[2] py-4 rounded-2xl items-center flex-row justify-center shadow-sm ml-2 ${isChecked && !isLoading ? 'bg-[#a78bfa] shadow-purple-200' : 'bg-slate-300'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="send" size={16} color="white" />
              <Text className="font-bold text-white text-sm ml-2">Submit for Review</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
