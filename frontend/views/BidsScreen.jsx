import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import bidsData from '../data/bids.json';
import itemsData from '../data/items.json';
import catalogsData from '../data/catalogs.json';
import usersData from '../data/users.json';

const CATEGORY_COLORS = {
  comun:    { bg: 'bg-slate-100',  text: 'text-slate-600'  },
  especial: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  plata:    { bg: 'bg-slate-200',  text: 'text-slate-700'  },
  oro:      { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  platino:  { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const fmt = (v) =>
  `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  const d = new Date(iso);
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

function BidRow({ bid, currentUserId }) {
  const isMe = bid.userId === currentUserId;
  const user = usersData.find(u => u.id === bid.userId);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '?';

  return (
    <View className={`flex-row items-center py-2.5 ${bid.ganador ? 'bg-emerald-50 -mx-4 px-4 rounded-xl' : ''}`}>
      <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${isMe ? 'bg-[#7C3AED]' : 'bg-slate-200'}`}>
        <Text className={`text-[9px] font-bold ${isMe ? 'text-white' : 'text-slate-600'}`}>{initials}</Text>
      </View>
      <Text className={`flex-1 text-xs font-medium ${isMe ? 'text-slate-800' : 'text-slate-500'}`}>
        {isMe ? 'You' : (user?.name ?? 'User')}
      </Text>
      <Text className="text-[10px] text-slate-400 mr-3">{fmtDate(bid.fecha)}</Text>
      <Text className={`text-sm font-bold mr-2 ${bid.ganador ? 'text-emerald-600' : isMe ? 'text-slate-800' : 'text-slate-500'}`}>
        {fmt(bid.importe)}
      </Text>
      {bid.ganador && <Feather name="award" size={14} color="#10b981" />}
    </View>
  );
}

