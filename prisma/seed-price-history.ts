import prisma from '../src/lib/prisma';

async function seedPriceHistory() {
  const products = await prisma.product.findMany({ select: { id: true, price: true } });

  for (const product of products) {
    const basePrice = Number(product.price);
    const entries = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // fluctuate price ±15%
      const variation = basePrice * (0.85 + Math.random() * 0.30);
      entries.push({
        productId: product.id,
        price: Math.round(variation * 100) / 100,
        changedAt: date,
      });
    }
    await prisma.priceHistory.createMany({ data: entries });
  }

  console.log(`Seeded price history for ${products.length} products`);
}

seedPriceHistory()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
