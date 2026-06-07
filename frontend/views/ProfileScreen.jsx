import React, { useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

import Header from '../components/Header';
import Footer from '../components/Footer';

// 1. Importamos el Contexto
import { AuthContext } from '../context/AuthContext';

// 2. Importamos TODAS las bases de datos necesarias para cruzar la información
import paymentMethodsData from '../data/paymentMethods.json';
import bidsData from '../data/bids.json';
import itemsData from '../data/items.json';
import catalogsData from '../data/catalogs.json';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { user: currentUser, logout } = useContext(AuthContext);

  // Redirige a Login si no hay usuario logueado (ya sea que nunca se logueó
  // o que acaba de hacer logout). useEffect evita el render parcial.
  useEffect(() => {
    if (!currentUser) {
      Alert.alert(
        'Sign in required',
        'You need to be logged in to view your profile.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }
        ]     
      );
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // 3. Buscamos el medio de pago
  const userPaymentMethod = paymentMethodsData.find(pm => pm.userId === currentUser.id);

  // 4. CÁLCULO DINÁMICO DE ESTADÍSTICAS — agrupado por subasta (igual que BidsScreen)
  const userBids = bidsData.filter(b => b.userId === currentUser.id);

  const auctionMap = {};
  userBids.forEach(bid => {
    const item = itemsData.find(i => i.id === bid.itemId);
    const catalog = item ? catalogsData.find(c => c.id === item.catalogo) : null;
    if (!item || !catalog) return;
    if (!auctionMap[catalog.id]) auctionMap[catalog.id] = { won: false, isActive: false };
    if (bid.ganador) auctionMap[catalog.id].won = true;
    if (item.estadoLote === 'en_puja') auctionMap[catalog.id].isActive = true;
  });

  const auctions = Object.values(auctionMap);
  const attended = auctions.length;
  const wonCount = auctions.filter(a => a.won).length;
  const winRate  = attended > 0 ? Math.round((wonCount / attended) * 100) : 0;

  const calculatedStats = {
    attended,
    won: wonCount,
    winRate,
    myAuctions: catalogsData.filter(catalog => catalog.ownerId === currentUser.id).length,
  };

  const handleLogout = () => {
    // Limpiamos el contexto (setUser(null) y setToken(null) en AuthContext).
    // El useEffect de arriba detecta el cambio de currentUser a null
    // y hace el reset de navegación automáticamente.
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* --- INFO DEL USUARIO --- */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="p-1 border-2 border-slate-100 rounded-full border-dashed">
              <Image 
                source={{ uri: currentUser.avatar }} 
                className="w-24 h-24 rounded-full bg-purple-100" 
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-[#7C3AED] rounded-full p-1 border-2 border-white">
              <Feather name="settings" size={12} color="white" />
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-slate-800 mt-4 mb-1.5">{currentUser.name}</Text>
          <View className="bg-[#cca038] px-4 py-1.5 rounded-xl shadow-sm">
            <Text className="text-white text-xs font-bold tracking-widest">{currentUser.category}</Text>
          </View>
        </View>

        {/* --- ESTADÍSTICAS DINÁMICAS --- */}
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200 flex-row justify-between items-center">
          
          <View className="items-center flex-1 border-r border-slate-100">
            <MaterialCommunityIcons name="gavel" size={20} color="#7C3AED" />
            <Text className="text-2xl font-bold text-slate-800 mt-1 mb-0.5">
              {calculatedStats.attended.toString().padStart(2, '0')}
            </Text>
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Attended</Text>
          </View>

          <View className="items-center flex-1 border-r border-slate-100">
            <MaterialCommunityIcons name="trophy-outline" size={20} color="#10b981" />
            <Text className="text-2xl font-bold text-slate-800 mt-1 mb-0.5">
              {calculatedStats.won.toString().padStart(2, '0')}
            </Text>
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Won</Text>
          </View>

          <View className="items-center flex-1">
            <MaterialCommunityIcons name="chart-line" size={20} color="#a855f7" />
            <Text className="text-2xl font-bold text-slate-800 mt-1 mb-0.5">
              {calculatedStats.winRate}%
            </Text>
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Win Rate</Text>
          </View>

        </View>

        {/* --- MY AUCTIONS --- */}
        <TouchableOpacity onPress={() => navigation.navigate('MyAuctions')} className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200 flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">My Auctions</Text>
            <Text className="text-3xl font-bold text-slate-800">
              {calculatedStats.myAuctions.toString().padStart(2, '0')}
            </Text>
          </View>
          <View className="bg-orange-100 w-12 h-12 rounded-2xl items-center justify-center">
            <Feather name="tag" size={20} color="#f59e0b" />
          </View>
        </TouchableOpacity>

        {/* --- MANAGE ADDRESSES BOTÓN --- */}
        <TouchableOpacity onPress={() => navigation.navigate('Addresses')} className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center mb-8 shadow-md shadow-purple-200">
          <Text className="text-white font-bold text-sm">Manage Addresses</Text>
        </TouchableOpacity>

        {/* --- DIGITAL WALLET (TARJETA DE CRÉDITO) --- */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-lg font-bold text-slate-800">Digital Wallet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} className="flex-row items-center">
            <Feather name="settings" size={15} color="#7C3AED" />
            <Text className="text-sm font-bold text-[#7C3AED] ml-1">Manage</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} activeOpacity={0.85}>
          {userPaymentMethod ? (
            <LinearGradient
              colors={['#8b5cf6', '#a855f7', '#d946ef']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-6 mb-6 shadow-lg shadow-purple-300"
            >
              <View className="flex-row justify-between items-center mb-8">
                <MaterialCommunityIcons name="contactless-payment-circle-outline" size={28} color="white" />
                <Text className="text-white font-bold tracking-widest text-sm opacity-90">
                  {userPaymentMethod.tier}
                </Text>
              </View>

              <Text className="text-white text-xl font-medium tracking-widest mb-8 opacity-90">
                {'•••• •••• •••• ' + userPaymentMethod.lastFour}
              </Text>

              <View className="flex-row justify-between items-end">
                <View className="flex-row" style={{ gap: 32 }}>
                  <View>
                    <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">CARD HOLDER</Text>
                    <Text className="text-white font-bold text-xs tracking-wider">{userPaymentMethod.cardHolder}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
                    <Text className="text-white font-bold text-xs tracking-wider">{userPaymentMethod.expiry}</Text>
                  </View>
                </View>
                <Feather name="credit-card" size={24} color="white" style={{ opacity: 0.9 }} />
              </View>
            </LinearGradient>
          ) : (
            <View className="bg-slate-100 rounded-3xl p-6 mb-6 items-center border border-slate-200 border-dashed">
              <Text className="text-slate-400 font-bold mb-2">No payment methods yet</Text>
              <Text className="text-slate-300 text-xs">Tap to add one</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* --- CAMBIAR CONTRASEÑA --- */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ChangePassword')}
          className="bg-white rounded-2xl py-4 items-center justify-center mb-4 border border-slate-200 flex-row"
        >
          <Feather name="lock" size={16} color="#7C3AED" />
          <Text className="text-[#7C3AED] font-bold text-sm ml-2">Change Password</Text>
        </TouchableOpacity>

        {/* --- BOTÓN LOG OUT --- */}
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