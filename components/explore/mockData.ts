import { ExplorePost } from './types';

export const EXPLORE_POSTS: ExplorePost[] = [
  {
    id: '1',
    title: 'The Hearthstone Bakery',
    type: 'MYSTERY_BAG',
    price: '$5.99',
    distance: '0.8 km',
    pickupTime: '18:00 – 20:00',
    tag: 'Surprise Bag',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    mapX: 0.62,
    mapY: 0.45,
  },
  {
    id: '2',
    title: 'Organic Garden Tomatoes',
    type: 'FREE',
    distance: '1.2 km',
    urgencyLabel: 'Expiring Today',
    imageUrl:
      'https://www.seedparade.co.uk/news/wp-content/uploads/2023/08/tomatoes-in-basket.jpg',
    mapX: 0.25,
    mapY: 0.38,
  },
  {
    id: '3',
    title: 'Grecian Grill',
    type: 'MYSTERY_BAG',
    price: '$7.50',
    distance: '2.5 km',
    pickupTime: 'Pickup: Tomorrow',
    tag: 'Surprise Bag',
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    mapX: 0.72,
    mapY: 0.28,
  },
  {
    id: '4',
    title: 'Moving Out – Pantry Staples',
    type: 'FREE',
    distance: '0.3 km',
    urgencyLabel: 'Unopened Items',
    imageUrl:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
    mapX: 0.15,
    mapY: 0.62,
  },
];

export const FILTER_OPTIONS = [
  'All',
  'Free Food',
  'Surprise Bags',
  'Closest',
] as const;
