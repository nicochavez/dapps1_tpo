import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Footer from '../components/Footer';

// Importamos el Contexto global
import { AuthContext } from '../context/AuthContext';

// Importamos los datos
import bidsData from '../data/bids.json';
import itemsData from '../data/items.json';

export default function BidsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const tabs = ['Active', 'Won', 'Lost'];

  // 1. Obtenemos al usuario logueado desde la memoria global
  const { user: currentUser } = useContext(AuthContext);

  if (!currentUser) return null;

  // 2. Filtramos las participaciones cruzando el ID del usuario actual
  const userBids = bidsData.filter(bid => bid.userId === currentUser.id);
  const displayedBids = userBids.filter(bid => bid.category === activeTab);

  // 3. Cálculos estadísticos
  const totalActiveBids = userBids.filter(bid => bid.category === 'Active').length;
  const potentialSpend = userBids
    .filter(bid => bid.status === 'WINNING' && bid.category === 'Active')
    .reduce((sum, bid) => sum + bid.amount, 0);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* --- HEADER --- */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Bids</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        
        {/* --- TARJETAS DE RESUMEN --- */}
        <View className="mb-6">
          {/* Tarjeta: Total Active Bids */}
          <View className="bg-white rounded-[32px] p-6 mb-4 shadow-sm shadow-slate-200 relative overflow-hidden">
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">
              Total Active Bids
            </Text>
            <Text className="text-4xl font-bold text-slate-800">{totalActiveBids}</Text>
            
            {/* Ícono de fondo decorativo */}
            <View className="absolute -right-4 -bottom-4 opacity-30">
              <Feather name="bar-chart-2" size={100} color="#e2e8f0" />
            </View>
          </View>

          {/* Tarjeta: Potential Spend */}
          <View className="bg-[#a855f7] rounded-[32px] p-6 shadow-md shadow-purple-200">
            <Text className="text-[10px] font-bold text-purple-200 tracking-widest uppercase mb-1">
              Potential Spend
            </Text>
            <Text className="text-4xl font-bold text-white mb-3">
              ${potentialSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <View className="flex-row items-center">
              <Feather name="info" size={14} color="#e9d5ff" />
              <Text className="text-xs text-purple-200 ml-1.5 font-medium">
                Across all currently winning auctions
              </Text>
            </View>
          </View>
        </View>

        {/* --- TABS (Active, Won, Lost) --- */}
        <View className="flex-row bg-slate-100 p-1 rounded-full mb-8">
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 items-center py-3 rounded-full ${
                  isActive ? 'bg-white shadow-sm shadow-slate-200' : ''
                }`}
              >
                <Text 
                  className={`text-sm font-bold ${isActive ? 'text-[#7C3AED]' : 'text-slate-500'}`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- LISTADO CRUZADO DE BIDS E ITEMS --- */}
        <View className="mb-10">
          {displayedBids.length > 0 ? (
            displayedBids.map((bid) => {
              const item = itemsData.find(i => i.id === bid.itemId);
              if (!item) return null;

              // Estilos condicionales fieles al Figma para los Pills
              const isWinning = bid.status === 'WINNING';
              const pillBg = isWinning ? 'bg-emerald-100' : 'bg-rose-500';
              const pillText = isWinning ? 'text-emerald-700' : 'text-white';

              return (
                <TouchableOpacity 
                  key={bid.id} 
                  onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                  className="bg-white rounded-3xl p-4 mb-4 shadow-sm shadow-slate-100 flex-row"
                >
                  {/* Imagen */}
                  <Image 
                    source={{ uri: item.image }} 
                    className="w-24 h-24 rounded-2xl bg-slate-100" 
                    resizeMode="cover"
                  />
                  
                  <View className="flex-1 ml-4 justify-between py-0.5">
                    
                    {/* Header: Título, Pill y Reloj */}
                    <View>
                      <Text className="text-base font-bold text-slate-800 mb-2 leading-5" numberOfLines={2}>
                        {item.title}
                      </Text>
                      
                      <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded mr-2 ${pillBg}`}>
                          <Text className={`text-[9px] font-bold uppercase tracking-wider ${pillText}`}>
                            {bid.status}
                          </Text>
                        </View>
                        <Feather name="clock" size={12} color="#64748b" />
                        <Text className="text-[10px] text-slate-500 ml-1 font-medium">{item.timeLeft}</Text>
                      </View>
                    </View>

                    {/* Footer: Precios y Link */}
                    <View className="flex-row items-end justify-between mt-3">
                      <View>
                        <Text className="text-[10px] text-slate-400 font-medium mb-0.5">
                          {isWinning ? 'Current Bid' : 'Your Last Bid'}
                        </Text>
                        <Text className={`text-lg font-bold ${isWinning ? 'text-slate-800' : 'text-slate-400'}`}>
                          ${bid.amount.toLocaleString('en-US')}
                        </Text>
                      </View>
                      <Text className="text-[#7C3AED] font-bold text-xs">View Details {'>'}</Text>
                    </View>

                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            /* Empty State si no hay pujas en esa pestaña */
            <View className="items-center justify-center py-10 bg-white rounded-3xl border border-slate-100 border-dashed">
              <Feather name="tag" size={32} color="#cbd5e1" className="mb-3" />
              <Text className="text-slate-400 font-medium text-sm">No {activeTab.toLowerCase()} bids found</Text>
            </View>
          )}
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}