import React from 'react';

import { MapPost } from './types';

interface PostMarkerProps {
  post: MapPost;
  isActive: boolean;
  onPress: (postId: string) => void;
}

// Map not supported on iOS (Expo Go) — render nothing.
export default function PostMarker(_props: PostMarkerProps) {
  return null;
}
