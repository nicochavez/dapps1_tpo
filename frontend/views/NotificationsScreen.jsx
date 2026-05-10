import React, { useContext } from 'react'; // <-- Agregamos useContext
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 

import Footer from '../components/Footer';
import notificationsData from '../data/notifications.json';

// Importamos el Contexto
import { AuthContext } from '../context/AuthContext';

const getIconConfig = (type) => {
  switch (type) {
    case 'outbid':
      return { bg: 'bg-purple-100', icon: <MaterialCommunityIcons name="gavel" size={24} color="#7C3AED" /> };
    case 'won':
      return { bg: 'bg-emerald-100', icon: <Feather name="check" size={20} color="#10b981" /> };
    case 'payment':
      return { bg: 'bg-slate-100', icon: <Feather name="credit-card" size={20} color="#475569" /> };
    case 'view':
      return { bg: 'bg-slate-200', icon: <Feather name="eye" size={20} color="#475569" /> };
    case 'info':
      return { bg: 'bg-slate-200', icon: <Feather name="info" size={20} color="#475569" /> };
    default:
      return { bg: 'bg-slate-100', icon: <Feather name="bell" size={20} color="#475569" /> };
  }
};

export default function NotificationsScreen({ navigation }) {
  // Obtenemos al usuario activo desde la burbuja global
  const { user: currentUser } = useContext(AuthContext);

  // Protección estándar por si se corta la sesión
  if (!currentUser) return null;

  // Filtramos la base de datos usando el ID dinámico
  const userNotifications = notificationsData.filter(n => n.userId === currentUser.id);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      
      {/* --- HEADER PERSONALIZADO --- */}
      <View className="flex-row items-center px-6 pt-14 pb-6 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-800">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {/* --- LISTADO DE NOTIFICACIONES --- */}
        <View className="mb-10">
          {userNotifications.length > 0 ? (
            userNotifications.map((notification) => {
              const config = getIconConfig(notification.type);
              
              return (
                <TouchableOpacity 
                  key={notification.id} 
                  className={`bg-white rounded-3xl p-5 mb-4 flex-row ${
                    notification.isRead ? 'shadow-sm shadow-slate-100' : 'shadow-md shadow-slate-200 border border-purple-50'
                  }`}
                >
                  <View className={`w-12 h-12 rounded-full ${config.bg} items-center justify-center mr-4`}>
                    {config.icon}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className={`text-[15px] font-bold flex-1 pr-2 ${
                        notification.isRead ? 'text-slate-600' : 'text-slate-800'
                      }`}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full mt-1.5" />
                      )}
                    </View>
                    
                    <Text className={`text-[13px] mb-3 leading-5 ${
                      notification.isRead ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {notification.message}
                    </Text>
                    
                    <Text className="text-[11px] text-slate-400 font-medium">
                      {notification.timestamp}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            /* Estado Vacío por si el usuario no tiene notificaciones */
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