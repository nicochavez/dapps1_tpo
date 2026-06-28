import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createTarjetaCredito } from '../services/api';

function expiryToDate(mmyy) {
  const parts = mmyy.replace(/\s/g, '').split('/');
  if (parts.length !== 2) return null;
  const [mm, yy] = parts;
  if (!mm || !yy) return null;
  return `20${yy}-${mm.padStart(2, '0')}-01`;
}

function formatExpiry(text) {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CardForm({ token, onSuccess }) {
  const [form, setForm] = useState({
    titular: '',
    cardNumber: '',
    expiry: '',
    moneda: 'ARS',
    internacional: false,
  });
  const [saving, setSaving] = useState(false);

  const lastFour = form.cardNumber.replace(/\s/g, '').slice(-4) || '????';

  const handleSubmit = async () => {
    if (!form.titular || !form.cardNumber || !form.expiry) {
      Alert.alert('Validation', 'Please fill in Cardholder, Card Number and Expiry.');
      return;
    }
    const fechaVencimiento = expiryToDate(form.expiry);
    if (!fechaVencimiento) {
      Alert.alert('Validation', 'Expiry must be MM/YY format.');
      return;
    }
    const digits = form.cardNumber.replace(/\D/g, '');
    if (digits.length < 4) {
      Alert.alert('Validation', 'Enter a valid card number.');
      return;
    }

    setSaving(true);
    try {
      await createTarjetaCredito({
        titular: form.titular,
        ultimosCuatro: digits.slice(-4),
        fechaVencimiento,
        moneda: form.moneda,
        internacional: form.internacional,
      }, token);
      onSuccess?.();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <LinearGradient
        colors={['#8b5cf6', '#a855f7', '#d946ef']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6 mb-6 shadow-lg shadow-purple-300"
      >
        <View className="flex-row justify-between items-center mb-8">
          <MaterialCommunityIcons name="contactless-payment-circle-outline" size={28} color="white" />
          <Text className="text-white font-bold tracking-widest text-sm opacity-90">PREMIUM</Text>
        </View>
        <Text className="text-white text-xl font-medium tracking-widest mb-8 opacity-90">
          •••• •••• •••• {lastFour}
        </Text>
        <View className="flex-row justify-between items-end">
          <View className="flex-row space-x-12">
            <View>
              <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">CARD HOLDER</Text>
              <Text className="text-white font-bold text-xs tracking-wider uppercase">
                {form.titular || 'YOUR NAME HERE'}
              </Text>
            </View>
            <View>
              <Text className="text-white text-[9px] font-bold tracking-wider opacity-70 mb-1">EXPIRY</Text>
              <Text className="text-white font-bold text-xs tracking-wider">
                {form.expiry || 'MM/YY'}
              </Text>
            </View>
          </View>
          <Feather name="credit-card" size={24} color="white" className="opacity-90" />
        </View>
      </LinearGradient>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Cardholder Name</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
        placeholder="Johnathan Doe"
        placeholderTextColor="#94a3b8"
        value={form.titular}
        onChangeText={(t) => setForm({ ...form, titular: t })}
      />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Card Number</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
        <Feather name="credit-card" size={18} color="#94a3b8" className="mr-2" />
        <TextInput
          className="flex-1 text-black"
          placeholder="0000 0000 0000 0000"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={form.cardNumber}
          onChangeText={(t) => setForm({ ...form, cardNumber: t })}
        />
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 mr-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Expiry Date</Text>
          <TextInput
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black text-center"
            placeholder="MM/YY"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            maxLength={5}
            value={form.expiry}
            onChangeText={(t) => setForm({ ...form, expiry: formatExpiry(t) })}
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Currency</Text>
          <View className="flex-row">
            {['ARS', 'USD'].map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setForm({ ...form, moneda: c })}
                className={`flex-1 py-3 rounded-xl border items-center mr-1 ${
                  form.moneda === c ? 'border-[#7C3AED] bg-purple-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <Text className={`font-bold text-xs ${form.moneda === c ? 'text-[#7C3AED]' : 'text-slate-400'}`}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row items-center mb-6"
        onPress={() => setForm({ ...form, internacional: !form.internacional })}
      >
        <View className={`w-5 h-5 rounded border ${form.internacional ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
          {form.internacional && <Feather name="check" size={14} color="white" />}
        </View>
        <Text className="font-medium text-slate-600 text-sm">International card</Text>
      </TouchableOpacity>

      <View className="bg-purple-50 rounded-xl p-4 flex-row mb-8">
        <Feather name="shield" size={16} color="#7C3AED" className="mt-1 mr-2" />
        <Text className="text-slate-500 text-xs flex-1 leading-5">
          To ensure secure transactions, we may place a temporary small verification hold on your card. This amount will be automatically released within 24-48 hours.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={saving}
        className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200"
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-sm">Add Card</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
