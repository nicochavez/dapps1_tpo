import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getNotificaciones, marcarNotificacionLeida } from '../services/api';

// El backend no tipa la notificación: inferimos el ícono a partir del título (inglés).
const getIconConfig = (titulo = '') => {
  const t = titulo.toLowerCase();
  if (t.includes('accept')) {
    return { bg: 'bg-emerald-100', icon: <Feather name="check" size={20} color="#10b981" /> };
  }
  if (t.includes('reject')) {
    return { bg: 'bg-red-100', icon: <Feather name="x" size={20} color="#dc2626" /> };
  }
  if (t.includes('won') || t.includes('bid') || t.includes('auction') || t.includes('offer')) {
    return { bg: 'bg-purple-100', icon: <MaterialCommunityIcons name="gavel" size={22} color="#7C3AED" /> };
  }
  if (t.includes('payment') || t.includes('charge') || t.includes('fine') || t.includes('purchase')) {
    return { bg: 'bg-slate-100', icon: <Feather name="credit-card" size={20} color="#475569" /> };
  }
  return { bg: 'bg-slate-200', icon: <Feather name="bell" size={20} color="#475569" /> };
};

// Una notificación de puja ganada lleva al usuario a "Mis Pujas".
const isWinNotification = (titulo = '') => titulo.toLowerCase().includes('won');

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function NotificationsScreen({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      setNotifications(await getNotificaciones(currentUser.token));
    } catch (error) {
      Alert.alert('No se pudieron cargar las notificaciones', error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  useEffect(() => {
    if (!currentUser) {
      Alert.alert(
        'Sign in required',
        'You need to be logged in to view your notifications.',
        [
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
        ]
      );
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handlePress = async (n) => {
    // Optimista: marcamos como leída en UI y avisamos al backend (si hacía falta).
    if (!n.leida) {
      setNotifications(prev => prev.map(x => x.identificador === n.identificador ? { ...x, leida: true } : x));
      marcarNotificacionLeida(n.identificador, currentUser.token).catch(() => cargar());
    }
    // Si es una notificación de puja ganada, llevar a Mis Pujas para completar la compra.
    if (isWinNotification(n.titulo)) {
      navigation.navigate('Bids');
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-800">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        <View className="mb-10">
          {loading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator color="#7C3AED" />
            </View>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => {
              const config = getIconConfig(notification.titulo);

              return (
                <TouchableOpacity
                  key={notification.identificador}
                  onPress={() => handlePress(notification)}
                  activeOpacity={0.75}
                  className={`bg-white rounded-3xl p-5 mb-4 flex-row ${
                    notification.leida ? 'shadow-sm shadow-slate-100' : 'shadow-md shadow-slate-200 border border-purple-50'
                  }`}
                >
                  <View className={`w-12 h-12 rounded-full ${config.bg} items-center justify-center mr-4`}>
                    {config.icon}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className={`text-[15px] font-bold flex-1 pr-2 ${
                        notification.leida ? 'text-slate-600' : 'text-slate-800'
                      }`}>
                        {notification.titulo}
                      </Text>
                      {!notification.leida && (
                        <View className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full mt-1.5" />
                      )}
                    </View>

                    <Text className={`text-[13px] mb-3 leading-5 ${
                      notification.leida ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {notification.mensaje}
                    </Text>

                    <Text className="text-[11px] text-slate-400 font-medium">
                      {formatFecha(notification.fechaCreacion)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center justify-center mt-10 p-8">
              <View className="bg-slate-100 p-6 rounded-full mb-4">
                <Feather name="bell-off" size={32} color="#cbd5e1" />
              </View>
              <Text className="text-slate-800 font-bold text-lg mb-2">All caught up!</Text>
              <Text className="text-slate-400 text-center text-sm">
                You don't have any new notifications right now.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      <Footer />
    </View>
  );
}
