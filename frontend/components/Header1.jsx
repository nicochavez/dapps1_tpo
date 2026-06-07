import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Logo from './Logo';

export default function Header1({ navigation }) {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Logo size={28} />
          <Text style={{fontSize: 18, fontWeight: '700', color: '#7C3AED', marginLeft: 8}}>BidFlow</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Feather name="x" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    )
}

   