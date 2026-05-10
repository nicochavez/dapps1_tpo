import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Simulamos las respuestas de los GET endpoints
import itemsData from '../data/items.json';
import addressesData from '../data/addresses.json';
import paymentMethodsData from '../data/paymentMethods.json';

export default function CompletePurchaseScreen({ navigation }) {
  // 1. GET /productos/{productoId} (Simulamos obtener la laptop del diseño)
  const item = itemsData.find(i => i.title.toLowerCase().includes('lenovo')) || itemsData[0];
  
  // 2. GET /usuarios/{userId}/direcciones/favorita
  const defaultAddress = addressesData.find(a => a.userId === 'u1' && a.isDefault);
  
  // 3. GET /usuarios/{userId}/medios-pago
  const paymentMethods = paymentMethodsData.filter(pm => pm.userId === 'u1');

  // Estados interactivos
  const [deliveryMethod, setDeliveryMethod] = useState('shipping'); // 'shipping' o 'pickup'
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]?.id);

  // Cálculos dinámicos
  const winningBid = item.currentBid || 1250;
  const shippingCost = deliveryMethod === 'shipping' ? 45.00 : 0.00;
  const salesTax = 0.00;
  const grandTotal = winningBid + shippingCost + salesTax;

  // 4. POST /clientes/me/newCompra (Simulación)
  const handleConfirmPay = () => {
    console.log('Enviando compra al backend...', {
      itemId: item.id,
      delivery: deliveryMethod,
      paymentId: selectedPayment,
      total: grandTotal
    });
    // Acá navegarías a una pantalla de "Success"
    alert('Payment successful!');
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Complete Purchase</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* --- PRODUCTO (AUCTION WON) --- */}
        <View className="bg-white rounded-3xl p-4 mb-6 shadow-sm shadow-slate-200 flex-row items-center">
          <Image 
            source={{ uri: item.image }} 
            className="w-20 h-20 rounded-2xl bg-slate-100" 
            resizeMode="cover"
          />
          <View className="flex-1 ml-4 justify-center">
            <View className="bg-purple-100 self-start px-2 py-0.5 rounded mb-1.5">
              <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">Auction Won</Text>
            </View>
            <Text className="text-base font-bold text-slate-800 mb-1" numberOfLines={2}>
              {item.title}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-slate-400 mr-1">Final Bid:</Text>
              <Text className="text-[#7C3AED] font-bold">${winningBid.toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
            </View>
          </View>
        </View>

        {/* --- DELIVERY DETAILS --- */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 px-1">Delivery Details</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200">
            
            {/* Toggle de envío */}
            <View className="flex-row bg-slate-100 rounded-xl p-1 mb-5">
              <TouchableOpacity 
                onPress={() => setDeliveryMethod('shipping')}
                className={`flex-1 py-2 rounded-lg items-center ${deliveryMethod === 'shipping' ? 'bg-[#7C3AED] shadow-sm' : ''}`}
              >
                <Text className={`font-bold text-xs ${deliveryMethod === 'shipping' ? 'text-white' : 'text-slate-500'}`}>Shipping</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setDeliveryMethod('pickup')}
                className={`flex-1 py-2 rounded-lg items-center ${deliveryMethod === 'pickup' ? 'bg-[#7C3AED] shadow-sm' : ''}`}
              >
                <Text className={`font-bold text-xs ${deliveryMethod === 'pickup' ? 'text-white' : 'text-slate-500'}`}>Local Pickup</Text>
              </TouchableOpacity>
            </View>

            {/* Dirección */}
            {deliveryMethod === 'shipping' && defaultAddress && (
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-slate-800 text-base">Julianne Sterling</Text>
                  <TouchableOpacity>
                    <Text className="text-[#7C3AED] font-bold text-xs">Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-slate-500 text-sm mb-0.5">{defaultAddress.street}</Text>
                <Text className="text-slate-500 text-sm mb-3">{defaultAddress.city}, {defaultAddress.country} {defaultAddress.zipCode}</Text>
                
                <View className="flex-row items-center">
                  <Feather name="truck" size={14} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1.5 font-medium">Standard Delivery (3-5 Days)</Text>
                </View>
              </View>
            )}

            {deliveryMethod === 'pickup' && (
              <View className="py-2">
                <Text className="text-slate-500 text-sm">You can pick up your item at our main gallery in Buenos Aires.</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- PAYMENT METHOD --- */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-1 mb-3">
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Payment Method</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddPaymentMethod')}>
              <Text className="text-[#7C3AED] font-bold text-xs">Add New</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl p-2 shadow-sm shadow-slate-200">
            {paymentMethods.map((pm, index) => (
              <TouchableOpacity 
                key={pm.id} 
                onPress={() => setSelectedPayment(pm.id)}
                className={`flex-row items-center p-4 ${index !== paymentMethods.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                {/* Radio Button Customizado */}
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-4 ${selectedPayment === pm.id ? 'border-[#7C3AED]' : 'border-slate-300'}`}>
                  {selectedPayment === pm.id && <View className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full" />}
                </View>
                
                <View className="flex-1">
                  <Text className="font-bold text-slate-800 text-sm">
                    {pm.type === 'Credit' ? 'Visa' : 'Bank Account'} ending in {pm.lastFour}
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                    {pm.type === 'Credit' ? `EXPIRES ${pm.expiry}` : 'DIRECT DEPOSIT'}
                  </Text>
                </View>
                
                <Feather name={pm.type === 'Credit' ? "credit-card" : "briefcase"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- SUMMARY --- */}
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm shadow-slate-200">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Summary</Text>
          
          <View className="flex-row justify-between mb-2.5">
            <Text className="text-slate-500">Winning Bid</Text>
            <Text className="font-bold text-slate-700">${winningBid.toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
          </View>
          <View className="flex-row justify-between mb-2.5">
            <Text className="text-slate-500">Shipping Cost</Text>
            <Text className="font-bold text-slate-700">${shippingCost.toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-100">
            <Text className="text-slate-500">Sales Tax</Text>
            <Text className="font-bold text-slate-700">${salesTax.toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-slate-800 text-base">Grand Total</Text>
            <Text className="font-bold text-[#7C3AED] text-xl">${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
          </View>
        </View>

        <View className="h-10" /> {/* Espaciado para el botón flotante */}
      </ScrollView>

      {/* --- BOTÓN FIJO EN EL FOOTER --- */}
      <View className="bg-white pt-2 pb-8 px-6 border-t border-slate-100">
        <Text className="text-[10px] text-center text-slate-400 mb-3 px-4 leading-4">
          By tapping "Confirm & Pay", you agree to BidFlow's <Text className="text-[#7C3AED]">Terms of Service</Text> and authorize the payment for this auction item.
        </Text>
        
        <View className="flex-row justify-center space-x-4 mb-4">
          <Feather name="shield" size={14} color="#94a3b8" />
          <Feather name="lock" size={14} color="#94a3b8" />
          <MaterialCommunityIcons name="check-decagram-outline" size={14} color="#94a3b8" />
        </View>

        <TouchableOpacity 
          onPress={handleConfirmPay}
          className="bg-[#a78bfa] rounded-2xl py-4 items-center shadow-md shadow-purple-200"
        >
          <Text className="text-white font-bold text-base">Confirm & Pay</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}