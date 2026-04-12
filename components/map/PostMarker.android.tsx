import { PointAnnotation } from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { MapPost } from './types';

interface PostMarkerProps {
  post: MapPost;
  isActive: boolean;
  onPress: (postId: string) => void;
}

export default function PostMarker({ post, isActive, onPress }: PostMarkerProps) {
  const [lng, lat] = post.location.coordinates;
  const isFree = post.type === 'P2P_FREE';

  return (
    <PointAnnotation
      id={`marker-${post._id}`}
      coordinate={[lng, lat]}
      onSelected={() => onPress(post._id)}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(post._id)}>
        {isFree ? (
          <View
            className={`p-2.5 rounded-full ${isActive ? 'bg-primary-T40' : 'bg-neutral-T100'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Ionicons
              name="restaurant"
              size={18}
              color={isActive ? '#fff' : '#296C24'}
            />
          </View>
        ) : (
          <View
            className={`px-3 py-1.5 rounded-full ${isActive ? 'bg-secondary' : 'bg-neutral-T100'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Text
              className={`text-xs font-label font-bold ${isActive ? 'text-neutral-T100' : 'text-secondary'}`}
            >
              {post.price.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </PointAnnotation>
  );
}
