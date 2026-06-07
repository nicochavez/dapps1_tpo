import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { createChequeCertificado } from '../services/api';

export default function CheckForm({ clienteId, token, onSuccess }) {
  const [form, setForm] = useState({
    banco: '',
    numeroCheque: '',
    montoCertificado: '',
    fechaVencimiento: '',
    moneda: 'ARS',
    internacional: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.banco || !form.montoCertificado || !form.fechaVencimiento) {
      Alert.alert('Validation', 'Please fill in Bank, Amount and Expiry Date.');
      return;
    }
    const monto = parseFloat(form.montoCertificado);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Validation', 'Amount must be greater than zero.');
      return;
    }

    setSaving(true);
    try {
      await createChequeCertificado(clienteId, {
        banco: form.banco,
        numeroCheque: form.numeroCheque || undefined,
        montoCertificado: monto,
        fechaVencimiento: form.fechaVencimiento,
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
      <View className="bg-slate-50 rounded-3xl p-5 mb-8 flex-row items-start border border-slate-100">
        <View className="bg-white p-2 rounded-lg mr-3 shadow-sm shadow-slate-200">
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#64748b" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-lg mb-1">Check Verification</Text>
          <Text className="text-xs text-slate-500 leading-5">
            Certified checks must be delivered and verified <Text className="text-[#7C3AED] font-bold">BEFORE</Text> the auction starts.
          </Text>
        </View>
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Currency</Text>
      <View className="flex-row mb-4">
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

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Amount</Text>
      <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
        <Text className="text-slate-400 mr-2">{form.moneda === 'USD' ? '$' : '$'}</Text>
        <TextInput
          className="flex-1 text-black"
          placeholder="0.00"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={form.montoCertificado}
          onChangeText={(t) => setForm({ ...form, montoCertificado: t })}
        />
      </View>

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Issuing Bank</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
        placeholder="e.g. Banco Galicia"
        placeholderTextColor="#94a3b8"
        value={form.banco}
        onChangeText={(t) => setForm({ ...form, banco: t })}
      />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Check Number (optional)</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
        placeholder="10-digit check number"
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
        value={form.numeroCheque}
        onChangeText={(t) => setForm({ ...form, numeroCheque: t })}
      />

      <Text className="font-bold text-xs text-slate-500 mb-2 uppercase tracking-wider">Expiry Date (yyyy-MM-dd)</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-black mb-4"
        placeholder="2026-12-31"
        placeholderTextColor="#94a3b8"
        value={form.fechaVencimiento}
        onChangeText={(t) => setForm({ ...form, fechaVencimiento: t })}
      />

      <TouchableOpacity
        className="flex-row items-center mb-8"
        onPress={() => setForm({ ...form, internacional: !form.internacional })}
      >
        <View className={`w-5 h-5 rounded border ${form.internacional ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
          {form.internacional && <Feather name="check" size={14} color="white" />}
        </View>
        <Text className="font-medium text-slate-600 text-sm">International check</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={saving}
        className="bg-[#a78bfa] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200 mb-6"
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-sm">Submit Check for Verification</Text>
        )}
      </TouchableOpacity>

      <Text className="text-[10px] text-center text-slate-400 leading-4 px-4">
        By submitting, you agree to our verification protocols and understand that funds will be locked upon successful check validation.
      </Text>
    </View>
  );
}
