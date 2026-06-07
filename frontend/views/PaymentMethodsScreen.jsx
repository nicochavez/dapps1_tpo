import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthContext } from '../context/AuthContext';
import allPaymentMethods from '../data/paymentMethods.json';

const CARD_GRADIENTS = {
  Credit: ['#8b5cf6', '#a855f7', '#d946ef'],
  Debit:  ['#3b82f6', '#6366f1', '#8b5cf6'],
  Bank:   ['#10b981', '#059669', '#0d9488'],
  Check:  ['#f59e0b', '#f97316', '#ef4444'],
};

const CARD_ICONS = {
  Credit: 'credit-card',
  Debit:  'credit-card',
  Bank:   'bank',
  Check:  'file-certificate-outline',
};

export default function PaymentMethodsScreen({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);

  const initial = allPaymentMethods.filter(pm => pm.userId === currentUser?.id);
  const [methods, setMethods] = useState(initial);

  const handleDelete = (pm) => {
    Alert.alert(
      'Remove payment method',
      `Remove the ${pm.type} card ending in ${pm.lastFour}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setMethods(prev => prev.filter(m => m.id !== pm.id)),
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

        {methods.length === 0 ? (
          <View className="bg-white rounded-3xl p-10 items-center border border-slate-200 border-dashed mt-4">
            <Feather name="credit-card" size={36} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold mt-4 mb-1">No payment methods</Text>
            <Text className="text-slate-300 text-xs text-center">Add a card or bank account{'\n'}to start bidding</Text>
          </View>
        ) : (
          methods.map(pm => {
            const gradient = CARD_GRADIENTS[pm.type] ?? CARD_GRADIENTS.Credit;
            const icon = CARD_ICONS[pm.type] ?? 'credit-card';
            return (
              <View key={pm.id} className="mb-4">
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-3xl p-6 shadow-lg shadow-purple-200"
                >
                  <View className="flex-row justify-between items-start mb-6">
                    <View>
                      <Text className="text-white text-[10px] font-bold tracking-widest opacity-70 mb-1">
                        {pm.type.toUpperCase()} · {pm.currency}
                      </Text>
                      <Text className="text-white font-bold tracking-widest text-sm opacity-90">
                        {pm.tier}
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
                    {'•••• •••• •••• ' + pm.lastFour}
                  </Text>

                  <View className="flex-row justify-between items-end">
                    <View className="flex-row" style={{ gap: 32 }}>
                      <View>
                        <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">CARD HOLDER</Text>
                        <Text className="text-white font-bold text-xs tracking-wider">{pm.cardHolder}</Text>
                      </View>
                      <View>
                        <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
                        <Text className="text-white font-bold text-xs tracking-wider">{pm.expiry}</Text>
                      </View>
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
