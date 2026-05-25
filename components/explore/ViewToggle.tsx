import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/lib/hooks/useThemeColors';

import { ViewMode } from './types';

interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({
  activeView,
  onViewChange,
}: ViewToggleProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <View
      className="bg-neutral-T100 dark:bg-neutral-T20 dark:border-neutral-T30 flex-row items-center rounded-full p-1.5 dark:border"
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
        className={`flex-row items-center gap-1.5 rounded-full px-5 py-2.5 ${
          activeView === 'list' ? 'bg-primary-T40' : ''
        }`}
      >
        <Feather
          name="list"
          size={14}
          color={activeView === 'list' ? '#fff' : colors.textMuted}
        />
        <Text
          className={`font-label text-sm ${
            activeView === 'list'
              ? 'text-neutral-T100'
              : 'text-neutral-T40 dark:text-neutral-T60'
          }`}
          style={{ fontWeight: activeView === 'list' ? '600' : '500' }}
        >
          {t('explore.list')}
        </Text>
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onViewChange('map')}
        className={`flex-row items-center gap-1.5 rounded-full px-5 py-2.5 ${
          activeView === 'map' ? 'bg-primary-T40' : ''
        }`}
      >
        <Feather
          name="map"
          size={14}
          color={activeView === 'map' ? '#fff' : colors.textMuted}
        />
        <Text
          className={`font-label text-sm ${
            activeView === 'map'
              ? 'text-neutral-T100'
              : 'text-neutral-T40 dark:text-neutral-T60'
          }`}
          style={{ fontWeight: activeView === 'map' ? '600' : '500' }}
        >
          {t('explore.map')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
