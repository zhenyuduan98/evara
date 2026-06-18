export function formatPrice(price: number | string | { toNumber?: () => number }): string {
  const num = typeof price === 'object' && price !== null
    ? (price.toNumber ? price.toNumber() : Number(price))
    : Number(price);
  return `$${num.toFixed(2)}`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatResultCount(total: number, page: number, perPage: number, query?: string): string {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const totalStr = total > 1000 ? `${Math.floor(total / 1000)},000+` : total.toLocaleString();
  const suffix = query ? ` for "${query}"` : '';
  return `Showing ${start}-${end} of ${totalStr} results${suffix}`;
}

export function calculateSavings(price: number | string, compareAtPrice: number | string): { amount: string; percent: number } {
  const p = Number(price);
  const c = Number(compareAtPrice);
  const diff = c - p;
  return {
    amount: formatPrice(diff),
    percent: Math.round((diff / c) * 100),
  };
}
