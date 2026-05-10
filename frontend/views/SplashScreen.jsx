import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  
  useEffect(() => {
    // A los 2000 milisegundos (2 segundos) reemplaza la pantalla por el Login
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 2000);

    return () => clearTimeout(timer); // Limpiamos el timer por las dudas
  }, [navigation]);

  return (
    // Contenedor principal: Ocupa toda la pantalla con flex, centrado y fondo muy sutil
    <View className="flex-1 justify-center items-center bg-slate-50">
      
      {/* Sección central: Logo y Título */}
      <View className="items-center mb-40"> {/* Pushed up relative to the bottom elements */}
        {/* Logo (Asset local) */}
        <Image 
          source={require('../assets/logo.png')} // Asegurate que el asset exista
          className="w-16 h-16 mb-4" // Tamaño del logo y margen inferior
          resizeMode="contain"
        />
        
        {/* Texto "BidFlow": Grande, negrita, color púrpura de Figma */}
        <Text className="text-6xl font-bold text-[#7C3AED]">
          BidFlow
        </Text>
      </View>

      {/* Sección inferior: Línea de estado y Versión */}
      {/* Contenedor absoluto en la parte inferior de la pantalla */}
      <View className="absolute bottom-0 w-full flex items-center justify-end px-12 pb-16">
        
        {/* Línea horizontal divisoria: Muy sutil */}
        <View className="w-full h-[1px] bg-slate-100 mb-6" />

          {/* Texto de Estado: Pequeño, color gris tenue, mayúsculas y espaciado entre letras */}
          <Text className="text-sm font-light text-slate-400 uppercase tracking-widest mb-3">
            ESTABLISHING CONNECTION
          </Text>

          {/* Texto de Versión: Muy pequeño, color gris tenue */}
          <Text className="text-xs font-light text-slate-400">
            v1.0.42
          </Text>

      </View>

    </View>
  );
}