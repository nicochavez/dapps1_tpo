import React from 'react';
import { View, Text } from 'react-native';
import ItemDetailBase from './ItemDetailBase';

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$ \u2014,\u2014';
  if (typeof value === 'string') return value;
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

export default function ItemDetailUpcomingView(props) {
  const { item, canAccessPrices, moneda } = props;

  return (
    <ItemDetailBase {...props} badgeColor="bg-blue-500/90" badgeLabel="Upcoming Auction">

      {/* Precio de salida */}
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Starting Bid</Text>
          <View className="bg-[#a78bfa] px-2 py-0.5 rounded">
            <Text className="text-white text-[9px] font-bold uppercase tracking-wider">Upcoming</Text>
          </View>
        </View>

        <View className="flex-row items-baseline mb-4">
          <Text className={`text-4xl font-bold ${canAccessPrices ? 'text-slate-800' : 'text-slate-300'}`}>
            {formatPrice(item?.precioBase)}
          </Text>
          {canAccessPrices && moneda && <Text className="text-xs text-slate-400 font-bold ml-2">{moneda}</Text>}
        </View>

        <View className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
          <Text className="text-sm text-blue-700 font-semibold mb-1">This auction has not started yet.</Text>
          <Text className="text-sm text-slate-500 leading-6">
            You can review the item details, images and catalog information before the lot goes live.
          </Text>
        </View>
      </View>

    </ItemDetailBase>
  );
}
