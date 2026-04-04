import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ViewMode } from './types';

interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({
  activeView,
  onViewChange,
}: ViewToggleProps) {
  return (
    <View
      className="bg-neutral-T100 p-1.5 rounded-full flex-row items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* List button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onViewChange('list')}
        className={`flex-row items-center gap-1.5 px-5 py-2.5 rounded-full ${
          activeView === 'list' ? 'bg-primary-T40' : ''
        }`}
      >
        <Feather
          name="list"
          size={14}
          color={activeView === 'list' ? '#fff' : '#5C5F5E'}
        />
        <Text
          className={`text-sm font-label ${
            activeView === 'list' ? 'text-neutral-T100' : 'text-neutral-T40'
          }`}
          style={{ fontWeight: activeView === 'list' ? '600' : '500' }}
        >
          List
        </Text>
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onViewChange('map')}
        className={`flex-row items-center gap-1.5 px-5 py-2.5 rounded-full ${
          activeView === 'map' ? 'bg-primary-T40' : ''
        }`}
      >
        <Feather
          name="map"
          size={14}
          color={activeView === 'map' ? '#fff' : '#5C5F5E'}
        />
        <Text
          className={`text-sm font-label ${
            activeView === 'map' ? 'text-neutral-T100' : 'text-neutral-T40'
          }`}
          style={{ fontWeight: activeView === 'map' ? '600' : '500' }}
        >
          Map
        </Text>
      </TouchableOpacity>
    </View>
  );
}
