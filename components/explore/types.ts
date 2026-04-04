export type PostType = 'FREE' | 'MYSTERY_BAG';

export interface ExplorePost {
  id: string;
  title: string;
  type: PostType;
  price?: string;
  distance: string;
  pickupTime?: string;
  urgencyLabel?: string;
  tag?: string;
  imageUrl: string;
  // map position as fraction [0..1] of screen width/height
  mapX?: number;
  mapY?: number;
}

export type ExploreFilter = 'All' | 'Free Food' | 'Surprise Bags' | 'Closest';

export type ViewMode = 'list' | 'map';
