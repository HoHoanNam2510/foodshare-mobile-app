export type PostType = 'P2P_FREE' | 'B2C_MYSTERY_BAG';

export type TypeFilter = 'All' | 'Free Food' | 'Surprise Bags';
// Alias kept for backward compat with map view props
export type ExploreFilter = TypeFilter;

export type SortOption = 'newest' | 'closest' | 'expiring';

export type ViewMode = 'list' | 'map';

export interface PickupTime {
  start: string;
  end: string;
}

export interface PostOwner {
  _id: string;
  fullName: string;
  avatar?: string;
  averageRating?: number;
}

/** Shape returned by backend /api/posts/explore */
export interface ExplorePost {
  _id: string;
  title: string;
  type: PostType;
  price: number;
  expiryDate: string;
  pickupTime: PickupTime;
  images: string[];
  remainingQuantity: number;
  totalQuantity: number;
  status: string;
  createdAt: string;
  ownerId?: PostOwner;
  // Static map mock only
  mapX?: number;
  mapY?: number;
  distance?: string;
}
