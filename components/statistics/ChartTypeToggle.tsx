import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ChartTypeToggleProps {
  value: 'line' | 'bar';
  onChange: (type: 'line' | 'bar') => void;
}

export default function ChartTypeToggle({
  value,
  onChange,
}: ChartTypeToggleProps) {
  return (
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={() => onChange('line')}
        className={`rounded-lg p-2 ${value === 'line' ? 'bg-primary' : 'bg-neutral-T95 dark:bg-neutral-T30'}`}
      >
        <MaterialIcons
          name="show-chart"
          size={20}
          color={value === 'line' ? '#FFFFFF' : '#757777'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('bar')}
        className={`rounded-lg p-2 ${value === 'bar' ? 'bg-primary' : 'bg-neutral-T95'}`}
      >
        <MaterialIcons
          name="bar-chart"
          size={20}
          color={value === 'bar' ? '#FFFFFF' : '#757777'}
        />
      </TouchableOpacity>
    </View>
  );
}
