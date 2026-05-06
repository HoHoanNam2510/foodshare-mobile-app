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
    <View className="bg-neutral-T95 border-neutral-T90 h-14 flex-row items-center justify-between rounded-xl border px-2">
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-lg active:opacity-80"
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <MaterialIcons name="remove" size={20} color="#5C5F5E" />
      </TouchableOpacity>
      <Text className="text-neutral-T10 font-sans text-lg font-bold">
        {value}
      </Text>
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-lg active:opacity-80"
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <MaterialIcons name="add" size={20} color="#5C5F5E" />
      </TouchableOpacity>
    </View>
  );
}
