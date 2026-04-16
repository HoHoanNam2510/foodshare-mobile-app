import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AutocompletePrediction,
  fetchAutocomplete,
  fetchPlaceDetail,
} from '@/lib/mapApi';
import { useTranslation } from 'react-i18next';

interface AddressAutocompleteProps {
  placeholder?: string;
  onSelect: (address: string, coords: [number, number]) => void;
  initialValue?: string;
}

export default function AddressAutocomplete({
  placeholder,
  onSelect,
  initialValue = '',
}: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const actualPlaceholder = placeholder || t('map.searchAddressPlaceholder');
  const [text, setText] = useState(initialValue);
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const sessiontoken = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate session token once per session
  useEffect(() => {
    sessiontoken.current = Crypto.randomUUID();
  }, []);

  const search = (input: string) => {
    setText(input);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setPredictions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchAutocomplete(input, sessiontoken.current);
        setPredictions(results);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = async (prediction: AutocompletePrediction) => {
    setPredictions([]);
    setText(prediction.description);
    setLoading(true);
    try {
      const detail = await fetchPlaceDetail(
        prediction.place_id,
        sessiontoken.current
      );
      if (detail) {
        const { lat, lng } = detail.geometry.location;
        onSelect(prediction.description, [lng, lat]);
        // Rotate session token after a completed session
        sessiontoken.current = Crypto.randomUUID();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Input */}
      <View
        className="flex-row items-center bg-neutral-T100 rounded-2xl px-4 gap-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Ionicons name="search" size={18} color="#757777" />
        <TextInput
          className="flex-1 h-12 font-body text-base text-neutral-T10"
          placeholder={actualPlaceholder}
          placeholderTextColor="#AAABAB"
          value={text}
          onChangeText={search}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#296C24" />}
        {!loading && text.length > 0 && (
          <TouchableOpacity onPress={() => { setText(''); setPredictions([]); }}>
            <Ionicons name="close-circle" size={18} color="#AAABAB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown */}
      {predictions.length > 0 && (
        <View
          className="bg-neutral-T100 rounded-2xl mt-1 overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleSelect(item)}
                className={`px-4 py-3 flex-row items-start gap-3 ${index > 0 ? 'border-t border-neutral-T90' : ''}`}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#296C24"
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  {item.structured_formatting ? (
                    <>
                      <Text
                        className="font-label font-semibold text-sm text-neutral-T10"
                        numberOfLines={1}
                      >
                        {item.structured_formatting.main_text}
                      </Text>
                      <Text
                        className="font-body text-xs text-neutral-T50 mt-0.5"
                        numberOfLines={1}
                      >
                        {item.structured_formatting.secondary_text}
                      </Text>
                    </>
                  ) : (
                    <Text
                      className="font-body text-sm text-neutral-T10"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
