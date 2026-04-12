import api from '@/lib/axios';

import { MapPost } from '../components/map/types';

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? '';
const GOONG_BASE = 'https://rsapi.goong.io';

// ── Posts near location ────────────────────────────────────────────────────

export interface MapPostsParams {
  lng: number;
  lat: number;
  distance: number; // metres, max 5000
  type?: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
}

export async function fetchMapPosts(params: MapPostsParams): Promise<MapPost[]> {
  const query: Record<string, string> = {
    lng: String(params.lng),
    lat: String(params.lat),
    distance: String(Math.min(params.distance, 5000)),
  };
  if (params.type) query.type = params.type;

  const { data } = await api.get<{ success: boolean; data: MapPost[] }>(
    '/posts/map',
    { params: query }
  );
  return data.data;
}

// ── Goong Autocomplete ────────────────────────────────────────────────────

export interface AutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export async function fetchAutocomplete(
  input: string,
  sessiontoken: string
): Promise<AutocompletePrediction[]> {
  if (!input.trim()) return [];
  const res = await fetch(
    `${GOONG_BASE}/Place/AutoComplete?input=${encodeURIComponent(input)}&api_key=${GOONG_API_KEY}&sessiontoken=${sessiontoken}`
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.predictions ?? [];
}

// ── Goong Place Detail (get coordinates from place_id) ───────────────────

export interface PlaceDetail {
  place_id: string;
  geometry: { location: { lat: number; lng: number } };
  name: string;
  formatted_address: string;
}

export async function fetchPlaceDetail(
  placeId: string,
  sessiontoken: string
): Promise<PlaceDetail | null> {
  const res = await fetch(
    `${GOONG_BASE}/Place/Detail?place_id=${encodeURIComponent(placeId)}&api_key=${GOONG_API_KEY}&sessiontoken=${sessiontoken}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json.result ?? null;
}

// ── Goong Reverse Geocoding ───────────────────────────────────────────────

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const res = await fetch(
    `${GOONG_BASE}/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  const results: { formatted_address?: string }[] = json.results ?? [];
  return results[0]?.formatted_address ?? null;
}

// ── Update user location on backend ──────────────────────────────────────

export async function updateUserLocation(
  longitude: number,
  latitude: number
): Promise<void> {
  await api.put('/auth/me/location', { longitude, latitude });
}
