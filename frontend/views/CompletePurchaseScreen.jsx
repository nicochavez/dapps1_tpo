import React, { useState, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import {
  getCompras, getCompraById, setRetiroPersonal, pagarCompra,
  getMediosPago, getDirecciones, getProductoById, buildImageUrl,
  getMultas, pagarMulta,
} from '../services/api';

const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);
const money = (v) => `$${num(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const PM_LABEL = {
  tarjeta_credito: 'Credit Card',
  cuenta_bancaria: 'Bank Account',
  cheque_certificado: 'Certified Check',
};

function pmSubtitle(pm) {
  if (pm.tipo === 'tarjeta_credito') return `•••• ${pm.ultimosCuatro || '????'}`;
  return pm.banco || PM_LABEL[pm.tipo] || 'Payment method';
}

export default function CompletePurchaseScreen({ route, navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const compraId = route?.params?.compraId;

  const [compra, setCompra] = useState(null);
  const [image, setImage] = useState(null);
  const [methods, setMethods] = useState([]);
  const [address, setAddress] = useState(null);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState('shipping');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const cargar = useCallback(async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const token = currentUser.token;

      let theCompra = null;
      if (compraId) {
        theCompra = await getCompraById(compraId, token).catch(() => null);
      } else {
        const page = await getCompras(token).catch(() => null);
        const list = page?.content ?? (Array.isArray(page) ? page : []);
        theCompra = list[0] ?? null;
      }
      setCompra(theCompra);

      const [medios, direcciones, fines] = await Promise.all([
        getMediosPago(token).catch(() => []),
        getDirecciones(currentUser.id, token).catch(() => []),
        getMultas(token).catch(() => []),
      ]);
      setMethods(Array.isArray(medios) ? medios : []);
      if (Array.isArray(medios) && medios.length) setSelectedPayment(medios[0].identificador);
      const dirs = Array.isArray(direcciones) ? direcciones : [];
      setAddress(dirs.find(d => d.favorito) ?? dirs[0] ?? null);
      setMultas(Array.isArray(fines) ? fines.filter(m => m.estado === 'pendiente') : []);

      if (theCompra?.producto?.identificador) {
        const prod = await getProductoById(theCompra.producto.identificador, token).catch(() => null);
        setImage(buildImageUrl(prod?.fotos?.[0]?.url));
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [compraId, currentUser?.token, currentUser?.id]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) {
    return <View className="flex-1 bg-[#f8fafc] items-center justify-center"><ActivityIndicator color="#7C3AED" /></View>;
  }

  if (!compra) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center px-6">
        <Text className="text-slate-500 font-bold text-center">No tenés compras pendientes.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 rounded-xl bg-purple-100">
          <Text className="text-[#7C3AED] font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const winningBid = num(compra.importe);
  const commission = num(compra.comision);
  const shippingCost = deliveryMethod === 'shipping' ? num(compra.costoEnvio) : 0;
  const finesTotal = multas.reduce((s, m) => s + num(m.multa), 0);
  const grandTotal = winningBid + commission + shippingCost + finesTotal;

  const handleConfirmPay = async () => {
    if (!selectedPayment) {
      Alert.alert('Falta el medio de pago', 'Seleccioná un medio de pago para continuar.');
      return;
    }
    setSubmitting(true);
    try {
      const token = currentUser.token;
      if (deliveryMethod === 'pickup') {
        await setRetiroPersonal(compra.identificador, token);
      }
      // Pagar multas pendientes primero (bloquean la participación), luego la compra.
      for (const m of multas) {
        await pagarMulta(m.identificador, selectedPayment, token);
      }
      await pagarCompra(compra.identificador, token);
      Alert.alert('Payment successful!', 'Tu compra fue confirmada.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('No se pudo confirmar la compra', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Complete Purchase</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        {/* PRODUCT */}
        <View className="bg-white rounded-3xl p-4 mb-6 shadow-sm shadow-slate-200 flex-row items-center">
          {image ? (
            <Image source={{ uri: image }} className="w-20 h-20 rounded-2xl bg-slate-100" resizeMode="cover" />
          ) : (
            <View className="w-20 h-20 rounded-2xl bg-slate-100 items-center justify-center">
              <Feather name="image" size={22} color="#cbd5e1" />
            </View>
          )}
          <View className="flex-1 ml-4 justify-center">
            <View className="bg-purple-100 self-start px-2 py-0.5 rounded mb-1.5">
              <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">Auction Won</Text>
            </View>
            <Text className="text-base font-bold text-slate-800 mb-1" numberOfLines={2}>
              {compra.producto?.descripcion}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-slate-400 mr-1">Final Bid:</Text>
              <Text className="text-[#7C3AED] font-bold">{money(winningBid)}</Text>
            </View>
          </View>
        </View>

        {/* DELIVERY */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 px-1">Delivery Details</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200">
            <View className="flex-row bg-slate-100 rounded-xl p-1 mb-5">
              <TouchableOpacity onPress={() => setDeliveryMethod('shipping')} className={`flex-1 py-2 rounded-lg items-center ${deliveryMethod === 'shipping' ? 'bg-[#7C3AED] shadow-sm' : ''}`}>
                <Text className={`font-bold text-xs ${deliveryMethod === 'shipping' ? 'text-white' : 'text-slate-500'}`}>Shipping</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeliveryMethod('pickup')} className={`flex-1 py-2 rounded-lg items-center ${deliveryMethod === 'pickup' ? 'bg-[#7C3AED] shadow-sm' : ''}`}>
                <Text className={`font-bold text-xs ${deliveryMethod === 'pickup' ? 'text-white' : 'text-slate-500'}`}>Local Pickup</Text>
              </TouchableOpacity>
            </View>

            {deliveryMethod === 'shipping' ? (
              address ? (
                <View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-slate-800 text-base">{address.nombre || 'Shipping address'}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
                      <Text className="text-[#7C3AED] font-bold text-xs">Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-slate-500 text-sm mb-0.5">{`${address.calle} ${address.numero || ''}`}</Text>
                  <Text className="text-slate-500 text-sm mb-3">{`${address.ciudad}, ${address.codigoPostal}`}</Text>
                  <View className="flex-row items-center">
                    <Feather name="truck" size={14} color="#64748b" />
                    <Text className="text-slate-500 text-xs ml-1.5 font-medium">Standard Delivery (3-5 Days)</Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate('Addresses')} className="py-2">
                  <Text className="text-[#7C3AED] font-bold text-sm">+ Add a shipping address</Text>
                </TouchableOpacity>
              )
            ) : (
              <View className="py-2">
                <Text className="text-slate-500 text-sm">You can pick up your item at our main gallery.</Text>
              </View>
            )}
          </View>
        </View>

        {/* PAYMENT */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-1 mb-3">
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Payment Method</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddPaymentMethod')}>
              <Text className="text-[#7C3AED] font-bold text-xs">Add New</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl p-2 shadow-sm shadow-slate-200">
            {methods.length === 0 ? (
              <Text className="text-slate-400 text-sm p-4">No payment methods. Add one to continue.</Text>
            ) : methods.map((pm, index) => (
              <TouchableOpacity
                key={pm.identificador}
                onPress={() => setSelectedPayment(pm.identificador)}
                className={`flex-row items-center p-4 ${index !== methods.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-4 ${selectedPayment === pm.identificador ? 'border-[#7C3AED]' : 'border-slate-300'}`}>
                  {selectedPayment === pm.identificador && <View className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full" />}
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-800 text-sm">{PM_LABEL[pm.tipo] || 'Payment'} {pmSubtitle(pm)}</Text>
                  <Text className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                    {pm.moneda || ''} · {pm.verificado ? 'Verified' : 'Pending'}
                  </Text>
                </View>
                <Feather name={pm.tipo === 'tarjeta_credito' ? 'credit-card' : 'briefcase'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUMMARY */}
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm shadow-slate-200">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Summary</Text>
          <View className="flex-row justify-between mb-2.5">
            <Text className="text-slate-500">Winning Bid</Text>
            <Text className="font-bold text-slate-700">{money(winningBid)}</Text>
          </View>
          <View className="flex-row justify-between mb-2.5">
            <Text className="text-slate-500">Commission</Text>
            <Text className="font-bold text-slate-700">{money(commission)}</Text>
          </View>
          <View className={`flex-row justify-between ${finesTotal > 0 ? 'mb-2.5' : 'mb-4 pb-4 border-b border-slate-100'}`}>
            <Text className="text-slate-500">Shipping Cost</Text>
            <Text className="font-bold text-slate-700">{money(shippingCost)}</Text>
          </View>
          {finesTotal > 0 && (
            <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-100">
              <View className="flex-row items-center">
                <Feather name="alert-triangle" size={13} color="#dc2626" />
                <Text className="text-red-600 ml-1.5">Outstanding fines</Text>
              </View>
              <Text className="font-bold text-red-600">{money(finesTotal)}</Text>
            </View>
          )}
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-slate-800 text-base">Grand Total</Text>
            <Text className="font-bold text-[#7C3AED] text-xl">{money(grandTotal)}</Text>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>

      <View className="bg-white pt-2 pb-8 px-6 border-t border-slate-100">
        <Text className="text-[10px] text-center text-slate-400 mb-3 px-4 leading-4">
          By tapping "Confirm & Pay", you authorize the payment for this auction item.
        </Text>
        <TouchableOpacity
          onPress={handleConfirmPay}
          disabled={submitting || methods.length === 0}
          className={`rounded-2xl py-4 items-center shadow-md shadow-purple-200 ${submitting || methods.length === 0 ? 'bg-slate-300' : 'bg-[#a78bfa]'}`}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Confirm & Pay</Text>}
        </TouchableOpacity>
      </View>

    </View>
  );
}
