import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Importamos los 3 componentes que acabamos de crear
import CardForm from '../components/CardForm';
import BankForm from '../components/BankForm';
import CheckForm from '../components/CheckForm';

export default function AddPaymentMethodScreen({ navigation }) {
  // Estado para controlar qué tab está activa. 
  // Opciones: 'bank', 'card', 'check'
  const [activeMethod, setActiveMethod] = useState('card');

  // Función que decide qué componente renderizar
  const renderActiveForm = () => {
    switch (activeMethod) {
      case 'bank': return <BankForm />;
      case 'card': return <CardForm />;
      case 'check': return <CheckForm />;
      default: return <CardForm />;
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-6 bg-white z-10 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Add Payment Method</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* SELECTOR DE TABS */}
        <View className="flex-row justify-between mb-8">
          
          {/* Opción 1: Bank Account */}
          <TouchableOpacity 
            onPress={() => setActiveMethod('bank')}
            className={`flex-1 items-center justify-center p-3 rounded-2xl border mr-2 ${
              activeMethod === 'bank' ? 'border-[#7C3AED] bg-purple-50' : 'border-slate-200 bg-white'
            }`}
          >
            <MaterialCommunityIcons name="bank" size={24} color={activeMethod === 'bank' ? '#7C3AED' : '#94a3b8'} className="mb-1" />
            <Text className={`text-[10px] font-bold text-center leading-3 mt-1 ${activeMethod === 'bank' ? 'text-[#7C3AED]' : 'text-slate-400'}`}>
              Bank{'\n'}Account
            </Text>
          </TouchableOpacity>

          {/* Opción 2: Credit/Debit Card */}
          <TouchableOpacity 
            onPress={() => setActiveMethod('card')}
            className={`flex-1 items-center justify-center p-3 rounded-2xl border mx-1 ${
              activeMethod === 'card' ? 'border-[#7C3AED] bg-purple-50' : 'border-slate-200 bg-white'
            }`}
          >
            <Feather name="credit-card" size={24} color={activeMethod === 'card' ? '#7C3AED' : '#94a3b8'} className="mb-1" />
            <Text className={`text-[10px] font-bold text-center leading-3 mt-1 ${activeMethod === 'card' ? 'text-[#7C3AED]' : 'text-slate-400'}`}>
              Credit/Debit{'\n'}Card
            </Text>
          </TouchableOpacity>

          {/* Opción 3: Certified Check */}
          <TouchableOpacity 
            onPress={() => setActiveMethod('check')}
            className={`flex-1 items-center justify-center p-3 rounded-2xl border ml-2 ${
              activeMethod === 'check' ? 'border-[#7C3AED] bg-purple-50' : 'border-slate-200 bg-white'
            }`}
          >
            <MaterialCommunityIcons name="file-certificate-outline" size={24} color={activeMethod === 'check' ? '#7C3AED' : '#94a3b8'} className="mb-1" />
            <Text className={`text-[10px] font-bold text-center leading-3 mt-1 ${activeMethod === 'check' ? 'text-[#7C3AED]' : 'text-slate-400'}`}>
              Certified{'\n'}Check
            </Text>
          </TouchableOpacity>

        </View>

        {/* RENDERIZADO DINÁMICO DEL FORMULARIO */}
        <View className="mb-10">
          {renderActiveForm()}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}