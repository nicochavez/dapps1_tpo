import React from 'react';
import { View, Text } from 'react-native';
import ItemDetailBase from './ItemDetailBase';

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$ \u2014,\u2014';
  if (typeof value === 'string') return value;
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const BID_HISTORY = [
  { id: 1, initials: 'A.R.', name: 'Alex Rivers', time: '2 MINUTES AGO',  amount: 1245.0 },
  { id: 2, initials: 'J.M.', name: 'Julian Marc', time: '12 MINUTES AGO', amount: 1200.0 },
  { id: 3, initials: 'S.H.', name: 'Sarah H.',    time: '1 HOUR AGO',     amount: 1150.0 },
];

export default function ItemDetailEndedView(props) {
  const { item, canAccessPrices } = props;

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
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-light text-slate-800">Bidding History</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-[#7C3AED] text-[9px] font-bold uppercase tracking-wider">12 Bids</Text>
          </View>
        </View>

        {BID_HISTORY.map((bid, index) => (
          <View
            key={bid.id}
            className={`flex-row justify-between items-center ${index !== BID_HISTORY.length - 1 ? 'mb-6' : ''}`}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 mr-3">
                <Text className="text-[#7C3AED] text-[10px] font-bold tracking-wider">{bid.initials}</Text>
              </View>
              <View>
                <Text className="font-bold text-slate-800 text-sm mb-0.5">{bid.name}</Text>
                <Text className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{bid.time}</Text>
              </View>
            </View>
            <Text className={`font-bold text-sm ${canAccessPrices ? 'text-[#7C3AED]' : 'text-slate-300'}`}>
              {canAccessPrices
                ? `$${bid.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : '$ \u2014,\u2014'}
            </Text>
          </View>
        ))}
      </View>

    </ItemDetailBase>
  );
}
