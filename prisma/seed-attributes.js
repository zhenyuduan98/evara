const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ take: 20, select: { id: true, brand: true, title: true } });

  if (products.length === 0) {
    console.log('No products found to add attributes to.');
    return;
  }

  const attributeTemplates = [
    { key: 'Material', values: ['Cotton', 'Polyester', 'Leather', 'Metal', 'Plastic', 'Wood'], filterable: true },
    { key: 'Color', values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Silver'], filterable: true },
    { key: 'Size', values: ['Small', 'Medium', 'Large', 'XL'], filterable: true },
    { key: 'Weight', values: ['0.5 lbs', '1 lb', '2 lbs', '5 lbs'], filterable: false },
    { key: 'Warranty', values: ['1 Year', '2 Years', '3 Years', 'Lifetime'], filterable: true },
    { key: 'Country of Origin', values: ['USA', 'China', 'Germany', 'Japan', 'India'], filterable: true },
  ];

  const data = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    // Each product gets 3-5 random attributes
    const numAttrs = 3 + (i % 3);
    const shuffled = [...attributeTemplates].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numAttrs && j < shuffled.length; j++) {
      const tmpl = shuffled[j];
      const value = tmpl.values[i % tmpl.values.length];
      data.push({
        productId: product.id,
        key: tmpl.key,
        value,
        filterable: tmpl.filterable,
      });
    }
  }

  // Clear existing attributes
  await prisma.productAttribute.deleteMany({});

  const result = await prisma.productAttribute.createMany({ data });
  console.log(`Seeded ${result.count} product attributes for ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
