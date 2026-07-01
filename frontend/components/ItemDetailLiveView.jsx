import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ItemDetailBase from './ItemDetailBase';
import BidHistorySection from './BidHistorySection';
import useLiveBids from '../hooks/useLiveBids';

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$ —,—';
  if (typeof value === 'string') return value;
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export default function ItemDetailLiveView(props) {
  const { item, canAccessPrices, currentUser, isOwner } = props;
  const [bidAmount, setBidAmount] = useState('');

  const lotState        = item?.estadoLote || (item?.subastado === 'si' ? 'subastado' : 'pendiente');
  const currentPriceNum = typeof item?.currentBid === 'number' ? item.currentBid
                        : typeof item?.precioBase === 'number' ? item.precioBase : 0;

  // Historial de pujas real (viene del backend por props). Se mantiene en sync por WS.
  const initialBids = props.bids ?? [];

  const { bids, connected } = useLiveBids(item?.id, initialBids);

  const handlePlaceBid = () => {
    if (!canAccessPrices) return;
    if (lotState !== 'en_puja') { alert('This lot is not currently open for bidding.'); return; }
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= currentPriceNum) {
      alert('Please enter a valid bid higher than the current bid.'); return;
    }
    // TODO: placeBid(item.id, currentUser.id, Number(bidAmount));
    console.log('Enviando puja...', { itemId: item?.id, userId: currentUser?.id, amount: bidAmount });
    alert('Bid placed successfully!');
    setBidAmount('');
  };

  return (
    <ItemDetailBase {...props} badgeColor="bg-red-500/90" badgeLabel="Live Auction">

      {/* Precio actual */}
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Current Bid</Text>
          <View className="bg-[#a78bfa] px-2 py-0.5 rounded">
            <Text className="text-white text-[9px] font-bold uppercase tracking-wider">Live Auction</Text>
          </View>
        </View>

        <View className="flex-row items-baseline mb-6">
          <Text className={`text-4xl font-bold ${canAccessPrices ? 'text-slate-800' : 'text-slate-300'}`}>
            {formatPrice(item?.currentBid ?? item?.precioBase)}
          </Text>
          {canAccessPrices && <Text className="text-xs text-slate-400 font-bold ml-2">USD</Text>}
        </View>

        {(canAccessPrices && !isOwner) ? (
          <>
            <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Set Amount</Text>
            <View className="bg-slate-200/60 rounded-xl px-4 py-3 mb-6 flex-row items-center">
              <Text className="text-slate-500 font-medium mr-2">$</Text>
              <TextInput
                className="flex-1 text-slate-800 font-bold"
                placeholder="Enter bid amount"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
              />
            </View>
            <TouchableOpacity
              onPress={handlePlaceBid}
              disabled={lotState !== 'en_puja'}
              className={`rounded-2xl py-4 items-center shadow-sm ${
                lotState === 'en_puja' ? 'bg-[#a78bfa] shadow-purple-200' : 'bg-slate-300'
              }`}
            >
              <Text className="text-white font-bold text-base">Place Bid</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="bg-slate-100 rounded-2xl py-4 items-center border border-slate-200 border-dashed">
            <Feather name="lock" size={18} color="#cbd5e1" />
            <Text className="text-slate-400 text-sm font-medium mt-2">
              {isOwner ? 'You cannot bid on your own item' : 'Bidding restricted'}
            </Text>
          </View>
        )}
      </View>

      {/* Historial de pujas en tiempo real */}
      <BidHistorySection
        bids={bids}
        canAccessPrices={canAccessPrices}
        currentUserId={currentUser?.id}
        isLive
        connected={connected}
      />

    </ItemDetailBase>
  );
}