function AuctionCard({ auction, expanded, onToggle, currentUserId, navigation }) {
  const { catalog, userBids, won, isActive } = auction;
  const cat = catalog.subasta.categoria;
  const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.comun;

  // Unique items the user bid on within this auction
  const itemIds = [...new Set(userBids.map(b => b.itemId))];
  const userTotal = userBids.reduce((s, b) => s + b.importe, 0);
  const userHighest = Math.max(...userBids.map(b => b.importe));

  return (
    <View className="bg-white rounded-3xl mb-4 shadow-sm shadow-slate-100 overflow-hidden">
      {/* Card header */}
      <TouchableOpacity onPress={onToggle} className="p-4 flex-row items-center" activeOpacity={0.7}>
        <Image
          source={{ uri: catalog.image }}
          className="w-14 h-14 rounded-2xl bg-slate-200 mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-sm mb-1" numberOfLines={1}>
            {catalog.descripcion}
          </Text>
          <View className="flex-row items-center">
            <View className={`${colors.bg} px-2 py-0.5 rounded mr-2`}>
              <Text className={`text-[9px] font-bold uppercase tracking-wider ${colors.text}`}>{cat}</Text>
            </View>
            <Text className="text-[9px] text-slate-400 font-medium">{catalog.itemCategory}</Text>
          </View>
        </View>
        <View className="items-end ml-2">
          {isActive ? (
            <View className="bg-[#7C3AED] px-2 py-0.5 rounded-full mb-1">
              <Text className="text-white text-[9px] font-bold uppercase">Live</Text>
            </View>
          ) : won ? (
            <View className="bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
              <Text className="text-emerald-700 text-[9px] font-bold uppercase">Won</Text>
            </View>
          ) : (
            <View className="bg-slate-100 px-2 py-0.5 rounded-full mb-1">
              <Text className="text-slate-500 text-[9px] font-bold uppercase">Lost</Text>
            </View>
          )}
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#94a3b8" />
        </View>
      </TouchableOpacity>

      {/* Summary strip */}
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

      {/* Expanded: bid history per item */}
      {expanded && (
        <View className="border-t border-slate-100 px-4 pb-4 pt-3">
          {itemIds.map(itemId => {
            const item = itemsData.find(i => i.id === itemId);
            if (!item) return null;
            // All bids on this item (all users), sorted chronologically
            const history = bidsData
              .filter(b => b.itemId === itemId)
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            return (
              <View key={itemId} className="mb-4">
                <TouchableOpacity
                  onPress={() => navigation.navigate('ItemDetail', { itemId })}
                  className="flex-row items-center mb-3"
                >
                  <Image
                    source={{ uri: item.image }}
                    className="w-10 h-10 rounded-xl bg-slate-200 mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="font-bold text-slate-800 text-xs" numberOfLines={1}>
                      {item.producto?.descripcionCatalogo ?? item.title}
                    </Text>
                    <Text className="text-[9px] text-slate-400">{item.pieceNumber}</Text>
                  </View>
                  <Feather name="external-link" size={14} color="#a78bfa" />
                </TouchableOpacity>

                {/* Bid sequence */}
                <View className="bg-slate-50 rounded-2xl p-4">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Bid History
                  </Text>
                  {history.map((bid, idx) => (
                    <View key={bid.id}>
                      <BidRow bid={bid} currentUserId={currentUserId} />
                      {idx < history.length - 1 && (
                        <View className="h-px bg-slate-100 my-1" />
                      )}
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

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'You need to be logged in to view your bids.', [
        { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
        { text: 'Go to Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
      ]);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // ── Build enriched auction map ───────────────────────────────────────────
  const userBids = bidsData.filter(b => b.userId === currentUser.id);

  const auctionMap = {};
  userBids.forEach(bid => {
    const item = itemsData.find(i => i.id === bid.itemId);
    const catalog = item ? catalogsData.find(c => c.id === item.catalogo) : null;
    if (!item || !catalog) return;

    if (!auctionMap[catalog.id]) {
      auctionMap[catalog.id] = { catalog, userBids: [], won: false, isActive: false };
    }
    auctionMap[catalog.id].userBids.push({ ...bid, item });
    if (bid.ganador) auctionMap[catalog.id].won = true;
    if (item.estadoLote === 'en_puja') auctionMap[catalog.id].isActive = true;
  });

  const auctions = Object.values(auctionMap);
  const activeAuction = auctions.find(a => a.isActive) ?? null;
  const pastAuctions  = auctions.filter(a => !a.isActive);

  // ── Global metrics ───────────────────────────────────────────────────────
  const attended    = auctions.length;
  const wonCount    = auctions.filter(a => a.won).length;
  const totalPaid   = userBids.filter(b => b.ganador).reduce((s, b) => s + b.importe, 0);
  const totalOffered = userBids.reduce((s, b) => s + b.importe, 0);
  const winRate     = attended > 0 ? Math.round((wonCount / attended) * 100) : 0;

  // ── Category breakdown ───────────────────────────────────────────────────
  const categoryStats = {};
  auctions.forEach(a => {
    const cat = a.catalog.subasta.categoria;
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, won: 0 };
    categoryStats[cat].total++;
    if (a.won) categoryStats[cat].won++;
  });

  const toggleAuction = (id) => setExpandedAuction(prev => (prev === id ? null : id));

  const cardProps = (auction) => ({
    auction,
    expanded: expandedAuction === auction.catalog.id,
    onToggle: () => toggleAuction(auction.catalog.id),
    currentUserId: currentUser.id,
    navigation,
  });

  return (
    <View className="flex-1 bg-[#f8fafc]">

      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800">My Bids</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

        {/* ACTIVE AUCTION BANNER */}
        {activeAuction && (
          <View className="bg-[#7C3AED] rounded-2xl p-4 mb-6 flex-row items-center">
            <View className="bg-white/20 p-2 rounded-full mr-3">
              <Feather name="zap" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm mb-0.5">Currently Active</Text>
              <Text className="text-purple-200 text-xs" numberOfLines={1}>
                {activeAuction.catalog.descripcion}
              </Text>
            </View>
            <View className="bg-white/20 px-2 py-1 rounded-full">
              <Text className="text-white text-[9px] font-bold uppercase">Live</Text>
            </View>
          </View>
        )}

        {/* STATS GRID — 2×2 */}
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

        {/* TOTAL OFFERED */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm shadow-slate-100 flex-row justify-between items-center">
          <View>
            <Text className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">Total Offered</Text>
            <Text className="text-2xl font-bold text-slate-800">{fmt(totalOffered)}</Text>
          </View>
          <View className="bg-slate-100 p-3 rounded-full">
            <Feather name="trending-up" size={20} color="#7C3AED" />
          </View>
        </View>

        {/* CATEGORY BREAKDOWN */}
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

        {/* TABS */}
        <View className="flex-row bg-slate-100 p-1 rounded-full mb-6">
          {['Active', 'History'].map(tab => {
            const isSel = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 items-center py-3 rounded-full ${isSel ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-sm font-bold ${isSel ? 'text-[#7C3AED]' : 'text-slate-500'}`}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ACTIVE TAB */}
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
                <AuctionCard {...cardProps(activeAuction)} />
              </>
            ) : (
              <EmptyState message="You are not in any active auction" icon="zap" />
            )}
          </View>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'History' && (
          <View className="mb-10">
            {pastAuctions.length > 0 ? (
              pastAuctions.map(auction => (
                <AuctionCard key={auction.catalog.id} {...cardProps(auction)} />
              ))
            ) : (
              <EmptyState message="No past auctions found" icon="clock" />
            )}
          </View>
        )}

      </ScrollView>

      <Footer />
    </View>
  );
}
