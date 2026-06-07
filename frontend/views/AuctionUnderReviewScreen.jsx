import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

function Step({ icon, title, body, isLast }) {
  return (
    <View className="flex-row items-start">
      <View className="items-center mr-4">
        <View className="w-9 h-9 rounded-full bg-purple-100 items-center justify-center">
          <Feather name={icon} size={16} color="#7C3AED" />
        </View>
        {!isLast && <View className="w-[1px] flex-1 bg-slate-100 mt-2 mb-2 min-h-[24px]" />}
      </View>
      <View className="flex-1 pb-6">
        <Text className="text-sm font-bold text-slate-700 mb-1">{title}</Text>
        <Text className="text-xs text-slate-400 leading-5">{body}</Text>
      </View>
    </View>
  );
}

export default function AuctionUnderReviewScreen({ navigation }) {
  return (
    <View className="flex-1 bg-white">

      {/* HEADER */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800 ml-4">Item Submitted</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ÍCONO */}
        <View className="w-24 h-24 rounded-full bg-amber-50 items-center justify-center mx-auto mb-8 mt-4">
          <View className="relative">
            <MaterialCommunityIcons name="file-search-outline" size={40} color="#d97706" />
          </View>
        </View>

        {/* TÍTULO Y SUBTÍTULO */}
        <Text className="text-3xl font-bold text-center text-slate-800 mb-3 px-4 leading-10">
          Item Under Inspection
        </Text>
        <Text className="text-center text-slate-400 mb-10 px-4 leading-6 text-sm">
          Your item has been received and will be reviewed by our experts. All communication from this point on takes place outside the platform.
        </Text>

        {/* PROCESO */}
        <Text className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-6">
          What to expect
        </Text>

        <Step
          icon="search"
          title="Physical inspection"
          body="Our team will examine the item and verify the information you provided. This process typically takes a few business days."
        />
        <Step
          icon="mail"
          title="You will be contacted by email"
          body="We will reach out to you directly with the inspection result — acceptance or rejection with reasons. No in-app notification will be sent for this step."
        />
        <Step
          icon="dollar-sign"
          title="Price and commissions proposal"
          body="If accepted, we will inform you of the auction date and location, the suggested base price, and the applicable commissions. You may accept or reject this proposal."
        />
        <Step
          icon="shield"
          title="Insurance and logistics"
          body="Once agreed, an insurance policy will be contracted on your item based on the base price. You will receive details about the depot location and the active policy."
          isLast
        />

        {/* NOTA ACLARATORIA */}
        <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2 flex-row items-start">
          <Feather name="info" size={15} color="#94a3b8" style={{ marginTop: 1, marginRight: 10 }} />
          <Text className="text-xs text-slate-400 leading-5 flex-1">
            The negotiation process — inspection, pricing, and acceptance — is handled entirely outside the app. Your item will appear as{' '}
            <Text className="font-bold text-amber-600">Pending Review</Text>
            {' '}in your item list until a decision is reached.
          </Text>
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View className="px-6 pb-12 bg-white border-t border-slate-50 pt-4">
        <TouchableOpacity
          onPress={() => navigation.navigate('MyAuctions')}
          className="bg-[#a78bfa] rounded-full py-4 items-center shadow-sm shadow-purple-200 mb-4"
        >
          <Text className="text-white font-bold text-base">View My Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          className="py-4 items-center"
        >
          <Text className="text-[#7C3AED] font-bold text-sm">Back to Home</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
