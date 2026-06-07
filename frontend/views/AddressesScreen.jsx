import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getDirecciones, createDireccion, deleteDireccion } from '../services/api';

const EMPTY_FORM = { nombre: '', calle: '', numero: '', ciudad: '', codigoPostal: '', favorito: false };

export default function AddressesScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const data = await getDirecciones(user.id, user.token);
      setAddresses(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSave = async () => {
    if (!form.calle || !form.ciudad || !form.codigoPostal) {
      Alert.alert('Validation', 'Please fill in Street, City and ZIP Code.');
      return;
    }
    setSaving(true);
    try {
      await createDireccion(user.id, {
        nombre: form.nombre || 'Mi dirección',
        calle: form.calle,
        numero: form.numero || '0',
        ciudad: form.ciudad,
        codigoPostal: form.codigoPostal,
        pais: 32,
        favorito: form.favorito,
      }, user.token);
      setForm(EMPTY_FORM);
      fetchAddresses();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (address) => {
    Alert.alert(
      'Delete address',
      `Remove "${address.nombre}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDireccion(user.id, address.identificador, user.token);
              fetchAddresses();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#f8fafc]">

      <View className="flex-row justify-between items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#7C3AED]">Addresses</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        <Text className="text-2xl font-bold text-slate-800 mb-6 mt-2">Saved Locations</Text>

        {loadingList ? (
          <ActivityIndicator color="#7C3AED" className="mb-6" />
        ) : (
          <View className="mb-10">
            {addresses.length === 0 && (
              <Text className="text-slate-400 text-sm mb-6">No addresses saved yet.</Text>
            )}
            {addresses.map((address) => (
              <View
                key={address.identificador}
                className={`bg-white rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 border-2 ${
                  address.favorito ? 'border-purple-200' : 'border-transparent'
                }`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center flex-1">
                    <Feather name="map-pin" size={18} color="#7C3AED" />
                    <Text className="font-bold text-slate-800 text-base ml-2 mr-3 flex-1" numberOfLines={1}>
                      {address.nombre}
                    </Text>
                    {address.favorito && (
                      <View className="bg-purple-100 px-2 py-0.5 rounded-md">
                        <Text className="text-[#7C3AED] text-[9px] font-bold tracking-wider uppercase">Default</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row space-x-4 ml-2">
                    <TouchableOpacity onPress={() => navigation.navigate('EditAddress', { direccion: address })}>
                      <Feather name="edit-2" size={16} color="#64748b" />
                    </TouchableOpacity>
                    {!address.favorito && (
                      <TouchableOpacity onPress={() => handleDelete(address)}>
                        <Feather name="trash-2" size={16} color="#64748b" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text className="text-slate-500 text-sm leading-5">
                  {`${address.calle} ${address.numero || ''}\n${address.ciudad}, ${address.codigoPostal}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text className="text-xl font-bold text-slate-800 mb-6">Add New Address</Text>

        <View className="mb-10">
          <Text className="font-bold text-xs text-slate-500 mb-2">Label (e.g. Home)</Text>
          <TextInput
            className="bg-slate-100 rounded-xl px-4 py-3 text-black mb-4"
            placeholder="Home"
            placeholderTextColor="#94a3b8"
            value={form.nombre}
            onChangeText={(t) => setForm({ ...form, nombre: t })}
          />

          <View className="flex-row justify-between mb-4">
            <View className="flex-[3] mr-2">
              <Text className="font-bold text-xs text-slate-500 mb-2">Street</Text>
              <TextInput
                className="bg-slate-100 rounded-xl px-4 py-3 text-black"
                placeholder="Av. Corrientes"
                placeholderTextColor="#94a3b8"
                value={form.calle}
                onChangeText={(t) => setForm({ ...form, calle: t })}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-bold text-xs text-slate-500 mb-2">Number</Text>
              <TextInput
                className="bg-slate-100 rounded-xl px-4 py-3 text-black"
                placeholder="1234"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={form.numero}
                onChangeText={(t) => setForm({ ...form, numero: t })}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-bold text-xs text-slate-500 mb-2">City</Text>
              <TextInput
                className="bg-slate-100 rounded-xl px-4 py-3 text-black"
                placeholder="Buenos Aires"
                placeholderTextColor="#94a3b8"
                value={form.ciudad}
                onChangeText={(t) => setForm({ ...form, ciudad: t })}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-bold text-xs text-slate-500 mb-2">ZIP Code</Text>
              <TextInput
                className="bg-slate-100 rounded-xl px-4 py-3 text-black"
                placeholder="0000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={form.codigoPostal}
                onChangeText={(t) => setForm({ ...form, codigoPostal: t })}
              />
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center mb-8"
            onPress={() => setForm({ ...form, favorito: !form.favorito })}
          >
            <View className={`w-5 h-5 rounded border ${form.favorito ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-slate-300'} items-center justify-center mr-3`}>
              {form.favorito && <Feather name="check" size={14} color="white" />}
            </View>
            <Text className="font-medium text-slate-600 text-sm">Set as default shipping address</Text>
          </TouchableOpacity>

          <View className="flex-row space-x-4 mb-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-200 rounded-2xl py-4 flex-1 items-center">
              <Text className="text-slate-600 font-bold text-sm">Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-[#a78bfa] rounded-2xl py-4 flex-1 items-center shadow-sm shadow-purple-200"
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm">Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
