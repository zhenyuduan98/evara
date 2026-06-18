import { prisma } from '@/lib/prisma';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function extractDominantColor(imageBuffer: Buffer): RGB {
  // Simple approach: sample bytes and average them
  // For real images we'd decode pixels; here we simulate by averaging byte values
  const bytes = new Uint8Array(imageBuffer);
  let r = 0, g = 0, b = 0, count = 0;
  
  // Sample every 3 bytes as RGB triplets (works as rough approximation)
  for (let i = 0; i < bytes.length - 2; i += 3) {
    r += bytes[i];
    g += bytes[i + 1];
    b += bytes[i + 2];
    count++;
  }
  
  if (count === 0) return { r: 128, g: 128, b: 128 };
  
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

export async function findSimilarByColor(_color: RGB) {
  // Simulated visual similarity: return random products with a similarity score
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    take: 20,
    include: {
      images: { take: 1, orderBy: { position: 'asc' } },
      categories: { take: 1 },
    },
  });

  // Assign random similarity scores and sort
  const scored = products.map(p => ({
    ...p,
    similarityScore: Math.random() * 0.5 + 0.5, // 0.5–1.0
  }));

  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  return scored.slice(0, 10);
}
