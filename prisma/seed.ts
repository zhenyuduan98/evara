import { PrismaClient, ProductStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create seller user
  const seller = await prisma.user.upsert({
    where: { email: "seller@evara.com" },
    update: {},
    create: {
      email: "seller@evara.com",
      name: "Demo Seller",
      password: await hash("password123", 12),
      role: "SELLER",
    },
  });

  // Categories
  const categoryData = [
    { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
    { name: "Books", slug: "books", description: "Books and literature" },
    { name: "Clothing", slug: "clothing", description: "Apparel and fashion" },
    { name: "Home & Kitchen", slug: "home-kitchen", description: "Home and kitchen essentials" },
    { name: "Sports", slug: "sports", description: "Sports and outdoor equipment" },
    { name: "Toys", slug: "toys", description: "Toys and games" },
    { name: "Beauty", slug: "beauty", description: "Beauty and personal care" },
    { name: "Automotive", slug: "automotive", description: "Automotive parts and accessories" },
    { name: "Garden", slug: "garden", description: "Garden and outdoor" },
    { name: "Grocery", slug: "grocery", description: "Grocery and gourmet food" },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoryData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, image: `https://placehold.co/400x400?text=${encodeURIComponent(cat.name)}` },
    });
  }

  // Subcategories
  const subcategoryData = [
    { name: "Smartphones", slug: "smartphones", description: "Mobile phones", parentId: categories["electronics"].id },
    { name: "Laptops", slug: "laptops", description: "Laptop computers", parentId: categories["electronics"].id },
    { name: "Fiction", slug: "fiction", description: "Fiction books", parentId: categories["books"].id },
    { name: "Non-Fiction", slug: "non-fiction", description: "Non-fiction books", parentId: categories["books"].id },
    { name: "Men's Clothing", slug: "mens-clothing", description: "Men's apparel", parentId: categories["clothing"].id },
    { name: "Women's Clothing", slug: "womens-clothing", description: "Women's apparel", parentId: categories["clothing"].id },
    { name: "Kitchen Appliances", slug: "kitchen-appliances", description: "Kitchen appliances", parentId: categories["home-kitchen"].id },
    { name: "Fitness", slug: "fitness", description: "Fitness equipment", parentId: categories["sports"].id },
  ];

  const subcategories: Record<string, any> = {};
  for (const sub of subcategoryData) {
    subcategories[sub.slug] = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: { ...sub, image: `https://placehold.co/400x400?text=${encodeURIComponent(sub.name)}` },
    });
  }

  // All category refs for assigning products
  const allCats = { ...categories, ...subcategories };
  const catSlugs = Object.keys(allCats);

  // Product templates by category
  const brandsByCategory: Record<string, string[]> = {
    electronics: ["Samsung", "Apple", "Sony", "LG", "Bose"],
    books: ["Penguin", "HarperCollins", "Random House"],
    clothing: ["Nike", "Adidas", "Levi's", "H&M"],
    "home-kitchen": ["KitchenAid", "Instant Pot", "Dyson"],
    sports: ["Nike", "Under Armour", "Adidas"],
    toys: ["LEGO", "Hasbro", "Mattel"],
    beauty: ["L'Oreal", "Maybelline", "Neutrogena"],
    automotive: ["Bosch", "Michelin", "3M"],
    garden: ["Fiskars", "Scotts", "BLACK+DECKER"],
    grocery: ["Organic Valley", "Nature's Path", "KIND"],
  };

  const parentSlugs = Object.keys(categories);

  // Create 50 products
  for (let i = 1; i <= 50; i++) {
    const catSlug = parentSlugs[(i - 1) % parentSlugs.length];
    const brands = brandsByCategory[catSlug] || ["Generic"];
    const brand = brands[i % brands.length];
    const slug = `product-${i}`;
    const sku = `SKU-${String(i).padStart(5, "0")}`;
    const price = (9.99 + (i * 7.5) % 490).toFixed(2);
    const comparePrice = i % 3 === 0 ? (parseFloat(price) * 1.3).toFixed(2) : undefined;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        title: `${brand} ${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} Product ${i}`,
        slug,
        description: `High-quality ${catSlug} product #${i} from ${brand}. Great value and excellent reviews.`,
        bulletPoints: [
          "Premium quality materials",
          "Fast shipping available",
          `Made by ${brand}`,
          "30-day return policy",
        ],
        brand,
        price,
        compareAtPrice: comparePrice,
        sku,
        status: ProductStatus.ACTIVE,
        averageRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 500),
        sellerId: seller.id,
        categories: { connect: [{ id: allCats[catSlug].id }] },
      },
    });

    // Create 2 variants per product
    for (let v = 1; v <= 2; v++) {
      const variantSku = `${sku}-V${v}`;
      await prisma.productVariant.upsert({
        where: { sku: variantSku },
        update: {},
        create: {
          productId: product.id,
          name: v === 1 ? "Standard" : "Premium",
          sku: variantSku,
          price: v === 2 ? (parseFloat(price) + 10).toFixed(2) : undefined,
          stock: Math.floor(Math.random() * 100) + 5,
          options: v === 1 ? { color: "Black", size: "M" } : { color: "White", size: "L" },
        },
      });
    }

    // Create 3 images per product
    for (let img = 1; img <= 3; img++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://placehold.co/400x400?text=Product+${i}+Image+${img}`,
          alt: `Product ${i} - Image ${img}`,
          position: img,
        },
      });
    }
  }

  console.log("Seed completed: 10 categories, 8 subcategories, 50 products with variants and images");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
