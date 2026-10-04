// Vercel serverless function: /api/products
// Set GUMROAD_TOKEN in Vercel > Project > Settings > Environment Variables
export default async function handler(req, res) {
  try {
    const r = await fetch(
      'https://api.gumroad.com/v2/products?access_token=' + encodeURIComponent(process.env.GUMROAD_TOKEN)
    );
    const j = await r.json();
    if (!j.success) throw new Error(j.message || 'Gumroad error');

    const products = j.products
      .filter(p => p.published !== false)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        image: p.thumbnail_url || p.preview_url || (p.covers && p.covers[0]) || '',
        price: p.formatted_price,
        priceValue: (p.price || 0) / 100,
        currency: p.currency,
        url: p.short_url,
        tags: p.tags || [],
        sales: p.sales_count || 0,
      }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ products });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
