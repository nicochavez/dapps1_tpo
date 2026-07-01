import React from 'react';
import { View, Text } from 'react-native';
import ItemDetailBase from './ItemDetailBase';
import BidHistorySection from './BidHistorySection';

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$ —,—';
  if (typeof value === 'string') return value;
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export default function ItemDetailEndedView(props) {
  const { item, canAccessPrices, currentUser } = props;

  // Historial de pujas real (viene del backend por props), ordenado descendente.
  const bids = [...(props.bids ?? [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <ItemDetailBase {...props} badgeColor="bg-slate-700/90" badgeLabel="Ended Auction">

      {/* Precio final */}
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Winning Bid</Text>
          <View className="bg-slate-200 px-2 py-0.5 rounded">
            <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Ended</Text>
          </View>
        </View>

        <View className="flex-row items-baseline mb-4">
          <Text className={`text-4xl font-bold ${canAccessPrices ? 'text-slate-800' : 'text-slate-300'}`}>
            {formatPrice(item?.importeAdjudicado ?? item?.currentBid ?? item?.precioBase)}
          </Text>
          {canAccessPrices && <Text className="text-xs text-slate-400 font-bold ml-2">USD</Text>}
        </View>

        <View className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <Text className="text-sm text-slate-700 font-semibold mb-1">Auction closed.</Text>
          <Text className="text-sm text-slate-500 leading-6">
            The lot can no longer receive bids, but you can review the sale outcome and bid history below.
          </Text>
        </View>
      </View>

      {/* Historial de pujas */}
      <BidHistorySection
        bids={bids}
        canAccessPrices={canAccessPrices}
        currentUserId={currentUser?.id}
        isLive={false}
      />

    </ItemDetailBase>
  );
}
