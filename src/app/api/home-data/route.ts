import { NextResponse } from 'next/server';

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchJson<T>(url: string, init?: NextFetchInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function GET() {
  const revalidateInit: NextFetchInit = {
    next: { revalidate: 120, tags: ['home-data'] }
  };

  const [banners, categories, products, collections, occasions] = await Promise.all([
    fetchJson<any>(`${API_BASE}/banners/active`, revalidateInit),
    fetchJson<any>(`${API_BASE}/categories?sortBy=sortOrder&sortOrder=asc`, revalidateInit),
    fetchJson<any>(`${API_BASE}/products?isFeatured=true&limit=20`, revalidateInit),
    fetchJson<any>(`${API_BASE}/collections?sortBy=sortOrder&sortOrder=asc`, revalidateInit),
    fetchJson<any>(`${API_BASE}/occasions?sortBy=sortOrder&sortOrder=asc`, revalidateInit)
  ]);

  return NextResponse.json(
    {
      success: true,
      data: {
        banners: banners?.data || [],
        categories: categories?.data || [],
        products: products?.data || [],
        collections: collections?.data || [],
        occasions: occasions?.data || []
      }
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600'
      }
    }
  );
}
