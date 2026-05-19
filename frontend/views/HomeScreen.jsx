import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSubastas } from '../services/api';

const auctionFallbackImage =
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop';

export default function HomeScreen({ navigation }) {
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadSubastas = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const data = await getSubastas();
        setSubastas(data?.content || []);
      } catch (error) {
        setErrorMessage(error.message || 'No se pudieron cargar las subastas.');
      } finally {
        setLoading(false);
      }
    };

    loadSubastas();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 bg-[#f8fafc]">
        <Header />

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-bold text-slate-800 mb-6 mt-2">
            Subastas disponibles
          </Text>

          <View className="flex-row items-center bg-slate-200/60 rounded-2xl px-4 py-4 mb-8">
            <Feather name="search" size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-3 text-slate-800"
              placeholder="Buscar subastas, ubicación..."
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-bold text-slate-800">
              Subastas abiertas
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('ExploreCatalogs')}
              className="bg-purple-50 px-3 py-1 rounded-full"
            >
              <Text className="text-sm font-bold text-slate-800">
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-8 overflow-visible"
          >
            {loading ? (
              <View className="w-72 h-48 rounded-3xl bg-white p-4 justify-center mr-4">
                <Text className="text-slate-500">Cargando subastas...</Text>
              </View>
            ) : errorMessage ? (
              <View className="w-72 h-48 rounded-3xl bg-white p-4 justify-center mr-4">
                <Text className="text-red-500">{errorMessage}</Text>
              </View>
            ) : subastas.length === 0 ? (
              <View className="w-72 h-48 rounded-3xl bg-white p-4 justify-center mr-4">
                <Text className="text-slate-500">
                  No hay subastas abiertas.
                </Text>
              </View>
            ) : (
              subastas.map((subasta) => (
                <TouchableOpacity
                  key={subasta.identificador}
                  onPress={() =>
                    navigation.navigate('ViewAuction', {
                      subastaId: subasta.identificador,
                    })
                  }
                  className="w-72 h-48 rounded-3xl overflow-hidden justify-end mr-4"
                >
                  <ImageBackground
                    source={{ uri: subasta.imagen || auctionFallbackImage }}
                    className="w-full h-full justify-end"
                    imageStyle={{ borderRadius: 24 }}
                  >
                    <View className="absolute inset-0 bg-black/40" />

                    <View className="p-4">
                      <View className="flex-row items-center mb-2">
                        {subasta.estado === 'abierta' && (
                          <View className="bg-red-100 px-1.5 py-0.5 rounded flex-row items-center mr-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
                            <Text className="text-[9px] text-red-600 font-bold uppercase">
                              Live
                            </Text>
                          </View>
                        )}

                        <Text className="text-white/80 text-xs">
                          #{subasta.identificador}
                        </Text>
                      </View>

                      <Text className="text-white font-bold text-lg mb-1">
                        Subasta en {subasta.ubicacion}
                      </Text>

                      <Text className="text-white/90 text-sm">
                        {subasta.fecha} - {subasta.hora}
                      </Text>

                      <Text className="text-white/90 text-sm">
                        Categoría: {subasta.categoria}
                      </Text>

                      <View className="flex-row justify-between items-center mt-3">
                        <Text className="text-white font-bold">
                          {subasta.moneda}
                        </Text>

                        <View className="bg-white/30 px-4 py-2 rounded-full border border-white/20">
                          <Text className="text-white font-bold text-xs">
                            Entrar
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">
              Próximas subastas
            </Text>

            <TouchableOpacity>
              <Feather name="sliders" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          <View className="mb-10">
            {loading ? (
              <Text className="text-slate-500">Cargando...</Text>
            ) : errorMessage ? (
              <Text className="text-red-500">{errorMessage}</Text>
            ) : subastas.length === 0 ? (
              <Text className="text-slate-500">
                No hay subastas para mostrar.
              </Text>
            ) : (
              subastas.map((subasta) => (
                <View
                  key={subasta.identificador}
                  className="flex-row bg-white rounded-3xl p-3 mb-4 shadow-sm shadow-slate-200 items-center"
                >
                  <View className="w-20 h-20 rounded-2xl bg-purple-100 items-center justify-center">
                    <Feather name="calendar" size={28} color="#7C3AED" />
                  </View>

                  <View className="flex-1 ml-4 justify-center">
                    <View className="flex-row items-center mb-1">
                      {subasta.estado === 'abierta' && (
                        <View className="bg-red-100 px-1.5 py-0.5 rounded flex-row items-center mr-2">
                          <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
                          <Text className="text-[9px] text-red-600 font-bold uppercase">
                            Live
                          </Text>
                        </View>
                      )}

                      <Text className="text-xs text-slate-400">
                        #{subasta.identificador}
                      </Text>
                    </View>

                    <Text
                      className="font-bold text-slate-800 mb-1"
                      numberOfLines={1}
                    >
                      Subasta en {subasta.ubicacion}
                    </Text>

                    <Text className="text-xs text-slate-400 mb-2">
                      {subasta.fecha} - {subasta.hora}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-[#7C3AED] font-bold">
                        {subasta.moneda}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('ViewAuction', {
                            subastaId: subasta.identificador,
                          })
                        }
                        className="bg-[#7C3AED] px-5 py-2 rounded-xl shadow-md shadow-purple-200"
                      >
                        <Text className="text-white font-bold text-xs">
                          Entrar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <Footer />
      </View>
    </KeyboardAvoidingView>
  );
}