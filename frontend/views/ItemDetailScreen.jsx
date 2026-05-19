import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import {
  buildImageUrl,
  getHistorialPujas,
  getItemCatalogoDetalle,
  realizarPuja,
} from '../services/api';

const itemFallbackImage =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop';

export default function ItemDetailScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);

  const itemId = route?.params?.itemId;
  const subastaId = route?.params?.subastaId;
  const catalogoId = route?.params?.catalogoId;
  const itemResumen = route?.params?.itemResumen;

  const [item, setItem] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [activeImage, setActiveImage] = useState(itemFallbackImage);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const medioPagoId = 1;

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        let detalle = null;

        if (catalogoId && itemId) {
          detalle = await getItemCatalogoDetalle(catalogoId, itemId);
        }

        const pujas = await getHistorialPujas(subastaId, itemId);

        setItem(detalle);
        setHistorial(Array.isArray(pujas) ? pujas : []);

        const firstPhoto =
          detalle?.producto?.fotos?.[0]?.url ||
          itemResumen?.imagenPrincipal ||
          null;

        setActiveImage(buildImageUrl(firstPhoto) || itemFallbackImage);
      } catch (error) {
        setErrorMessage(error.message || 'No se pudo cargar el objeto.');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [catalogoId, itemId, subastaId]);

  const precioBase = Number(
    item?.precioBase ||
      itemResumen?.precioBase ||
      0
  );

  const mejorPuja = historial.length
    ? Math.max(...historial.map((puja) => Number(puja.importe || 0)))
    : 0;

  const currentBid = Math.max(precioBase, mejorPuja);

  const titulo =
    item?.producto?.descripcionCatalogo ||
    itemResumen?.descripcion ||
    'Objeto de subasta';

  const descripcion =
    item?.producto?.descripcionCompleta ||
    item?.producto?.descripcionCatalogo ||
    itemResumen?.descripcion ||
    'Sin descripción disponible.';

  const fotos = item?.producto?.fotos || [];
  const gallery =
    fotos.length > 0
      ? fotos.map((foto) => buildImageUrl(foto.url)).filter(Boolean)
      : [buildImageUrl(itemResumen?.imagenPrincipal) || itemFallbackImage];

  const handlePlaceBid = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const amount = Number(bidAmount);

    if (!amount || Number.isNaN(amount)) {
      setErrorMessage('Ingresá un importe válido.');
      return;
    }

    if (amount <= currentBid) {
      setErrorMessage(`La puja debe ser mayor a $${currentBid.toLocaleString('es-AR')}.`);
      return;
    }

    try {
      setPlacingBid(true);

      await realizarPuja(subastaId, itemId, amount, medioPagoId, token);

      setSuccessMessage('Puja realizada correctamente.');
      setBidAmount('');

      const pujasActualizadas = await getHistorialPujas(subastaId, itemId);
      setHistorial(Array.isArray(pujasActualizadas) ? pujasActualizadas : []);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo realizar la puja.');
    } finally {
      setPlacingBid(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      <Header />

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="bg-white rounded-3xl p-6 mt-4">
            <Text className="text-slate-500">Cargando objeto...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-row items-center mb-4"
            >
              <Feather name="arrow-left" size={20} color="#7C3AED" />
              <Text className="text-[#7C3AED] font-bold ml-2">Volver</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-slate-800 mb-4">
              {titulo}
            </Text>

            <View className="mb-6">
              <View className="relative mb-3">
                <Image
                  source={{ uri: activeImage || itemFallbackImage }}
                  className="w-full h-56 rounded-3xl bg-slate-200"
                  resizeMode="cover"
                />

                <View className="absolute top-4 left-4 bg-red-500/90 px-3 py-1.5 rounded-full flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                  <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                    Live Auction
                  </Text>
                </View>
              </View>

              <View className="flex-row">
                {gallery.map((img, index) => (
                  <TouchableOpacity
                    key={`${img}-${index}`}
                    onPress={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 mr-3 ${
                      activeImage === img ? 'border-[#7C3AED]' : 'border-transparent'
                    }`}
                  >
                    <Image
                      source={{ uri: img || itemFallbackImage }}
                      className="w-full h-full bg-slate-200"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row flex-wrap items-center justify-between mb-8">
              <View className="flex-row mb-3 w-full justify-between">
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-[#7C3AED] text-[10px] font-bold tracking-widest uppercase">
                    ITEM #{itemId}
                  </Text>
                </View>

                <View className="bg-[#a78bfa] px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                    Subasta #{subastaId}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
              <Text className="text-lg font-light text-slate-800 mb-4">
                Descripción
              </Text>

              <Text className="text-slate-500 leading-6 text-sm">
                {descripcion}
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  Puja actual
                </Text>

                <View className="bg-[#a78bfa] px-2 py-0.5 rounded">
                  <Text className="text-white text-[9px] font-bold uppercase tracking-wider">
                    Live
                  </Text>
                </View>
              </View>

              <View className="flex-row items-baseline mb-6">
                <Text className="text-4xl font-bold text-slate-800">
                  ${currentBid.toLocaleString('es-AR')}
                </Text>

                <Text className="text-xs text-slate-400 font-bold ml-2">
                  ARS
                </Text>
              </View>

              {errorMessage ? (
                <Text className="text-red-500 mb-3">{errorMessage}</Text>
              ) : null}

              {successMessage ? (
                <Text className="text-green-600 mb-3">{successMessage}</Text>
              ) : null}

              <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
                Importe
              </Text>

              <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-6 flex-row items-center">
                <Text className="text-slate-500 font-medium mr-2">$</Text>

                <TextInput
                  className="flex-1 text-slate-800 font-bold"
                  placeholder="Ingresá tu puja"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={bidAmount}
                  onChangeText={setBidAmount}
                />
              </View>

              <TouchableOpacity
                onPress={handlePlaceBid}
                disabled={placingBid}
                className="bg-[#a78bfa] rounded-2xl py-4 items-center shadow-sm shadow-purple-200"
              >
                <Text className="text-white font-bold text-base">
                  {placingBid ? 'Enviando puja...' : 'Place Bid'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-3xl p-6 mb-10 shadow-sm shadow-slate-200">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-light text-slate-800">
                  Historial de pujas
                </Text>

                <View className="bg-purple-100 px-2 py-0.5 rounded">
                  <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">
                    {historial.length} pujas
                  </Text>
                </View>
              </View>

              {historial.length > 0 ? (
                historial.map((puja, index) => (
                  <View
                    key={puja.identificador || index}
                    className={`flex-row justify-between items-center ${
                      index !== historial.length - 1 ? 'mb-6' : ''
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 mr-3">
                        <Text className="text-[#7C3AED] text-[10px] font-bold tracking-wider">
                          #{puja.numeroPostor || '-'}
                        </Text>
                      </View>

                      <View>
                        <Text className="font-bold text-slate-800 text-sm mb-0.5">
                          Postor {puja.numeroPostor || '-'}
                        </Text>

                        <Text className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                          {puja.timestamp || puja.fecha || ''}
                        </Text>
                      </View>
                    </View>

                    <Text className="font-bold text-[#7C3AED] text-sm">
                      ${Number(puja.importe || 0).toLocaleString('es-AR')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-slate-400">
                  Todavía no hay pujas para este objeto.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Footer />
    </KeyboardAvoidingView>
  );
}