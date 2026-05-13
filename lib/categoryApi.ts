import api from '@/lib/axios';

export interface ICategory {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  applyTo: 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'BOTH';
  isSystem: boolean;
  sortOrder: number;
  isActive: boolean;
}

export async function fetchCategories(
  applyTo?: 'P2P_FREE' | 'B2C_MYSTERY_BAG'
): Promise<ICategory[]> {
  const params: Record<string, string> = {};
  if (applyTo) params.applyTo = applyTo;

  const { data } = await api.get<{ success: boolean; data: ICategory[] }>(
    '/categories',
    { params }
  );
  return data.data;
}
