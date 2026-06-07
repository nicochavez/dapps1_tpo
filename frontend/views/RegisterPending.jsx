import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header1 from '../components/Header1';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function RegisterPending() {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibimos userId Y step1Data que viene desde RegisterStep2
  // RegisterStep2 debe pasarlos así:
  //   navigation.navigate('RegisterPending', { userId, step1Data });
  const { userId, step1Data } = route.params || {};

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleVerifySimulation = async () => {
    if (!userId) {
      Alert.alert('Error', 'No se encontró el ID de usuario. Reiniciá el registro.');
      return;
    }

    setLoading(true);
    try {
      // Simulamos la demora de verificación del backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        '¡Verificación Exitosa!',
        'El usuario fue correctamente verificado.',
        [
          {
            text: 'OK',
            onPress: async () => {
              try {
                // Logueamos al usuario en el contexto global.
                // Usamos el email real capturado en el Step1 (si está disponible)
                // y el userId devuelto por el backend.
                await login({
                  id: userId,
                  email: step1Data?.email ?? 'user@bidflow.com',
                  token: 'mock-token', // reemplazar por el token real del backend
                });

                // Navegamos al Step3 pasando userId y step1Data para que
                // el Step3 pueda usarlos (ej: llamada a setPassword(userId))
                navigation.navigate('RegisterStep3', {
                  userId,
                  step1Data,
                });
              } catch (contextError) {
                console.error('Error al loguear en contexto:', contextError);
                Alert.alert('Error', 'No se pudo iniciar la sesión. Intentá de nuevo.');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-12 pb-10">
      <Header1 navigation={navigation} />

      <View className="flex-1 items-center justify-center">
        <View className="w-32 h-32 bg-purple-50 rounded-full items-center justify-center mb-6 relative">
          <Feather name="shield" size={48} color="#7C3AED" />
          <View className="absolute bottom-[-10px] bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            <Text className="text-[#7C3AED] text-[10px] font-bold uppercase tracking-wider">Processing</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-black mb-3">Verification Pending</Text>
        <Text className="text-slate-500 text-center px-4 leading-6">
          We are currently processing your verification. You will receive an email shortly with instructions to complete your registration.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center mb-4 flex-row"
        onPress={handleVerifySimulation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Got it, thanks!</Text>
        )}
      </TouchableOpacity>

      <Text className="text-slate-400 text-center text-xs px-6">
        You can still browse auctions while we verify your account, but bidding will be restricted.
      </Text>
    </View>
  );
}
