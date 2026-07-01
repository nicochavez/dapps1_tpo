import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const fmt = (v) =>
  `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const fmtTime = (iso) => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes().toString().padStart(2, '0')}`;
};

function BidRow({ bid, currentUserId, canAccessPrices, isFirst }) {
  // Pujas reales del backend: anónimas por numeroPostor.
  const displayName = bid.numeroPostor != null ? `Bidder #${bid.numeroPostor}` : 'Bidder';
  const initials = bid.numeroPostor != null ? `#${bid.numeroPostor}` : '?';
  const isMe = false;
  const isWinner = bid.ganador === true || bid.ganador === 'si';

  return (
    <View
      className={`flex-row items-center py-3 ${
        isFirst && isWinner ? 'bg-emerald-50 -mx-4 px-4 rounded-xl' : ''
      }`}
    >
      {/* Avatar */}
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 border ${
          isMe
            ? 'bg-[#7C3AED] border-[#7C3AED]'
            : 'bg-slate-100 border-slate-200'
        }`}
      >
        <Text className={`text-[10px] font-bold tracking-wider ${isMe ? 'text-white' : 'text-[#7C3AED]'}`}>
          {initials}
        </Text>
      </View>

      {/* Name + timestamp */}
      <View className="flex-1">
        <Text className="font-bold text-slate-800 text-sm mb-0.5">
          {displayName}
        </Text>
        <Text className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
          {fmtTime(bid.fecha)}
        </Text>
      </View>

      {/* Amount + winner icon */}
      <View className="flex-row items-center">
        <Text
          className={`font-bold text-sm mr-2 ${
            isWinner
              ? 'text-emerald-600'
              : isMe
              ? 'text-[#7C3AED]'
              : 'text-slate-500'
          }`}
        >
          {canAccessPrices ? fmt(bid.importe) : '$ —,—'}
        </Text>
        {isWinner && <Feather name="award" size={14} color="#10b981" />}
      </View>
    </View>
  );
}

/**
 * BidHistorySection
 * Renders a sorted (desc) bid history list.
 * Used by ItemDetailLiveView (isLive=true) and ItemDetailEndedView (isLive=false).
 */
export default function BidHistorySection({
  bids = [],
  canAccessPrices,
  currentUserId,
  isLive = false,
  connected = false,
}) {
  return (
    <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-light text-slate-800">Bidding History</Text>
        <View className="flex-row items-center">
          {isLive && (
            <View
              className={`flex-row items-center px-2 py-0.5 rounded-full mr-2 ${
                connected ? 'bg-emerald-100' : 'bg-slate-100'
              }`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  connected ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              <Text
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  connected ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {connected ? 'Live' : 'Offline'}
              </Text>
            </View>
          )}
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">
              {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
            </Text>
          </View>
        </View>
      </View>

      {/* List */}
      {bids.length === 0 ? (
        <View className="py-8 items-center">
          <Feather name="inbox" size={28} color="#cbd5e1" />
          <Text className="text-slate-400 text-sm mt-2 font-medium">No bids yet</Text>
        </View>
      ) : (
        bids.map((bid, index) => (
          <View key={bid.id ?? index}>
            <BidRow
              bid={bid}
              currentUserId={currentUserId}
              canAccessPrices={canAccessPrices}
              isFirst={index === 0}
            />
            {index < bids.length - 1 && (
              <View className="h-px bg-slate-100" />
            )}
          </View>
        ))
      )}
    </View>
  );
}
