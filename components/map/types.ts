/** Post shape returned by GET /api/posts/map */
export interface MapPost {
  _id: string;
  title: string;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  price: number;
  images: string[];
  remainingQuantity: number;
  totalQuantity: number;
  status: string;
  expiryDate: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  distance?: number; // metres, returned by $near
  ownerId?: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
}
