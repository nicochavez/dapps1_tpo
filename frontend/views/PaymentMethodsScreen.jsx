import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { getMediosPago, deleteMedioPago } from '../services/api';

const TIPO_GRADIENTS = {
  tarjeta_credito:  ['#8b5cf6', '#a855f7', '#d946ef'],
  cuenta_bancaria:  ['#10b981', '#059669', '#0d9488'],
  cheque_certificado: ['#f59e0b', '#f97316', '#ef4444'],
};

const TIPO_ICONS = {
  tarjeta_credito:  'credit-card',
  cuenta_bancaria:  'bank',
  cheque_certificado: 'file-certificate-outline',
};

const TIPO_LABELS = {
  tarjeta_credito:  'Credit Card',
  cuenta_bancaria:  'Bank Account',
  cheque_certificado: 'Certified Check',
};

function subtitleFor(pm) {
  if (pm.tipo === 'tarjeta_credito') return `•••• ${pm.ultimosCuatro || '????'}`;
  if (pm.tipo === 'cuenta_bancaria') return pm.banco || 'Bank';
  if (pm.tipo === 'cheque_certificado') return pm.banco || 'Check';
  return pm.detalle || '';
}

function holderFor(pm) {
  return pm.titular || pm.detalle || '—';
}

function expiryFor(pm) {
  if (pm.fechaVencimiento) return pm.fechaVencimiento.substring(0, 7);
  return '—';
}

export default function PaymentMethodsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getMediosPago(user.id, user.token);
      setMethods(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchMethods(); }, [fetchMethods]));

  const handleDelete = (pm) => {
    Alert.alert(
      'Remove payment method',
      `Remove ${TIPO_LABELS[pm.tipo] || pm.tipo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedioPago(user.id, pm.identificador, user.token);
              setMethods(prev => prev.filter(m => m.identificador !== pm.identificador));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800 flex-1">Payment Methods</Text>
        <Text className="text-sm text-slate-400">{methods.length} saved</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

        {loading ? (
          <ActivityIndicator color="#7C3AED" className="mt-10" />
        ) : methods.length === 0 ? (
          <View className="bg-white rounded-3xl p-10 items-center border border-slate-200 border-dashed mt-4">
            <Feather name="credit-card" size={36} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold mt-4 mb-1">No payment methods</Text>
            <Text className="text-slate-300 text-xs text-center">Add a card or bank account{'\n'}to start bidding</Text>
          </View>
        ) : (
          methods.map(pm => {
            const gradient = TIPO_GRADIENTS[pm.tipo] ?? TIPO_GRADIENTS.tarjeta_credito;
            const icon = TIPO_ICONS[pm.tipo] ?? 'credit-card';
            return (
              <View key={pm.identificador} className="mb-4">
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-3xl p-6 shadow-lg shadow-purple-200"
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View>
                      <Text className="text-white text-[10px] font-bold tracking-widest opacity-70 mb-1">
                        {(TIPO_LABELS[pm.tipo] || pm.tipo).toUpperCase()} · {pm.moneda}
                      </Text>
                      <Text className="text-white font-bold tracking-widest text-sm opacity-90">
                        {pm.verificado ? 'VERIFIED' : 'PENDING'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(pm)}
                      className="bg-white/20 rounded-xl p-2"
                    >
                      <Feather name="trash-2" size={18} color="white" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-white text-xl font-medium tracking-widest mb-6 opacity-90">
                    {subtitleFor(pm)}
                  </Text>

                  <View className="flex-row justify-between items-end">
                    <View className="flex-row" style={{ gap: 32 }}>
                      <View>
                        <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">HOLDER</Text>
                        <Text className="text-white font-bold text-xs tracking-wider">{holderFor(pm)}</Text>
                      </View>
                      {pm.fechaVencimiento && (
                        <View>
                          <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
                          <Text className="text-white font-bold text-xs tracking-wider">{expiryFor(pm)}</Text>
                        </View>
                      )}
                    </View>
                    <MaterialCommunityIcons name={icon} size={24} color="white" style={{ opacity: 0.9 }} />
                  </View>
                </LinearGradient>
              </View>
            );
          })
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('AddPaymentMethod')}
          className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center mt-2 mb-10 shadow-md shadow-purple-200 flex-row"
        >
          <Feather name="plus" size={18} color="white" />
          <Text className="text-white font-bold text-sm ml-2">Add Payment Method</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
