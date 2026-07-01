import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ItemDetailBase from './ItemDetailBase';
import BidHistorySection from './BidHistorySection';
import useLiveBids from '../hooks/useLiveBids';
import { conectarASubasta, realizarPuja } from '../services/api';

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$ —,—';
  if (typeof value === 'string') return value;
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

function useCountdown(closesAt) {
  const [secsLeft, setSecsLeft] = useState(null);

  useEffect(() => {
    if (!closesAt) { setSecsLeft(null); return; }

    const tick = () => {
      const diff = Math.max(0, Math.round((new Date(closesAt) - Date.now()) / 1000));
      setSecsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [closesAt]);

  return secsLeft;
}

function fmtCountdown(secs) {
  if (secs === null) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export default function ItemDetailLiveView(props) {
  const { item, canAccessPrices, currentUser, isOwner, subastaId, refreshBids } = props;
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing]     = useState(false);
  const [numeroPostor, setNumeroPostor] = useState(null);

  // bids viene del padre (gestiona fetch + polling); hook solo maneja WS para precios y countdown.
  const bids = props.bids ?? [];
  const { connected, currentBid, closesAt, itemClosed, resetTimer } =
    useLiveBids(subastaId, item?.id, item?.cierreProgramado ?? null);

  const secsLeft = useCountdown(closesAt);

  const lotState = item?.estadoLote || (item?.subastado === 'si' ? 'subastado' : 'pendiente');
  const effectiveLotState = itemClosed ? 'subastado' : lotState;

  const precioBase     = typeof item?.precioBase === 'number' ? item.precioBase : 0;
  const currentPriceNum = currentBid ?? (typeof item?.currentBid === 'number' ? item.currentBid : precioBase);

  const minBid = currentPriceNum + precioBase * 0.01;
  const maxBid = currentPriceNum + precioBase * 0.20;

  // Conectar a la subasta al montar (para poder pujar)
  useEffect(() => {
    if (!subastaId || !currentUser?.token || isOwner || !canAccessPrices) return;
    let cancelled = false;
    conectarASubasta(subastaId, currentUser.token)
      .then(res => {
        if (!cancelled) setNumeroPostor(res?.asistente?.numeroPostor ?? null);
      })
      .catch(() => {}); // ya conectado o espectador — no bloquear
    return () => { cancelled = true; };
  }, [subastaId, currentUser?.token, isOwner, canAccessPrices]);

  const handlePlaceBid = async () => {
    if (!canAccessPrices || effectiveLotState !== 'en_puja') return;
    const amount = Number(bidAmount);
    if (!bidAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Importe inválido', 'Ingresá un monto mayor a 0.');
      return;
    }
    try {
      setPlacing(true);
      await realizarPuja(subastaId, item.id, amount, null, currentUser.token);
      setBidAmount('');
      resetTimer();        // countdown optimista a 60s sin esperar el WS
      refreshBids?.();     // dispara re-fetch de historial en el padre
    } catch (e) {
      Alert.alert('Error al pujar', e.message);
    } finally {
      setPlacing(false);
    }
  };

  const canBid = canAccessPrices && !isOwner && effectiveLotState === 'en_puja';

  return (
    <ItemDetailBase {...props} badgeColor="bg-red-500/90" badgeLabel="Live Auction">

      {/* Precio actual + form de puja */}
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">

        {/* Header: etiqueta + badge Live */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Current Bid</Text>
          <View className="flex-row items-center gap-2">
            {numeroPostor && (
              <View className="bg-purple-100 px-2 py-0.5 rounded-full">
                <Text className="text-[#7C3AED] text-[9px] font-bold">Postor #{numeroPostor}</Text>
              </View>
            )}
            <View className="bg-[#a78bfa] px-2 py-0.5 rounded">
              <Text className="text-white text-[9px] font-bold uppercase tracking-wider">Live</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-baseline mb-4">
          <Text className={`text-4xl font-bold ${canAccessPrices ? 'text-slate-800' : 'text-slate-300'}`}>
            {formatPrice(currentBid ?? item?.currentBid ?? item?.precioBase)}
          </Text>
          {canAccessPrices && <Text className="text-xs text-slate-400 font-bold ml-2">USD</Text>}
        </View>

        {/* Countdown prominente — visible para todos (postor, dueño, espectador) */}
        {secsLeft !== null && (
          <View className={`rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between ${
            secsLeft <= 10 ? 'bg-red-50 border border-red-200' :
            secsLeft <= 30 ? 'bg-amber-50 border border-amber-200' :
            'bg-emerald-50 border border-emerald-200'
          }`}>
            <View className="flex-row items-center">
              <Feather
                name="clock"
                size={15}
                color={secsLeft <= 10 ? '#dc2626' : secsLeft <= 30 ? '#d97706' : '#059669'}
              />
              <Text className={`text-xs font-bold ml-2 ${
                secsLeft <= 10 ? 'text-red-700' :
                secsLeft <= 30 ? 'text-amber-700' :
                'text-emerald-700'
              }`}>
                {secsLeft <= 10 ? '¡Últimos segundos!' : secsLeft <= 30 ? 'Cerrando pronto' : 'Cierra en'}
              </Text>
            </View>
            <Text className={`text-2xl font-bold tabular-nums ${
              secsLeft <= 10 ? 'text-red-600' :
              secsLeft <= 30 ? 'text-amber-600' :
              'text-emerald-600'
            }`}>
              {fmtCountdown(secsLeft)}
            </Text>
          </View>
        )}

        {canBid ? (
          <>
            {/* Rango sugerido */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-[9px] text-slate-400">
                Mín: <Text className="font-bold text-slate-600">{formatPrice(minBid)}</Text>
              </Text>
              <Text className="text-[9px] text-slate-400">
                Máx: <Text className="font-bold text-slate-600">{formatPrice(maxBid)}</Text>
              </Text>
            </View>

            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Set Amount</Text>
            <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-4 flex-row items-center">
              <Text className="text-slate-500 font-medium mr-2">$</Text>
              <TextInput
                className="flex-1 text-slate-800 font-bold"
                placeholder="Enter bid amount"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
                editable={!placing}
              />
            </View>

            <TouchableOpacity
              onPress={handlePlaceBid}
              disabled={placing}
              className={`rounded-2xl py-4 items-center shadow-sm ${placing ? 'bg-slate-300' : 'bg-[#a78bfa] shadow-purple-200'}`}
            >
              <Text className="text-white font-bold text-base">
                {placing ? 'Enviando...' : 'Place Bid'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="bg-slate-100 rounded-2xl py-4 items-center border border-slate-200 border-dashed mt-4">
            <Feather name="lock" size={18} color="#cbd5e1" />
            <Text className="text-slate-400 text-sm font-medium mt-2">
              {isOwner
                ? 'You cannot bid on your own item'
                : effectiveLotState === 'subastado'
                ? 'This lot has closed'
                : 'Bidding restricted'}
            </Text>
          </View>
        )}
      </View>

      {/* Historial en tiempo real */}
      <BidHistorySection
        bids={bids}
        canAccessPrices={canAccessPrices}
        currentUserId={currentUser?.id}
        isLive
        connected={connected}
      />

    </ItemDetailBase>
  );
}
