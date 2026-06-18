const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const taxRates = [
  { country: 'US', state: 'CA', rate: 0.0725, category: 'general' },
  { country: 'US', state: 'TX', rate: 0.0625, category: 'general' },
  { country: 'US', state: 'NY', rate: 0.08, category: 'general' },
  { country: 'US', state: 'FL', rate: 0.06, category: 'general' },
  { country: 'US', state: 'WA', rate: 0.065, category: 'general' },
  { country: 'US', state: 'PA', rate: 0.06, category: 'general' },
  { country: 'US', state: 'IL', rate: 0.0625, category: 'general' },
  { country: 'US', state: 'OH', rate: 0.0575, category: 'general' },
  { country: 'US', state: 'GA', rate: 0.04, category: 'general' },
  { country: 'US', state: 'NC', rate: 0.0475, category: 'general' },
  { country: 'US', state: 'NJ', rate: 0.06625, category: 'general' },
  { country: 'US', state: 'VA', rate: 0.053, category: 'general' },
  { country: 'US', state: 'MI', rate: 0.06, category: 'general' },
  { country: 'US', state: 'AZ', rate: 0.056, category: 'general' },
  { country: 'US', state: 'MA', rate: 0.0625, category: 'general' },
  { country: 'US', state: 'OR', rate: 0, category: 'general' },
  { country: 'US', state: 'MT', rate: 0, category: 'general' },
  { country: 'US', state: 'NH', rate: 0, category: 'general' },
  { country: 'US', state: 'DE', rate: 0, category: 'general' },
  { country: 'GB', state: 'DEFAULT', rate: 0.20, category: 'general' },
  { country: 'DE', state: 'DEFAULT', rate: 0.19, category: 'general' },
  { country: 'FR', state: 'DEFAULT', rate: 0.20, category: 'general' },
  { country: 'JP', state: 'DEFAULT', rate: 0.10, category: 'general' },
  { country: 'CA', state: 'DEFAULT', rate: 0.05, category: 'general' },
];

async function main() {
  for (const tr of taxRates) {
    await prisma.taxRate.upsert({
      where: { country_state_category: { country: tr.country, state: tr.state, category: tr.category } },
      update: { rate: tr.rate },
      create: tr,
    });
  }
  console.log(`Seeded ${taxRates.length} tax rates`);
}

main().then(() => prisma.$disconnect());
