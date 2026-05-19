import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import {
  buildImageUrl,
  conectarASubasta,
  getCatalogosBySubasta,
  getSubastaById,
} from '../services/api';

const auctionFallbackImage =
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop';

const itemFallbackImage =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop';

export default function ViewAuctionScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const subastaId = route?.params?.subastaId;

  const [subasta, setSubasta] = useState(null);
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadAuction = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [subastaData, catalogosData] = await Promise.all([
          getSubastaById(subastaId),
          getCatalogosBySubasta(subastaId),
        ]);

        setSubasta(subastaData);
        setCatalogos(Array.isArray(catalogosData) ? catalogosData : []);
      } catch (error) {
        setErrorMessage(error.message || 'No se pudo cargar la subasta.');
      } finally {
        setLoading(false);
      }
    };

    if (subastaId) {
      loadAuction();
    } else {
      setLoading(false);
      setErrorMessage('No se recibió el ID de la subasta.');
    }
  }, [subastaId]);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const data = await conectarASubasta(subastaId, token);
      const numeroPostor =
        data?.asistente?.numeroPostor || data?.numeroPostor || null;

      setSuccessMessage(
        numeroPostor
          ? `Conectado correctamente. Número de postor: ${numeroPostor}`
          : 'Conectado correctamente a la subasta.'
      );
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo conectar a la subasta.');
    } finally {
      setConnecting(false);
    }
  };

  const items = catalogos.flatMap((catalogo) => catalogo.items || []);

  const totalBase = items.reduce(
    (sum, item) => sum + Number(item.precioBase || 0),
    0
  );

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>

        <Text className="text-base font-bold text-slate-800">
          Detalle de subasta
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="bg-white rounded-3xl p-6 mt-4">
            <Text className="text-slate-500">Cargando subasta...</Text>
          </View>
        ) : errorMessage && !subasta ? (
          <View className="bg-white rounded-3xl p-6 mt-4">
            <Text className="text-red-500">{errorMessage}</Text>
          </View>
        ) : (
          <>
            <View className="mb-4 relative">
              <ImageBackground
                source={{ uri: auctionFallbackImage }}
                className="w-full h-48 rounded-3xl overflow-hidden justify-end"
                imageStyle={{ borderRadius: 24 }}
              >
                <View className="absolute inset-0 bg-black/40" />

                <View className="p-4">
                  <View className="bg-purple-300/90 px-3 py-1.5 rounded-full flex-row items-center self-start mb-3">
                    <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                      {subasta?.estado || 'abierta'}
                    </Text>
                  </View>

                  <Text className="text-white text-2xl font-bold">
                    Subasta #{subasta?.identificador}
                  </Text>

                  <Text className="text-white/90 mt-1">
                    {subasta?.ubicacion}
                  </Text>
                </View>
              </ImageBackground>
            </View>

            <View className="bg-[#a78bfa] rounded-3xl p-6 mb-4 shadow-md shadow-purple-200">
              <Text className="text-purple-100 text-[10px] font-bold tracking-widest uppercase mb-1">
                Valor base total
              </Text>

              <Text className="text-white text-4xl font-bold tracking-tight">
                ${totalBase.toLocaleString('es-AR')}
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200">
              <View className="flex-row items-center mb-3">
                <Feather name="clock" size={20} color="#7C3AED" />
                <Text className="text-slate-800 font-bold ml-2">
                  {subasta?.fecha} - {subasta?.hora}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Feather name="map-pin" size={20} color="#7C3AED" />
                <Text className="text-slate-600 ml-2">
                  {subasta?.ubicacion}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Feather name="tag" size={20} color="#7C3AED" />
                <Text className="text-slate-600 ml-2">
                  Categoría {subasta?.categoria} · {subasta?.moneda}
                </Text>
              </View>
            </View>

            {errorMessage ? (
              <Text className="text-red-500 mb-3">{errorMessage}</Text>
            ) : null}

            {successMessage ? (
              <Text className="text-green-600 mb-3">{successMessage}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleConnect}
              disabled={connecting}
              className="bg-[#7C3AED] rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-200 mb-6"
            >
              <Text className="text-white font-bold text-lg">
                {connecting ? 'Conectando...' : 'Conectarme a la subasta'}
              </Text>
            </TouchableOpacity>

            <Text className="text-xl font-bold text-slate-800 mb-4 px-1">
              Objetos del catálogo
            </Text>

            <View className="mb-10">
              {items.length > 0 ? (
                items.map((item) => {
                  const imageUri =
                    buildImageUrl(item.imagenPrincipal) || itemFallbackImage;

                  return (
                    <TouchableOpacity
                      key={item.identificador}
                      onPress={() =>
                        navigation.navigate('ItemDetail', {
                          itemId: item.identificador,
                          subastaId,
                        })
                      }
                      className="bg-white rounded-3xl p-3 mb-4 shadow-sm shadow-slate-200 flex-row items-center"
                    >
                      <Image
                        source={{ uri: imageUri }}
                        className="w-16 h-16 rounded-2xl bg-slate-100"
                        resizeMode="cover"
                      />

                      <View className="flex-1 ml-4">
                        <Text className="text-[#7C3AED] text-[9px] font-bold tracking-widest uppercase mb-0.5">
                          ITEM #{item.identificador}
                        </Text>

                        <Text className="font-bold text-slate-800 text-sm mb-1">
                          {item.descripcion || 'Objeto de subasta'}
                        </Text>

                        <View className="flex-row items-center">
                          <Text className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">
                            Precio base
                          </Text>

                          <Text className="text-[#7C3AED] font-bold text-xs">
                            ${Number(item.precioBase || 0).toLocaleString('es-AR')}
                          </Text>
                        </View>
                      </View>

                      <View className="p-3">
                        <Feather name="chevron-right" size={20} color="#cbd5e1" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text className="text-slate-400 text-center mt-4">
                  No hay objetos cargados para esta subasta.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Footer />
    </View>
  );
}