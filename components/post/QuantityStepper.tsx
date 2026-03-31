import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityStepperProps) {
  return (
    <View className="flex-row items-center justify-between h-14 px-2 rounded-xl bg-neutral-T95 border border-neutral-T90">
      <TouchableOpacity
        className="w-10 h-10 rounded-lg items-center justify-center active:opacity-80"
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <MaterialIcons name="remove" size={20} color="#5C5F5E" />
      </TouchableOpacity>
      <Text className="font-sans font-bold text-lg text-neutral-T10">{value}</Text>
      <TouchableOpacity
        className="w-10 h-10 rounded-lg items-center justify-center active:opacity-80"
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <MaterialIcons name="add" size={20} color="#5C5F5E" />
      </TouchableOpacity>
    </View>
  );
}
