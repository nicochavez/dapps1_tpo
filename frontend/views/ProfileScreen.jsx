import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';
import Footer from '../components/Footer';

// 1. Importamos el Contexto
import { AuthContext } from '../context/AuthContext';

// 2. Importamos TODAS las bases de datos necesarias para cruzar la información
import paymentMethodsData from '../data/paymentMethods.json';
import bidsData from '../data/bids.json';
import catalogsData from '../data/catalogs.json';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { user: currentUser, logout } = useContext(AuthContext);

  if (!currentUser) return null;

  // 3. Buscamos el medio de pago
  const userPaymentMethod = paymentMethodsData.find(pm => pm.userId === currentUser.id);

  // 4. CÁLCULO DINÁMICO DE ESTADÍSTICAS
  // Filtramos todas las pujas (bids) hechas por el usuario
  const userBids = bidsData.filter(bid => bid.userId === currentUser.id);
  
  const calculatedStats = {
    // Total de pujas que hizo en su vida (el largo del array)
    bidsPlaced: userBids.length,
    
    // Pujas ganadas
    won: userBids.filter(bid => bid.status === 'WON').length,
    
    // Pujas activas en este momento
    activeBids: userBids.filter(bid => bid.category === 'Active').length,
    
    // Cantidad de catálogos donde él es el dueño
    myAuctions: catalogsData.filter(catalog => catalog.ownerId === currentUser.id).length
  };

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
            <Text className="text-white text-xs font-bold tracking-widest">{currentUser.badge}</Text>
          </View>
        </View>

        {/* --- ESTADÍSTICAS DINÁMICAS --- */}
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-200 flex-row justify-between items-center">
          
          <View className="items-center flex-1 border-r border-slate-100">
            <MaterialCommunityIcons name="gavel" size={20} color="#7C3AED" className="mb-2" />
            {/* Reemplazamos los datos estáticos por los calculados */}
            <Text className="text-2xl font-bold text-slate-800 mb-0.5">
              {calculatedStats.bidsPlaced.toString().padStart(2, '0')}
            </Text>
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Bids Placed</Text>
          </View>
          
          <View className="items-center flex-1 border-r border-slate-100">
            <MaterialCommunityIcons name="trophy-outline" size={20} color="#10b981" className="mb-2" />
            <Text className="text-2xl font-bold text-slate-800 mb-0.5">
              {calculatedStats.won.toString().padStart(2, '0')}
            </Text>
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Won</Text>
          </View>

          <View className="items-center flex-1">
            <MaterialCommunityIcons name="rocket-launch-outline" size={20} color="#a855f7" className="mb-2" />
            <Text className="text-2xl font-bold text-slate-800 mb-0.5">
              {calculatedStats.activeBids.toString().padStart(2, '0')}
            </Text>
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Bids</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('AddPaymentMethod')} className="flex-row items-center">
            <Feather name="plus" size={16} color="#7C3AED" />
            <Text className="text-sm font-bold text-[#7C3AED] ml-1">Add</Text>
          </TouchableOpacity>
        </View>

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

            <Text className="text-white text-xl font-medium tracking-[4px] mb-8 opacity-90">
              •••• •••• •••• {userPaymentMethod.lastFour}
            </Text>

            <View className="flex-row justify-between items-end">
              <View className="flex-row space-x-12">
                <View>
                  <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">CARD HOLDER</Text>
                  <Text className="text-white font-bold text-xs tracking-wider">{userPaymentMethod.cardHolder}</Text>
                </View>
                <View>
                  <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
                  <Text className="text-white font-bold text-xs tracking-wider">{userPaymentMethod.expiry}</Text>
                </View>
              </View>
              
              <Feather name="credit-card" size={24} color="white" className="opacity-90" />
            </View>
          </LinearGradient>
        ) : (
          <View className="bg-slate-100 rounded-3xl p-6 mb-6 items-center border border-slate-200 border-dashed">
            <Text className="text-slate-400 font-bold mb-2">No payment methods yet</Text>
          </View>
        )}

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