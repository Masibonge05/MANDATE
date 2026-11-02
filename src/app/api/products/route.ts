import { NextResponse } from 'next/server';
import { searchProducts, DEMO_PRODUCTS } from '@/lib/product-catalog';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || 'photography';
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

    const products = await searchProducts(query, maxPrice);

    return NextResponse.json({
      success: true,
      query,
      count: products.length,
      products,
      allCatalog: DEMO_PRODUCTS,
    });
  } catch (error: any) {
    console.error('[API Products Error]:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}

