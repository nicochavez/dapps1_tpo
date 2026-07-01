import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { getPropuesta, aceptarPropuesta, rechazarPropuesta } from '../services/api';

function Step({ icon, title, body, isLast }) {
  return (
    <View className="flex-row items-start">
      <View className="items-center mr-4">
        <View className="w-9 h-9 rounded-full bg-purple-100 items-center justify-center">
          <Feather name={icon} size={16} color="#7C3AED" />
        </View>
        {!isLast && <View className="w-[1px] flex-1 bg-slate-100 mt-2 mb-2 min-h-[24px]" />}
      </View>
      <View className="flex-1 pb-6">
        <Text className="text-sm font-bold text-slate-700 mb-1">{title}</Text>
        <Text className="text-xs text-slate-400 leading-5">{body}</Text>
      </View>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
      <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</Text>
      <Text className="text-[13px] font-bold text-slate-700">{value ?? '—'}</Text>
    </View>
  );
}

export default function AuctionUnderReviewScreen({ route, navigation }) {
  const { productoId } = route.params || {};
  const { token } = useContext(AuthContext);

  const [propuesta, setPropuesta] = useState(null);
  const [loading, setLoading] = useState(!!productoId);
  const [acting, setActing] = useState(false);

  const cargar = async () => {
    if (!productoId) return;
    try {
      setLoading(true);
      setPropuesta(await getPropuesta(productoId, token));
    } catch (error) {
      Alert.alert('No se pudo cargar el artículo', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [productoId]);

  const responder = async (accion) => {
    try {
      setActing(true);
      if (accion === 'aceptar') {
        await aceptarPropuesta(productoId, token);
        // Aceptado por ambas partes: ya es un lote de subasta, se ve como tal.
        navigation.navigate('ItemDetail', { productoId });
        return;
      }
      await rechazarPropuesta(productoId, token);
      await cargar();
    } catch (error) {
      Alert.alert('No se pudo registrar tu respuesta', error.message);
    } finally {
      setActing(false);
    }
  };

  const estado = propuesta?.estado;
  const esPropuesta = estado === 'propuesta_enviada';
  const esRechazado = estado === 'rechazado' || estado === 'rechazado_por_usuario';

  const titulo =
    esPropuesta ? 'Proposal Received'
    : estado === 'aceptado_por_usuario' || estado === 'incluido_en_subasta' ? 'Proposal Accepted'
    : estado === 'rechazado' || estado === 'rechazado_por_usuario' ? 'Item Rejected'
    : 'Item Under Inspection';

  const subtitulo =
    esPropuesta ? 'We accepted your item. Review the auction terms below and accept or decline them.'
    : estado === 'aceptado_por_usuario' || estado === 'incluido_en_subasta' ? 'You accepted the terms. Your item will be included in the auction.'
    : estado === 'rechazado' ? 'Your item was rejected during inspection. Check your notifications for the reason and return charge.'
    : estado === 'rechazado_por_usuario' ? 'You declined the proposed terms. The item will not be auctioned.'
    : 'Your item has been received and will be reviewed by our experts.';

  const iconColor =
    esPropuesta ? '#7C3AED'
    : estado === 'aceptado_por_usuario' || estado === 'incluido_en_subasta' ? '#059669'
    : estado === 'rechazado' || estado === 'rechazado_por_usuario' ? '#dc2626'
    : '#d97706';

  const iconName =
    esPropuesta ? 'gavel'
    : estado === 'aceptado_por_usuario' || estado === 'incluido_en_subasta' ? 'check-circle-outline'
    : estado === 'rechazado' || estado === 'rechazado_por_usuario' ? 'close-circle-outline'
    : 'file-search-outline';

  return (
    <View className="flex-1 bg-white">

      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800 ml-4">Item Submitted</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          <View className="w-24 h-24 rounded-full items-center justify-center mx-auto mb-8 mt-4" style={{ backgroundColor: iconColor + '1A' }}>
            <MaterialCommunityIcons name={iconName} size={40} color={iconColor} />
          </View>

          <Text className="text-3xl font-bold text-center text-slate-800 mb-3 px-4 leading-10">
            {titulo}
          </Text>
          <Text className="text-center text-slate-400 mb-10 px-4 leading-6 text-sm">
            {subtitulo}
          </Text>

          {esPropuesta ? (
            <>
              <Text className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">
                Auction terms
              </Text>
              <View className="bg-white rounded-3xl p-4 mb-8 border border-slate-100 shadow-sm shadow-slate-100">
                <DetailRow label="Item" value={propuesta?.titulo} />
                <DetailRow label="Base price" value={propuesta?.precioBase != null ? `$${propuesta.precioBase}` : null} />
                <DetailRow label="Commission" value={propuesta?.comision != null ? `$${propuesta.comision}` : null} />
                <DetailRow label="Date" value={propuesta?.subasta?.fecha} />
                <DetailRow label="Time" value={propuesta?.subasta?.hora} />
                <DetailRow label="Location" value={propuesta?.subasta?.lugar} />
              </View>
            </>
          ) : esRechazado ? (
            <>
              <Text className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">
                Rejection details
              </Text>
              <View className="bg-red-50 rounded-3xl p-5 mb-8 border border-red-100">
                <View className="flex-row items-center mb-3">
                  <Feather name="alert-circle" size={16} color="#dc2626" />
                  <Text className="text-red-700 font-bold text-sm ml-2">
                    {estado === 'rechazado_por_usuario' ? 'You declined the terms' : 'Rejected during inspection'}
                  </Text>
                </View>
                {estado === 'rechazado' ? (
                  <>
                    <Text className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Reason</Text>
                    <Text className="text-sm text-slate-700 leading-6">
                      {propuesta?.motivo || 'No reason was provided.'}
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm text-slate-700 leading-6">
                    You declined the proposed auction terms, so this item will not be auctioned.
                  </Text>
                )}
              </View>
            </>
          ) : (
            <>
              <Text className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-6">
                What to expect
              </Text>
              <Step icon="search" title="Physical inspection" body="Our team will examine the item and verify the information you provided." />
              <Step icon="mail" title="You will be notified" body="We will reach out with the inspection result — acceptance or rejection with reasons." />
              <Step icon="dollar-sign" title="Price and commissions proposal" body="If accepted, we will inform you of the auction date and location, base price, and commissions. You may accept or reject this proposal here." />
              <Step icon="shield" title="Insurance and logistics" body="Once agreed, an insurance policy will be contracted on your item based on the base price." isLast />
            </>
          )}

        </ScrollView>
      )}

      {/* FOOTER */}
      <View className="px-6 pb-12 bg-white border-t border-slate-50 pt-4">
        {esPropuesta ? (
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => responder('rechazar')}
              disabled={acting}
              className="flex-1 py-4 border border-slate-200 rounded-full items-center mr-2"
            >
              <Text className="text-slate-600 font-bold text-sm">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => responder('aceptar')}
              disabled={acting}
              className="flex-[2] bg-[#a78bfa] rounded-full py-4 items-center shadow-sm shadow-purple-200 ml-2"
            >
              {acting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Accept Terms</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('MyAuctions')}
              className="bg-[#a78bfa] rounded-full py-4 items-center shadow-sm shadow-purple-200 mb-4"
            >
              <Text className="text-white font-bold text-base">View My Items</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} className="py-4 items-center">
              <Text className="text-[#7C3AED] font-bold text-sm">Back to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

    </View>
  );
}
