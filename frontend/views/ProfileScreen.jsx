import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getMediosPago, getMetricasMe, getMisProductos } from '../services/api';

const TIPO_GRADIENTS = {
  tarjeta_credito:    ['#8b5cf6', '#a855f7', '#d946ef'],
  cuenta_bancaria:    ['#10b981', '#059669', '#0d9488'],
  cheque_certificado: ['#f59e0b', '#f97316', '#ef4444'],
};

function WalletCard({ pm }) {
  const gradient = TIPO_GRADIENTS[pm.tipo] ?? TIPO_GRADIENTS.tarjeta_credito;
  const subtitle =
    pm.tipo === 'tarjeta_credito'  ? `•••• •••• •••• ${pm.ultimosCuatro || '????'}` :
    pm.tipo === 'cuenta_bancaria'  ? (pm.banco || 'Bank Account') :
    pm.tipo === 'cheque_certificado' ? (pm.banco || 'Certified Check') : '';

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6 mb-6 shadow-lg shadow-purple-300"
    >
      <View className="flex-row justify-between items-center mb-8">
        <MaterialCommunityIcons name="contactless-payment-circle-outline" size={28} color="white" />
        <Text className="text-white font-bold tracking-widest text-sm opacity-90">
          {pm.verificado ? 'VERIFIED' : 'PENDING'}
        </Text>
      </View>
      <Text className="text-white text-xl font-medium tracking-widest mb-8 opacity-90">{subtitle}</Text>
      <View className="flex-row justify-between items-end">
        <View className="flex-row" style={{ gap: 32 }}>
          {pm.titular ? (
            <View>
              <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">HOLDER</Text>
              <Text className="text-white font-bold text-xs tracking-wider uppercase">{pm.titular}</Text>
            </View>
          ) : null}
          {pm.fechaVencimiento ? (
            <View>
              <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
              <Text className="text-white font-bold text-xs tracking-wider">{pm.fechaVencimiento.substring(0, 7)}</Text>
            </View>
          ) : null}
        </View>
        <Feather name="credit-card" size={24} color="white" style={{ opacity: 0.9 }} />
      </View>
    </LinearGradient>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user: currentUser, logout } = useContext(AuthContext);

  const [firstPm, setFirstPm]   = useState(null);
  const [metrics, setMetrics]   = useState(null);
  const [myAuctionsCount, setMyAuctionsCount] = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!currentUser) {
      Alert.alert(
        'Sign in required',
        'You need to be logged in to view your profile.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
        ]
      );
    }
  }, [currentUser]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [medios, met, productos] = await Promise.all([
        getMediosPago(currentUser.token),
        getMetricasMe(currentUser.token).catch(() => null),
        getMisProductos(currentUser.token).catch(() => []),
      ]);
      setFirstPm(Array.isArray(medios) && medios.length > 0 ? medios[0] : null);
      setMetrics(met);
      setMyAuctionsCount(Array.isArray(productos) ? productos.length : 0);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (!currentUser) return null;

  const subastasAsistidas = metrics?.subastasAsistidas ?? 0;
  const subastasGanadas   = metrics?.subastasGanadas ?? 0;
  const winRate = subastasAsistidas > 0
    ? Math.round((subastasGanadas / subastasAsistidas) * 100)
    : 0;

  const initials = currentUser.nombre
    ? currentUser.nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

        {/* USER INFO */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center border-2 border-dashed border-slate-200">
            <Text className="text-3xl font-bold text-[#7C3AED]">{initials}</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800 mt-4 mb-1.5">{currentUser.nombre}</Text>
          {currentUser.category ? (
            <View className="bg-[#cca038] px-4 py-1.5 rounded-xl shadow-sm">
              <Text className="text-white text-xs font-bold tracking-widest uppercase">{currentUser.category}</Text>
            </View>
          ) : null}
          {currentUser.email ? (
            <Text className="text-slate-400 text-xs mt-2">{currentUser.email}</Text>
          ) : null}
        </View>

        {/* STATS */}
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200 flex-row justify-between items-center">
            <View className="items-center flex-1 border-r border-slate-100">
              <MaterialCommunityIcons name="gavel" size={20} color="#7C3AED" />
              <Text className="text-2xl font-bold text-slate-800 mt-1 mb-0.5">
                {String(subastasAsistidas).padStart(2, '0')}
              </Text>
              <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Attended</Text>
            </View>
            <View className="items-center flex-1 border-r border-slate-100">
              <MaterialCommunityIcons name="trophy-outline" size={20} color="#10b981" />
              <Text className="text-2xl font-bold text-slate-800 mt-1 mb-0.5">
                {String(subastasGanadas).padStart(2, '0')}
              </Text>
              <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Won</Text>
            </View>
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="chart-line" size={20} color="#a855f7" />
              <Text className="text-2xl font-bold text-slate-800 mt-1 mb-0.5">{winRate}%</Text>
              <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Win Rate</Text>
            </View>
          </View>

        {/* MY AUCTIONS */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MyAuctions')}
          className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200 flex-row justify-between items-center"
        >
          <View>
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">My Auctions</Text>
            <Text className="text-3xl font-bold text-slate-800">
              {String(myAuctionsCount).padStart(2, '0')}
            </Text>
          </View>
          <View className="bg-orange-100 w-12 h-12 rounded-2xl items-center justify-center">
            <Feather name="tag" size={20} color="#f59e0b" />
          </View>
        </TouchableOpacity>

        {/* MANAGE ADDRESSES */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Addresses')}
          className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center mb-8 shadow-md shadow-purple-200"
        >
          <Text className="text-white font-bold text-sm">Manage Addresses</Text>
        </TouchableOpacity>

        {/* DIGITAL WALLET */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-lg font-bold text-slate-800">Digital Wallet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} className="flex-row items-center">
            <Feather name="settings" size={15} color="#7C3AED" />
            <Text className="text-sm font-bold text-[#7C3AED] ml-1">Manage</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#7C3AED" className="mb-6" />
          ) : firstPm ? (
            <WalletCard pm={firstPm} />
          ) : (
            <View className="bg-slate-100 rounded-3xl p-6 mb-6 items-center border border-slate-200 border-dashed">
              <Text className="text-slate-400 font-bold mb-2">No payment methods yet</Text>
              <Text className="text-slate-300 text-xs">Tap to add one</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* CHANGE PASSWORD */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ChangePassword')}
          className="bg-white rounded-2xl py-4 items-center justify-center mb-4 border border-slate-200 flex-row"
        >
          <Feather name="lock" size={16} color="#7C3AED" />
          <Text className="text-[#7C3AED] font-bold text-sm ml-2">Change Password</Text>
        </TouchableOpacity>

        {/* LOG OUT */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 rounded-2xl py-4 items-center justify-center mb-10 border border-red-100"
        >
          <Text className="text-red-500 font-bold text-sm">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <Footer />
    </View>
  );
}
