import { ExplorePost, TypeFilter } from './types';

// Static mock data — only used for the (still-static) Map view
export const EXPLORE_POSTS: ExplorePost[] = [
  {
    _id: '1',
    title: 'The Hearthstone Bakery',
    type: 'B2C_MYSTERY_BAG',
    price: 5.99,
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    pickupTime: {
      start: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      end: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    },
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    ],
    remainingQuantity: 3,
    totalQuantity: 5,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    distance: '0.8 km',
    mapX: 0.62,
    mapY: 0.45,
  },
  {
    _id: '2',
    title: 'Organic Garden Tomatoes',
    type: 'P2P_FREE',
    price: 0,
    expiryDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    pickupTime: {
      start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      end: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    },
    images: [
      'https://www.seedparade.co.uk/news/wp-content/uploads/2023/08/tomatoes-in-basket.jpg',
    ],
    remainingQuantity: 10,
    totalQuantity: 10,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    distance: '1.2 km',
    mapX: 0.25,
    mapY: 0.38,
  },
  {
    _id: '3',
    title: 'Grecian Grill',
    type: 'B2C_MYSTERY_BAG',
    price: 7.5,
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    pickupTime: {
      start: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
      end: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
    },
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    ],
    remainingQuantity: 2,
    totalQuantity: 4,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    distance: '2.5 km',
    mapX: 0.72,
    mapY: 0.28,
  },
  {
    _id: '4',
    title: 'Moving Out – Pantry Staples',
    type: 'P2P_FREE',
    price: 0,
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    pickupTime: {
      start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      end: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    },
    images: [
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
    ],
    remainingQuantity: 7,
    totalQuantity: 7,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    distance: '0.3 km',
    mapX: 0.15,
    mapY: 0.62,
  },
];

export const TYPE_FILTER_OPTIONS: TypeFilter[] = [
  'All',
  'Free Food',
  'Surprise Bags',
];
