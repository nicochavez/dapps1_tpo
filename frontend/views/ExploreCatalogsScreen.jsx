import React, { useState, useContext, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, TouchableWithoutFeedback, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../components/Header';
import Footer from '../components/Footer';

import { AuthContext } from '../context/AuthContext';
import { getCatalogos, buildImageUrl } from '../services/api';

// Adapta el catálogo del backend al shape que usa esta pantalla.
function mapCatalogo(c) {
  return {
    ...c,
    id: c.identificador,
    totalItems: c.cantidadItems,
    image: buildImageUrl(c.image),
  };
}

// --- COMPONENTE DROPDOWN COMPACTO (Se mantiene igual que en la versión anterior) ---
const CustomDropdown = ({ label, options, selectedValue, isOpen, onToggle, onSelect, zIndex }) => {
  return (
    <View className="relative w-full" style={{ zIndex }}>
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">{label}</Text>
      
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onToggle}
        className={`flex-row justify-between items-center bg-white border rounded-xl px-2.5 py-2.5 ${isOpen ? 'border-[#a78bfa] shadow-sm shadow-purple-200' : 'border-slate-200'}`}
      >
        <Text 
          className={`font-medium text-xs flex-1 mr-1 ${selectedValue === 'All' ? 'text-slate-400' : 'text-slate-800'}`} 
          numberOfLines={1}
        >
          {selectedValue === 'All' ? 'All' : selectedValue}
        </Text>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={isOpen ? "#a78bfa" : "#94a3b8"} />
      </TouchableOpacity>

      {isOpen && (
        <View 
          className="absolute top-[55px] left-0 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-300 overflow-hidden min-w-[120px]" 
          style={{ elevation: 5 }}
        >
          <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 300 }}>
            {options.map((option, index) => (
              <TouchableOpacity 
                key={option}
                onPress={() => {
                  onSelect(option);
                  onToggle();
                }}
                className={`px-3 py-3 ${index !== options.length - 1 ? 'border-b border-slate-50' : ''} ${selectedValue === option ? 'bg-purple-50' : 'bg-white'}`}
              >
                <Text className={`text-xs ${selectedValue === option ? 'font-bold text-[#7C3AED]' : 'text-slate-600'}`}>
                  {option === 'All' ? 'All' : option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default function ExploreCatalogsScreen({ navigation }) {
  const { user: currentUser } = useContext(AuthContext);

  // DATOS DEL BACKEND
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS DE FILTROS
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemCategory, setActiveItemCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeUserCategory, setActiveUserCategory] = useState('All');
  const [openDropdown, setOpenDropdown] = useState(null);

  // silent=true: refresco de polling sin spinner ni alertas (no interrumpe la UI).
  const cargar = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getCatalogos(currentUser?.token);
      setCatalogs((data || []).map(mapCatalogo));
    } catch (error) {
      if (!silent) Alert.alert('No se pudieron cargar los catálogos', error.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser?.token]);

  // Recarga al enfocar + polling cada 15s para reflejar transiciones UPCOMING→LIVE→ENDED
  // que hace el scheduler del backend, sin tener que salir y volver a la pantalla.
  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(() => cargar(true), 15000);
      return () => clearInterval(intervalo);
    }, [cargar])
  );

  // EXTRACCIÓN DINÁMICA DE OPCIONES
  const itemCategories = ['All', ...new Set(catalogs.map(c => c.itemCategory).filter(Boolean))];
  const statuses = ['All', ...new Set(catalogs.map(c => c.subasta?.estado).filter(Boolean))];
  const userCategories = ['All', ...new Set(catalogs.map(c => c.subasta?.categoria).filter(Boolean))];

  // UTILIDADES DE UI PARA ESTADOS
  const getStatusInfo = (status) => {
    switch (status) {
      case 'abierta':
        return { label: 'LIVE', color: 'bg-red-500', textColor: 'text-red-700', icon: 'pulse' };
      case 'finalizada':
      case 'cerrada':
        return { label: 'ENDED', color: 'bg-slate-500', textColor: 'text-slate-700', icon: 'check-circle-outline' };
      case 'programada':
      default:
        return { label: 'UPCOMING', color: 'bg-blue-500', textColor: 'text-blue-700', icon: 'clock-outline' };
    }
  };

  // LÓGICA DE FILTRADO
  const filteredCatalogs = catalogs.filter((catalog) => {
    const query = searchQuery.toLowerCase().trim();
    const description = catalog.descripcion ? catalog.descripcion.toLowerCase() : '';
    const matchesSearch = query === '' || description.includes(query);
    const matchesItemCat = activeItemCategory === 'All' || catalog.itemCategory === activeItemCategory;
    const matchesStatus = activeStatus === 'All' || catalog.subasta?.estado === activeStatus;
    const matchesUserCat = activeUserCategory === 'All' || catalog.subasta?.categoria === activeUserCategory;
    return matchesSearch && matchesItemCat && matchesStatus && matchesUserCat;
  });

  const handleTouchOutside = () => {
    if (openDropdown !== null) setOpenDropdown(null);
  };

  // Formateador de fecha simple (ej: "OCT 24, 2026")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(year, month - 1, day).toLocaleDateString('en-US', options).toUpperCase();
  };

  // Formateador de hora simple (ej: "2:00 PM")
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouchOutside}>
      <View className="flex-1 bg-[#f8fafc]">
        <Header />

        <ScrollView 
          className="flex-1 px-6 pt-2" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          
          <Text className="text-3xl font-bold text-slate-800 mb-6">
            Explore Auctions
          </Text>
          
          {/* --- BARRA DE BÚSQUEDA --- */}
          <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-3.5 mb-4 border border-slate-200">
            <Feather name="search" size={18} color="#64748b" />
            <TextInput 
              className="flex-1 ml-3 text-sm text-slate-800"
              placeholder="Search catalogs, descriptions..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              onFocus={() => setOpenDropdown(null)} 
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                <Feather name="x-circle" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* --- SECCIÓN DE DROPDOWNS EN HORIZONTAL --- */}
          <View className="flex-row justify-between items-center mb-6 z-50 relative" style={{ zIndex: 50 }}>
            <View className="flex-1 mr-2" style={{ zIndex: 3000 }}>
              <CustomDropdown label="Category" options={itemCategories} selectedValue={activeItemCategory} isOpen={openDropdown === 'item'} onToggle={() => setOpenDropdown(openDropdown === 'item' ? null : 'item')} onSelect={setActiveItemCategory} zIndex={3000} />
            </View>
            <View className="flex-1 mr-2" style={{ zIndex: 2000 }}>
              <CustomDropdown label="Status" options={statuses} selectedValue={activeStatus} isOpen={openDropdown === 'status'} onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')} onSelect={setActiveStatus} zIndex={2000} />
            </View>
            <View className="flex-1" style={{ zIndex: 1000 }}>
              <CustomDropdown label="User" options={userCategories} selectedValue={activeUserCategory} isOpen={openDropdown === 'user'} onToggle={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')} onSelect={setActiveUserCategory} zIndex={1000} />
            </View>
          </View>

          {/* --- RESULTADOS: NUEVO DISEÑO DE TARJETAS --- */}
          <View>
            {loading ? (
              <View className="py-16 items-center justify-center">
                <ActivityIndicator color="#7C3AED" />
              </View>
            ) : filteredCatalogs.length > 0 ? (
              filteredCatalogs.map((catalog) => {
                const statusInfo = getStatusInfo(catalog.subasta?.estado);
                
                return (
                  <TouchableOpacity 
                    key={catalog.id} 
                    className="bg-white rounded-3xl mb-6 shadow-md shadow-slate-100 overflow-hidden border border-slate-100"
                    onPress={() => navigation.navigate('CatalogItems', { catalogId: catalog.id })}
                  >
                    <View className="flex-row p-4 items-center">
                      {/* Panel de Imagen Izquierdo */}
                      <View className="relative mr-4">
                        <Image 
                          source={{ uri: catalog.image }} 
                          className="w-28 h-28 rounded-2xl" 
                          resizeMode="cover"
                        />
                        {/* Etiqueta de Estado Flotante */}
                        <View className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg ${statusInfo.color}`}>
                          <Text className="text-white font-bold text-[9px] uppercase tracking-wider">
                            {statusInfo.label}
                          </Text>
                        </View>
                      </View>

                      {/* Panel de Información Derecho */}
                      <View className="flex-1 pr-2">
                        <Text className="text-lg font-bold text-slate-900 mb-1" numberOfLines={2}>
                          {catalog.descripcion}
                        </Text>
                        
                        {/* Fila de Estado Detallado */}
                        <View className="flex-row items-center mb-3">
                          <MaterialCommunityIcons name={statusInfo.icon} size={14} className={statusInfo.textColor} />
                          <Text className={`text-xs font-medium ml-1.5 ${statusInfo.textColor}`}>
                            Status: {statusInfo.label}
                          </Text>
                        </View>

                        {/* Detalles Clave con Iconos */}
                        <View className="space-y-1.5 border-t border-slate-100 pt-3">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                              <Feather name="calendar" size={13} color="#64748b" />
                              <Text className="text-xs text-slate-600 font-medium ml-2">
                                {formatDate(catalog.subasta?.fecha)}
                              </Text>
                            </View>
                            <Text className="text-xs text-slate-600 font-medium">
                              {formatTime(catalog.subasta?.hora)}
                            </Text>
                          </View>
                          
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                              <Feather name="package" size={13} color="#64748b" />
                              <Text className="text-xs text-slate-600 font-medium ml-2">
                                {catalog.totalItems} Items
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                              {catalog.subasta?.moneda && (
                                <View className="bg-slate-100 px-2 py-0.5 rounded">
                                  <Text className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                    {catalog.subasta.moneda}
                                  </Text>
                                </View>
                              )}
                              <View className="bg-amber-100 px-2 py-0.5 rounded">
                                <Text className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                                  {catalog.subasta?.categoria}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                      
                      {/* Indicador de flecha de micro-interacción */}
                      <Feather name="chevron-right" size={18} color="#cbd5e1" className="ml-1" />
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              // Vista de "No se encontraron resultados" (Se mantiene igual)
              <View className="items-center justify-center py-10 mt-4 bg-white rounded-3xl border border-slate-100 border-dashed">
                <Feather name="filter" size={32} color="#cbd5e1" className="mb-3" />
                <Text className="text-slate-800 font-bold text-base mb-1">No matches found</Text>
                <Text className="text-slate-400 text-sm text-center px-6 mb-4">
                  Try adjusting your search or resetting the dropdowns.
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSearchQuery('');
                    setActiveItemCategory('All');
                    setActiveStatus('All');
                    setActiveUserCategory('All');
                  }}
                  className="bg-purple-100 px-5 py-2.5 rounded-xl"
                >
                  <Text className="font-bold text-purple-600">Clear all filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
        <Footer />
      </View>
    </TouchableWithoutFeedback>
  );
}