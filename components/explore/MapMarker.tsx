import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PriceMarkerProps {
  price: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function PriceMarker({ price, isActive, onPress }: PriceMarkerProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View
        className={`px-3 py-1.5 rounded-full ${
          isActive ? 'bg-primary-T40' : 'bg-neutral-T100'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.14,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text
          className={`text-xs font-label ${
            isActive ? 'text-neutral-T100' : 'text-primary-T40'
          }`}
          style={{ fontWeight: '700' }}
        >
          {price}
        </Text>
      </View>
      {/* Stem */}
      <View
        className={`w-px h-2 mx-auto ${
          isActive ? 'bg-primary-T40' : 'bg-neutral-T100'
        }`}
      />
    </TouchableOpacity>
  );
}

interface IconMarkerProps {
  isActive?: boolean;
  onPress?: () => void;
}

export function IconMarker({ isActive, onPress }: IconMarkerProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View
        className={`p-2.5 rounded-full ${
          isActive ? 'bg-primary-T40' : 'bg-neutral-T100'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.14,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons
          name="restaurant"
          size={18}
          color={isActive ? '#fff' : '#296C24'}
        />
      </View>
      {/* Stem */}
      <View
        className={`w-px h-2 mx-auto ${
          isActive ? 'bg-primary-T40' : 'bg-neutral-T100'
        }`}
      />
    </TouchableOpacity>
  );
}
