import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createCuentaBancaria } from '../services/api';

export default function BankForm({ clienteId, token, onSuccess }) {
  const [form, setForm] = useState({
    banco: '',
    numeroCuenta: '',
    titular: '',
    moneda: 'ARS',
    internacional: false,
  });
  const [showAccount, setShowAccount] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.banco || !form.numeroCuenta) {
      Alert.alert('Validation', 'Please fill in Bank Name and Account Number.');
      return;
    }
    setSaving(true);
    try {
      await createCuentaBancaria(clienteId, {
        banco: form.banco,
        numeroCuenta: form.numeroCuenta,
        titular: form.titular || undefined,
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
    <View className="border border-purple-200 rounded-3xl p-5 mb-8 border-dashed">

      <View className="flex-row items-center mb-6">
        <View className="bg-purple-100 p-2 rounded-lg mr-3">
          <Feather name="shield" size={20} color="#7C3AED" />
        </View>
        <View>
          <Text className="font-bold text-slate-800 text-lg">Bank Details</Text>
          <Text className="text-xs text-slate-400">Verify your account for secure transactions</Text>
        </View>
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Bank Name</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
        placeholder="e.g. Banco Nación"
        placeholderTextColor="#94a3b8"
        value={form.banco}
        onChangeText={(t) => setForm({ ...form, banco: t })}
      />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Account Number</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between">
        <TextInput
          className="flex-1 text-black"
          placeholder="1234567890"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          secureTextEntry={!showAccount}
          value={form.numeroCuenta}
          onChangeText={(t) => setForm({ ...form, numeroCuenta: t })}
        />
        <TouchableOpacity onPress={() => setShowAccount(!showAccount)}>
          <Feather name={showAccount ? "eye" : "eye-off"} size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Account Holder (optional)</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
        placeholder="Johnathan Doe"
        placeholderTextColor="#94a3b8"
        value={form.titular}
        onChangeText={(t) => setForm({ ...form, titular: t })}
      />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Currency</Text>
      <View className="flex-row mb-6">
        {['ARS', 'USD'].map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setForm({ ...form, moneda: c })}
            className={`flex-1 py-3 rounded-xl border items-center mr-1 ${
              form.moneda === c ? 'border-[#7C3AED] bg-purple-50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <Text className={`font-bold text-sm ${form.moneda === c ? 'text-[#7C3AED]' : 'text-slate-400'}`}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="flex-row items-center mb-6"
        onPress={() => setForm({ ...form, internacional: !form.internacional })}
      >
        <View className={`w-5 h-5 rounded border ${form.internacional ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
          {form.internacional && <Feather name="check" size={14} color="white" />}
        </View>
        <Text className="font-medium text-slate-600 text-sm">International account</Text>
      </TouchableOpacity>

      <View className="bg-purple-50 rounded-xl p-4 flex-row mb-8">
        <Feather name="info" size={16} color="#7C3AED" className="mt-1 mr-2" />
        <Text className="text-[#7C3AED] text-xs flex-1 font-medium leading-5">
          Note: Reserved funds for bidding may apply. Verification might take up to 24-48 hours.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={saving}
        className="bg-[#a78bfa] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200"
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-sm">Save Bank Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
