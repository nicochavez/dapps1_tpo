import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { updateDireccion } from '../services/api';

export default function EditAddressScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const direccion = route?.params?.direccion;

  const [form, setForm] = useState({
    nombre: direccion?.nombre || '',
    calle: direccion?.calle || '',
    numero: String(direccion?.numero || ''),
    ciudad: direccion?.ciudad || '',
    codigoPostal: direccion?.codigoPostal || '',
    favorito: direccion?.favorito || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.calle || !form.ciudad || !form.codigoPostal) {
      Alert.alert('Validation', 'Please fill in Street, City and ZIP Code.');
      return;
    }
    setSaving(true);
    try {
      await updateDireccion(user.id, direccion.identificador, {
        nombre: form.nombre || 'Mi dirección',
        calle: form.calle,
        numero: form.numero || '0',
        ciudad: form.ciudad,
        codigoPostal: form.codigoPostal,
        pais: direccion?.pais || 32,
        favorito: form.favorito,
      }, user.token);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">

      <View className="flex-row justify-between items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#7C3AED]">Edit Address</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        <View className="mb-8 mt-2">
          <Text className="text-2xl font-bold text-slate-800 mb-2">Shipping Details</Text>
          <Text className="text-sm text-slate-500 leading-5">Update where you want your secured items delivered.</Text>
        </View>

        <View className="mb-10">
          <Text className="font-bold text-xs text-slate-800 mb-2">Label</Text>
          <TextInput
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-4"
            value={form.nombre}
            onChangeText={(t) => setForm({ ...form, nombre: t })}
            placeholder="Home"
            placeholderTextColor="#94a3b8"
          />

          <View className="flex-row justify-between mb-4">
            <View className="flex-[3] mr-2">
              <Text className="font-bold text-xs text-slate-800 mb-2">Street</Text>
              <TextInput
                className="bg-slate-200/60 rounded-xl px-4 py-3 text-black"
                value={form.calle}
                onChangeText={(t) => setForm({ ...form, calle: t })}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-bold text-xs text-slate-800 mb-2">Number</Text>
              <TextInput
                className="bg-slate-200/60 rounded-xl px-4 py-3 text-black"
                value={form.numero}
                onChangeText={(t) => setForm({ ...form, numero: t })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text className="font-bold text-xs text-slate-800 mb-2">City</Text>
          <TextInput
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-4"
            value={form.ciudad}
            onChangeText={(t) => setForm({ ...form, ciudad: t })}
          />

          <Text className="font-bold text-xs text-slate-800 mb-2">ZIP Code</Text>
          <TextInput
            className="bg-slate-200/60 rounded-xl px-4 py-3 text-black mb-6"
            value={form.codigoPostal}
            onChangeText={(t) => setForm({ ...form, codigoPostal: t })}
            keyboardType="numeric"
          />

          <TouchableOpacity
            className="flex-row items-center mb-8"
            onPress={() => setForm({ ...form, favorito: !form.favorito })}
          >
            <View className={`w-5 h-5 rounded border ${form.favorito ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
              {form.favorito && <Feather name="check" size={14} color="white" />}
            </View>
            <Text className="font-medium text-slate-800 text-sm">Set as default shipping address</Text>
          </TouchableOpacity>

          <View className="flex-row space-x-4 mb-10">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-slate-200 rounded-2xl py-4 flex-1 items-center"
            >
              <Text className="text-slate-600 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-[#a78bfa] rounded-2xl py-4 flex-1 items-center shadow-sm shadow-purple-200"
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
