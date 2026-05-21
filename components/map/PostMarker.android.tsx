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

export default function PostMarker({
  post,
  isActive,
  onPress,
}: PostMarkerProps) {
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
            style={{
              borderRadius: 999,
              padding: 10,
              backgroundColor: isActive ? '#296C24' : '#EDF7EC',
              borderWidth: 1.5,
              borderColor: '#296C24',
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
            style={{
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: isActive ? '#EC8632' : '#FFF3E8',
              borderWidth: 1.5,
              borderColor: '#EC8632',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Text
              className="font-label text-xs font-bold"
              style={{ color: isActive ? '#fff' : '#EC8632' }}
            >
              {post.price.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </PointAnnotation>
  );
}
