import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  /** If provided, stars become interactive pickers */
  onRate?: (star: number) => void;
  size?: number;
  /** Gap between stars (default 4) */
  gap?: number;
}

const STAR_COLOR = '#F59E0B';
const EMPTY_COLOR = '#D1D5DB';

export default function StarRating({ rating, onRate, size = 20, gap = 4 }: StarRatingProps) {
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        if (onRate) {
          return (
            <TouchableOpacity
              key={star}
              onPress={() => onRate(star)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <MaterialIcons
                name={filled ? 'star' : 'star-border'}
                size={size}
                color={filled ? STAR_COLOR : EMPTY_COLOR}
              />
            </TouchableOpacity>
          );
        }
        return (
          <MaterialIcons
            key={star}
            name={filled ? 'star' : 'star-border'}
            size={size}
            color={filled ? STAR_COLOR : EMPTY_COLOR}
          />
        );
      })}
    </View>
  );
}
