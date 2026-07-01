import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getMetricasMe, getMisParticipaciones, getCompras, buildImageUrl } from '../services/api';

const CATEGORY_COLORS = {
  comun:    { bg: 'bg-slate-100',  text: 'text-slate-600'  },
  especial: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  plata:    { bg: 'bg-slate-200',  text: 'text-slate-700'  },
  oro:      { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  platino:  { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);
const fmt = (v) => `$${num(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes().toString().padStart(2, '0')}`;
};

function EmptyState({ message, icon }) {
  return (
    <View className="items-center justify-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
      <Feather name={icon} size={32} color="#cbd5e1" />
      <Text className="text-slate-400 font-medium text-sm mt-3">{message}</Text>
    </View>
  );
}

// Puja del historial (anónima por numeroPostor).
function BidRow({ bid }) {
  const isWinner = bid.ganador === 'si' || bid.ganador === true;
  return (
    <View className={`flex-row items-center py-2.5 ${isWinner ? 'bg-emerald-50 -mx-4 px-4 rounded-xl' : ''}`}>
      <View className="w-7 h-7 rounded-full items-center justify-center mr-3 bg-slate-200">
        <Text className="text-[8px] font-bold text-slate-600">#{bid.numeroPostor}</Text>
      </View>
      <Text className="flex-1 text-xs font-medium text-slate-500">Bidder #{bid.numeroPostor}</Text>
      <Text className="text-[10px] text-slate-400 mr-3">{fmtDate(bid.timestamp)}</Text>
      <Text className={`text-sm font-bold mr-2 ${isWinner ? 'text-emerald-600' : 'text-slate-500'}`}>
        {fmt(bid.importe)}
      </Text>
      {isWinner && <Feather name="award" size={14} color="#10b981" />}
    </View>
  );
}

function AuctionCard({ participacion, expanded, onToggle, navigation }) {
  const { catalogoDescripcion, catalogoImage, categoria, itemCategory, misPujas = [], items = [], won, activa } = participacion;
  const colors = CATEGORY_COLORS[categoria] || CATEGORY_COLORS.comun;

  const itemIds = [...new Set(misPujas.map(b => b.itemId))];
  const userTotal = misPujas.reduce((s, b) => s + num(b.importe), 0);
  const userHighest = misPujas.length ? Math.max(...misPujas.map(b => num(b.importe))) : 0;
  const image = buildImageUrl(catalogoImage);

  return (
    <View className="bg-white rounded-3xl mb-4 shadow-sm shadow-slate-100 overflow-hidden">
      <TouchableOpacity onPress={onToggle} className="p-4 flex-row items-center" activeOpacity={0.7}>
        {image ? (
          <Image source={{ uri: image }} className="w-14 h-14 rounded-2xl bg-slate-200 mr-4" resizeMode="cover" />
        ) : (
          <View className="w-14 h-14 rounded-2xl bg-slate-100 mr-4 items-center justify-center">
            <Feather name="image" size={18} color="#cbd5e1" />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-sm mb-1" numberOfLines={1}>{catalogoDescripcion}</Text>
          <View className="flex-row items-center">
            <View className={`${colors.bg} px-2 py-0.5 rounded mr-2`}>
              <Text className={`text-[9px] font-bold uppercase tracking-wider ${colors.text}`}>{categoria}</Text>
            </View>
            {itemCategory ? <Text className="text-[9px] text-slate-400 font-medium">{itemCategory}</Text> : null}
          </View>
        </View>
        <View className="items-end ml-2">
          {activa ? (
            <View className="bg-[#7C3AED] px-2 py-0.5 rounded-full mb-1"><Text className="text-white text-[9px] font-bold uppercase">Live</Text></View>
          ) : won ? (
            <View className="bg-emerald-100 px-2 py-0.5 rounded-full mb-1"><Text className="text-emerald-700 text-[9px] font-bold uppercase">Won</Text></View>
          ) : (
            <View className="bg-slate-100 px-2 py-0.5 rounded-full mb-1"><Text className="text-slate-500 text-[9px] font-bold uppercase">Lost</Text></View>
          )}
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#94a3b8" />
        </View>
      </TouchableOpacity>

      <View className="flex-row border-t border-slate-50 px-4 py-3">
        <View className="flex-1 items-center">
          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Items Bid</Text>
          <Text className="font-bold text-slate-700 text-sm">{itemIds.length}</Text>
        </View>
        <View className="w-px bg-slate-100" />
        <View className="flex-1 items-center">
          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Highest</Text>
          <Text className="font-bold text-slate-700 text-sm">{fmt(userHighest)}</Text>
        </View>
        <View className="w-px bg-slate-100" />
        <View className="flex-1 items-center">
          <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Offered</Text>
          <Text className="font-bold text-slate-700 text-sm">{fmt(userTotal)}</Text>
        </View>
      </View>

      {expanded && (
        <View className="border-t border-slate-100 px-4 pb-4 pt-3">
          {items.map(item => {
            const history = [...(item.historial || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const img = buildImageUrl(item.imagen);
            return (
              <View key={item.itemId} className="mb-4">
                <View className="flex-row items-center mb-3">
                  {img ? (
                    <Image source={{ uri: img }} className="w-10 h-10 rounded-xl bg-slate-200 mr-3" resizeMode="cover" />
                  ) : (
                    <View className="w-10 h-10 rounded-xl bg-slate-100 mr-3 items-center justify-center">
                      <Feather name="image" size={14} color="#cbd5e1" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-bold text-slate-800 text-xs" numberOfLines={1}>{item.descripcion}</Text>
                    {item.enPuja ? <Text className="text-[9px] text-rose-500 font-bold">Bidding now</Text> : null}
                  </View>
                </View>

                <View className="bg-slate-50 rounded-2xl p-4">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bid History</Text>
                  {history.length === 0 ? (
                    <Text className="text-slate-400 text-xs">No bids yet</Text>
                  ) : history.map((bid, idx) => (
                    <View key={bid.identificador ?? idx}>
                      <BidRow bid={bid} />
                      {idx < history.length - 1 && <View className="h-px bg-slate-100 my-1" />}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function BidsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [expandedAuction, setExpandedAuction] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  const [metrics, setMetrics] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!currentUser?.token) return;
    try {
      setLoading(true);
      const [met, parts, comp] = await Promise.all([
        getMetricasMe(currentUser.token).catch(() => null),
        getMisParticipaciones(currentUser.token).catch(() => []),
        getCompras(currentUser.token).catch(() => null),
      ]);
      setMetrics(met);
      setParticipaciones(Array.isArray(parts) ? parts : []);
      const compList = comp?.content ?? (Array.isArray(comp) ? comp : []);
      setCompras(compList);
    } catch (error) {
      Alert.alert('No se pudieron cargar tus pujas', error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'You need to be logged in to view your bids.', [
        { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
        { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
      ]);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const activeAuction = participaciones.find(p => p.activa) ?? null;
  const pastAuctions = participaciones.filter(p => !p.activa);

  // Stats (autoritativo: métricas; fallback: participaciones)
  const allMisPujas = participaciones.flatMap(p => p.misPujas || []);
  const attended = metrics?.subastasAsistidas ?? participaciones.length;
  const wonCount = metrics?.subastasGanadas ?? participaciones.filter(p => p.won).length;
  const totalPaid = num(metrics?.totalPagado) || allMisPujas.filter(b => b.ganador).reduce((s, b) => s + num(b.importe), 0);
  const totalOffered = num(metrics?.totalOfertado) || allMisPujas.reduce((s, b) => s + num(b.importe), 0);
  const winRate = attended > 0 ? Math.min(100, Math.round((wonCount / attended) * 100)) : 0;

  // Category breakdown desde participaciones
  const categoryStats = {};
  participaciones.forEach(p => {
    const cat = p.categoria || 'comun';
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, won: 0 };
    categoryStats[cat].total++;
    if (p.won) categoryStats[cat].won++;
  });

  const toggleAuction = (id) => setExpandedAuction(prev => (prev === id ? null : id));

  // Subasta ganada: si no pagó -> a pagar (CompletePurchase); si pagó -> ver el item ganado.
  const goToWon = (compra) => {
    if (compra.estadoPago === 'pagado') {
      navigation.navigate('ItemDetail', {
        catalogoId: compra.catalogoId,
        itemId: compra.itemId,
        subastaId: compra.subasta?.identificador,
        won: true,
      });
    } else {
      navigation.navigate('CompletePurchase', { compraId: compra.identificador });
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">

      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Bids</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#7C3AED" /></View>
      ) : (
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        {activeAuction && (
          <View className="bg-[#7C3AED] rounded-2xl p-4 mb-6 flex-row items-center">
            <View className="bg-white/20 p-2 rounded-full mr-3"><Feather name="zap" size={16} color="white" /></View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm mb-0.5">Currently Active</Text>
              <Text className="text-purple-200 text-xs" numberOfLines={1}>{activeAuction.catalogoDescripcion}</Text>
            </View>
            <View className="bg-white/20 px-2 py-1 rounded-full"><Text className="text-white text-[9px] font-bold uppercase">Live</Text></View>
          </View>
        )}

        <View className="flex-row mb-3">
          <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm shadow-slate-100">
            <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Attended</Text>
            <Text className="text-3xl font-bold text-slate-800">{attended}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm shadow-slate-100">
            <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Won</Text>
            <Text className="text-3xl font-bold text-emerald-500">{wonCount}</Text>
          </View>
        </View>
        <View className="flex-row mb-6">
          <View className="flex-1 bg-[#a78bfa] rounded-2xl p-4 mr-2 shadow-sm shadow-purple-100">
            <Text className="text-[9px] font-bold text-purple-200 tracking-widest uppercase mb-1">Total Paid</Text>
            <Text className="text-xl font-bold text-white">{fmt(totalPaid)}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm shadow-slate-100">
            <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Win Rate</Text>
            <Text className="text-3xl font-bold text-slate-800">{winRate}%</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm shadow-slate-100 flex-row justify-between items-center">
          <View>
            <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Total Offered</Text>
            <Text className="text-2xl font-bold text-slate-800">{fmt(totalOffered)}</Text>
          </View>
          <View className="bg-slate-100 p-3 rounded-full"><Feather name="trending-up" size={20} color="#7C3AED" /></View>
        </View>

        {/* SUBASTAS GANADAS */}
        {compras.length > 0 && (
          <>
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">Won Auctions</Text>
            <View className="mb-6">
              {compras.map(compra => {
                const pagado = compra.estadoPago === 'pagado';
                return (
                  <TouchableOpacity
                    key={compra.identificador}
                    onPress={() => goToWon(compra)}
                    activeOpacity={0.8}
                    className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm shadow-slate-100 border ${pagado ? 'border-emerald-100' : 'border-amber-200'}`}
                  >
                    <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${pagado ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Feather name={pagado ? 'award' : 'credit-card'} size={18} color={pagado ? '#10b981' : '#d97706'} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800 text-sm mb-0.5" numberOfLines={1}>
                        {compra.producto?.descripcion}
                      </Text>
                      <Text className="text-xs text-slate-400">Total {fmt(compra.total)}</Text>
                    </View>
                    <View className="items-end ml-2">
                      <View className={`px-2 py-0.5 rounded-full mb-1 ${pagado ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                        <Text className={`text-[9px] font-bold uppercase tracking-wider ${pagado ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {pagado ? 'Paid' : 'Payment due'}
                        </Text>
                      </View>
                      <Text className={`text-[10px] font-bold ${pagado ? 'text-[#7C3AED]' : 'text-amber-700'}`}>
                        {pagado ? 'View item' : 'Complete purchase'}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#cbd5e1" className="ml-1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {Object.keys(categoryStats).length > 0 && (
          <>
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">By Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.comun;
                return (
                  <View key={cat} className={`${colors.bg} rounded-2xl px-5 py-3 mr-3 items-center min-w-[90px]`}>
                    <Text className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${colors.text}`}>{cat}</Text>
                    <Text className={`text-2xl font-bold ${colors.text}`}>{stats.total}</Text>
                    <Text className={`text-[9px] ${colors.text} opacity-70`}>{stats.won} won</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        <View className="flex-row bg-slate-100 p-1 rounded-full mb-6">
          {['Active', 'History'].map(tab => {
            const isSel = activeTab === tab;
            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`flex-1 items-center py-3 rounded-full ${isSel ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`text-sm font-bold ${isSel ? 'text-[#7C3AED]' : 'text-slate-500'}`}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'Active' && (
          <View className="mb-10">
            {activeAuction ? (
              <>
                <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex-row items-start">
                  <Feather name="info" size={14} color="#d97706" />
                  <Text className="text-amber-700 text-xs ml-2 flex-1 leading-5">
                    You can only participate in one auction at a time. You are currently locked to this one.
                  </Text>
                </View>
                <AuctionCard
                  participacion={activeAuction}
                  expanded={expandedAuction === activeAuction.subastaId}
                  onToggle={() => toggleAuction(activeAuction.subastaId)}
                  navigation={navigation}
                />
              </>
            ) : (
              <EmptyState message="You are not in any active auction" icon="zap" />
            )}
          </View>
        )}

        {activeTab === 'History' && (
          <View className="mb-10">
            {pastAuctions.length > 0 ? (
              pastAuctions.map(p => (
                <AuctionCard
                  key={p.subastaId}
                  participacion={p}
                  expanded={expandedAuction === p.subastaId}
                  onToggle={() => toggleAuction(p.subastaId)}
                  navigation={navigation}
                />
              ))
            ) : (
              <EmptyState message="No past auctions found" icon="clock" />
            )}
          </View>
        )}

      </ScrollView>
      )}

      <Footer />
    </View>
  );
}
