import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ItemDetailBase from './ItemDetailBase';
import BidHistorySection from './BidHistorySection';
import useLiveBids from '../hooks/useLiveBids';
import { conectarASubasta, desconectarDeSubasta, miConexionSubasta, realizarPuja, nuevaIdempotencyKey } from '../services/api';

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
  const { item, canAccessPrices, bidEligible, currentUser, isOwner, subastaId, refreshBids, hasPendingMulta, hasVerifiedPayment, moneda } = props;
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing]     = useState(false);
  const [numeroPostor, setNumeroPostor] = useState(null);
  // true una vez que el usuario aceptó unirse y quedó conectado a esta subasta.
  const [joined, setJoined] = useState(false);
  // id de otra subasta viva donde el usuario ya está conectado (bloquea unirse acá), o null.
  const [otraSubastaId, setOtraSubastaId] = useState(null);
  // Motivo por el que no quedamos conectados (ej: ya conectado a otra subasta, o canceló el
  // alistamiento). Lo mostramos al pujar en vez del genérico "Debe conectarse antes de pujar".
  const [connectError, setConnectError] = useState(null);
  // Subasta para la que ya mostramos el alert de "unirse": evita re-preguntar en cada re-render.
  const promptedForRef = useRef(null);
  // Piso optimista: tras un 201 propio subimos el precio local sin esperar el WS,
  // así el próximo mínimo ya refleja nuestra puja y no se manda un importe viejo (→ 400).
  const [optimisticBid, setOptimisticBid] = useState(null);

  // bids viene del padre (gestiona fetch + polling); hook solo maneja WS para precios y countdown.
  const bids = props.bids ?? [];
  const { connected, currentBid, closesAt, itemClosed, resetTimer } =
    useLiveBids(subastaId, item?.id, item?.cierreProgramado ?? null);

  const secsLeft = useCountdown(closesAt);

  // Al llegar el countdown a 0, el backend cierra el lote en ~5s. Aceleramos el refresh
  // del padre para que re-lea estadoLote y esta vista cambie a ItemDetailEndedView.
  useEffect(() => {
    if (secsLeft !== 0) return;
    refreshBids?.();
    const id = setInterval(() => refreshBids?.(), 2500);
    return () => clearInterval(id);
  }, [secsLeft === 0]);

  const lotState = item?.estadoLote || (item?.subastado === 'si' ? 'subastado' : 'pendiente');
  const effectiveLotState = (itemClosed || secsLeft === 0) ? 'subastado' : lotState;

  const precioBase     = typeof item?.precioBase === 'number' ? item.precioBase : 0;
  const wsPrice = currentBid ?? (typeof item?.currentBid === 'number' ? item.currentBid : precioBase);
  // El mayor entre el precio del WS y nuestro piso optimista: si el WS aún no llegó
  // usamos nuestra última puja; si otro postor pujó más alto, gana el valor del WS.
  const currentPriceNum = Math.max(wsPrice, optimisticBid ?? 0);

  // Al cambiar de lote, descartar el piso optimista del item anterior.
  useEffect(() => { setOptimisticBid(null); }, [item?.id]);

  // Las subastas oro/platino no aplican los límites de +1%/+20%: basta con superar la oferta actual.
  const categoria = (props.parentCatalog?.subasta?.categoria || '').toLowerCase();
  const sinLimites = categoria === 'oro' || categoria === 'platino';

  const minBid = sinLimites ? currentPriceNum : currentPriceNum + precioBase * 0.01;
  const maxBid = sinLimites ? null : currentPriceNum + precioBase * 0.20;

  // Efectúa la conexión real a la subasta (tras aceptar el alert). Al finalizar los lotes,
  // el backend desconecta automáticamente a los asistentes.
  const joinAuction = useCallback(() => {
    if (!subastaId || !currentUser?.token) return;
    setConnectError(null);
    conectarASubasta(subastaId, currentUser.token)
      .then(res => {
        setNumeroPostor(res?.asistente?.numeroPostor ?? null);
        setJoined(true);
        setOtraSubastaId(null);
      })
      .catch(e => {
        // Ej: "Ya esta conectado a otra subasta". Guardamos el motivo real para mostrarlo al pujar.
        setJoined(false);
        setConnectError(e?.message || 'No se pudo unir a la subasta.');
      });
  }, [subastaId, currentUser?.token]);

  // Pide confirmación antes de conectarse: al aceptar queda ligado a ESTA subasta y no podrá
  // unirse a otra hasta que finalice. Al cancelar, no se conecta (podrá reintentar al pujar).
  const promptJoin = useCallback(() => {
    Alert.alert(
      'Unirse a la subasta',
      'Si te unís, quedarás conectado a esta subasta y no vas a poder conectarte a otra hasta que finalice. Cuando termine, se te desconectará automáticamente.\n\n¿Querés unirte para poder pujar?',
      [
        // Al cancelar no marcamos error de bloqueo: quedamos sin unir y volveremos a
        // preguntar cuando el usuario toque "Pujar".
        { text: 'Ahora no', style: 'cancel', onPress: () => {} },
        { text: 'Unirme', onPress: joinAuction },
      ],
      { cancelable: false },
    );
  }, [joinAuction]);

  // Avisa que ya está conectado a OTRA subasta viva y ofrece salir de esa para unirse a ésta.
  const promptSwitch = useCallback((otraSubastaId) => {
    Alert.alert(
      'Ya estás en otra subasta',
      `Estás conectado a la subasta #${otraSubastaId}. Sólo podés participar en una a la vez.\n\n¿Querés salir de esa y unirte a ésta?`,
      [
        {
          text: 'No, seguir en la otra',
          style: 'cancel',
          onPress: () => setConnectError(`Estás conectado a la subasta #${otraSubastaId}. Salí de esa para pujar acá.`),
        },
        {
          text: 'Salir y unirme',
          onPress: () => desconectarDeSubasta(otraSubastaId, currentUser.token)
            .then(joinAuction)
            .catch(e => setConnectError(e?.message || 'No se pudo cambiar de subasta.')),
        },
      ],
      { cancelable: false },
    );
  }, [currentUser?.token, joinAuction]);

  // Al entrar a la subasta en vivo (una vez por subasta), consultamos el estado real de conexión
  // y sólo entonces decidimos: entrar directo si ya estamos unidos, ofrecer cambiar si estamos
  // en otra, o preguntar si queremos unirnos. Así el alert no sale de más.
  useEffect(() => {
    if (!subastaId || !currentUser?.token || isOwner || !bidEligible) return;
    if (promptedForRef.current === subastaId) return; // ya resolvimos el estado para esta subasta
    promptedForRef.current = subastaId;

    let cancelled = false;
    setJoined(false);
    setNumeroPostor(null);
    setConnectError(null);

    miConexionSubasta(subastaId, currentUser.token)
      .then(estado => {
        if (cancelled) return;
        if (estado?.conectadoAqui) {
          // Ya estamos conectados a esta subasta: entramos directo, sin preguntar.
          setNumeroPostor(estado.numeroPostor ?? null);
          setJoined(true);
        } else if (estado?.conectadoEnOtra) {
          setOtraSubastaId(estado.conectadoEnOtra);
          promptSwitch(estado.conectadoEnOtra);
        } else {
          promptJoin();
        }
      })
      .catch(() => {
        // Si no pudimos leer el estado, caemos al comportamiento anterior: preguntar.
        if (!cancelled) promptJoin();
      });

    return () => { cancelled = true; };
  }, [subastaId, currentUser?.token, isOwner, bidEligible, promptJoin, promptSwitch]);

  // Puja mínima permitida. En oro/platino solo hay que superar la oferta actual (+1 mínimo);
  // en el resto, redondeada hacia arriba para no caer por debajo del límite +1%.
  const minBidAmount = sinLimites ? Math.floor(currentPriceNum) + 1 : Math.ceil(minBid);

  // Núcleo de la puja: valida, llama al backend y actualiza countdown/historial.
  const submitBid = async (amount) => {
    if (placing) return; // evita doble envío con el mismo importe (→ 400)
    if (!bidEligible || effectiveLotState !== 'en_puja') return;
    if (hasPendingMulta) {
      Alert.alert('Pending fines', 'You have pending fines. Pay them before placing a bid.');
      return;
    }
    if (!hasVerifiedPayment) {
      Alert.alert('Payment method required',
        'You need a verified payment method in this auction’s currency to place a bid.');
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      Alert.alert('Importe inválido', 'Ingresá un monto mayor a 0.');
      return;
    }
    // Si no estamos unidos a la subasta: si estamos conectados a otra, re-ofrecemos el cambio;
    // si el backend nos bloqueó por otro motivo, lo mostramos; si sólo cancelamos, re-preguntamos.
    if (!joined) {
      if (otraSubastaId) promptSwitch(otraSubastaId);
      else if (connectError) Alert.alert('No se pudo pujar', connectError);
      else promptJoin();
      return;
    }
    // Misma key para el intento y su reintento: si el primero sí entró pese al corte,
    // el backend devuelve la misma puja en vez de duplicarla (idempotencia).
    const idemKey = nuevaIdempotencyKey();
    const enviarPuja = () =>
      realizarPuja(subastaId, item.id, amount, null, currentUser.token, idemKey);

    try {
      setPlacing(true);
      try {
        await enviarPuja();
      } catch (e1) {
        // Corte de red (fetch rechazó sin respuesta HTTP → status undefined): reintentamos
        // UNA vez. Es seguro gracias a la idempotencia. Otros errores (400/etc.) se propagan.
        if (e1?.status === undefined) await enviarPuja();
        else throw e1;
      }
      setBidAmount('');
      setOptimisticBid(amount); // sube el piso local ya, sin esperar el WS
      resetTimer();        // countdown optimista a 60s sin esperar el WS
      refreshBids?.();     // dispara re-fetch de historial en el padre
    } catch (e) {
      // 400 = el importe quedó por debajo del mínimo (te superaron entre leer y pujar).
      if (e?.status === 400 || /importe|mínimo|minimo/i.test(e?.message || '')) {
        refreshBids?.();
        Alert.alert('Puja superada',
          'Otro postor pujó más alto o el mínimo cambió. Revisá el precio actual y volvé a intentar.');
      } else if (e?.status === undefined) {
        // Falló el request original Y el reintento: probablemente sin conexión real.
        // Reintentar a mano es seguro (misma pantalla, nueva key) gracias a la idempotencia.
        refreshBids?.();
        Alert.alert('Sin conexión',
          'No pudimos enviar tu puja. Verificá tu conexión e intentá de nuevo.');
      } else {
        Alert.alert('Error al pujar', e.message);
      }
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceBid = () => submitBid(Number(bidAmount));
  const handleBidMinimum = () => submitBid(minBidAmount);

  // Directo de la subasta (por ahora, YouTube genérico).
  const openLiveStream = () => {
    Linking.openURL('https://www.youtube.com').catch(() =>
      Alert.alert('No se pudo abrir el directo', 'Intentá nuevamente más tarde.'));
  };

  const canBid = bidEligible && !isOwner && effectiveLotState === 'en_puja'
    && !hasPendingMulta && hasVerifiedPayment;

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
          {canAccessPrices && moneda && <Text className="text-xs text-slate-400 font-bold ml-2">{moneda}</Text>}
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
            {/* Rango sugerido. En oro/platino no hay límites: solo superar la oferta actual. */}
            {sinLimites ? (
              <View className="mb-2">
                <Text className="text-[9px] text-slate-400">
                  Subasta <Text className="font-bold text-slate-600">{categoria}</Text>: sin límites.
                  {' '}Puja mayor a <Text className="font-bold text-slate-600">{formatPrice(currentPriceNum)}</Text>.
                </Text>
              </View>
            ) : (
              <View className="flex-row justify-between mb-2">
                <Text className="text-[9px] text-slate-400">
                  Mín: <Text className="font-bold text-slate-600">{formatPrice(minBid)}</Text>
                </Text>
                <Text className="text-[9px] text-slate-400">
                  Máx: <Text className="font-bold text-slate-600">{formatPrice(maxBid)}</Text>
                </Text>
              </View>
            )}

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

            {/* Puja rápida por el mínimo permitido. No aplica en oro/platino (sin límites). */}
            {!sinLimites && (
              <TouchableOpacity
                onPress={handleBidMinimum}
                disabled={placing}
                className={`rounded-2xl py-3 items-center mt-2 border ${placing ? 'border-slate-200' : 'border-[#a78bfa] bg-purple-50'}`}
              >
                <Text className={`font-bold text-sm ${placing ? 'text-slate-300' : 'text-[#7C3AED]'}`}>
                  Bid minimum ({formatPrice(minBidAmount)})
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View className="bg-slate-100 rounded-2xl py-4 items-center border border-slate-200 border-dashed mt-4">
            <Feather name="lock" size={18} color="#cbd5e1" />
            <Text className="text-slate-400 text-sm font-medium mt-2">
              {isOwner
                ? 'You cannot bid on your own item'
                : effectiveLotState === 'subastado'
                ? 'This lot has closed'
                : hasPendingMulta
                ? 'You have pending fines. Pay them to bid.'
                : bidEligible && !hasVerifiedPayment
                ? 'You need a verified payment method to bid.'
                : 'Bidding restricted'}
            </Text>
          </View>
        )}
      </View>

      {/* Directo de la subasta (YouTube) — visible para todos en la vista en vivo */}
      <TouchableOpacity
        onPress={openLiveStream}
        className="flex-row items-center justify-center bg-red-600 rounded-2xl py-3.5 mb-6 shadow-sm shadow-red-200"
      >
        <Feather name="youtube" size={18} color="white" />
        <Text className="text-white font-bold text-sm ml-2">Watch live stream</Text>
      </TouchableOpacity>

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
