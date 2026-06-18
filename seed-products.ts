import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Computers, phones, gadgets and more' },
  { name: 'Books', slug: 'books', description: 'Fiction, non-fiction, and educational books' },
  { name: 'Clothing', slug: 'clothing', description: 'Apparel for men, women, and children' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Everything for your home' },
  { name: 'Toys & Games', slug: 'toys-games', description: 'Fun for all ages' },
  { name: 'Sports', slug: 'sports', description: 'Sports and outdoor equipment' },
  { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup, and personal care' },
  { name: 'Automotive', slug: 'automotive', description: 'Car parts, accessories, and tools' },
];

const products = [
  // Electronics (13)
  { title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', brand: 'Sony', price: 348.00, compareAt: 399.99, rating: 4.7, reviews: 2841, cat: 'electronics', bullets: ['Industry-leading noise cancellation', '30-hour battery life', 'Crystal clear hands-free calling', 'Multipoint connection'] },
  { title: 'Apple MacBook Air 15-inch M3 Chip 256GB', brand: 'Apple', price: 1299.00, compareAt: null, rating: 4.8, reviews: 1256, cat: 'electronics', bullets: ['M3 chip with 8-core CPU', '15.3-inch Liquid Retina display', '18-hour battery life', '256GB SSD storage'] },
  { title: 'Samsung Galaxy S24 Ultra 256GB Unlocked', brand: 'Samsung', price: 1199.99, compareAt: 1299.99, rating: 4.6, reviews: 3420, cat: 'electronics', bullets: ['200MP camera system', 'Galaxy AI built-in', 'Titanium frame', '6.8-inch QHD+ display'] },
  { title: 'LG C3 55-inch OLED 4K Smart TV', brand: 'LG', price: 1096.99, compareAt: 1499.99, rating: 4.7, reviews: 5123, cat: 'electronics', bullets: ['Self-lit OLED pixels', 'α9 Gen6 AI Processor', 'Dolby Vision & Atmos', 'Gaming features with 4 HDMI 2.1 ports'] },
  { title: 'Anker 737 Power Bank 24000mAh', brand: 'Anker', price: 109.99, compareAt: 149.99, rating: 4.5, reviews: 892, cat: 'electronics', bullets: ['140W max output', 'Smart digital display', 'PowerIQ 3.0 technology', 'Charges 3 devices simultaneously'] },
  { title: 'Logitech MX Master 3S Wireless Mouse', brand: 'Logitech', price: 89.99, compareAt: 99.99, rating: 4.8, reviews: 4521, cat: 'electronics', bullets: ['8K DPI optical sensor', 'Quiet clicks', 'MagSpeed scroll wheel', 'USB-C quick charging'] },
  { title: 'Bose QuietComfort Ultra Earbuds', brand: 'Bose', price: 279.00, compareAt: 299.00, rating: 4.4, reviews: 1832, cat: 'electronics', bullets: ['Immersive Audio', 'World-class noise cancellation', 'CustomTune technology', '6 hours battery per charge'] },
  { title: 'Kindle Paperwhite Signature Edition 32GB', brand: 'Amazon', price: 189.99, compareAt: null, rating: 4.6, reviews: 7823, cat: 'electronics', bullets: ['6.8-inch glare-free display', 'Wireless charging', 'Auto-adjusting front light', '10 weeks battery life'] },
  { title: 'Razer BlackWidow V4 Mechanical Keyboard', brand: 'Razer', price: 169.99, compareAt: 199.99, rating: 4.5, reviews: 623, cat: 'electronics', bullets: ['Razer Green mechanical switches', 'Chroma RGB lighting', 'Dedicated macro keys', 'Magnetic wrist rest included'] },
  { title: 'TP-Link Deco XE75 Mesh WiFi 6E System 3-Pack', brand: 'TP-Link', price: 299.99, compareAt: 399.99, rating: 4.4, reviews: 1245, cat: 'electronics', bullets: ['WiFi 6E tri-band', 'Covers up to 7200 sq ft', 'Connects 200+ devices', 'Built-in antivirus'] },
  { title: 'GoPro HERO12 Black Action Camera', brand: 'GoPro', price: 349.99, compareAt: 399.99, rating: 4.3, reviews: 2156, cat: 'electronics', bullets: ['5.3K60 video', 'HyperSmooth 6.0 stabilization', 'HDR photo and video', 'Waterproof to 33ft'] },
  { title: 'SanDisk Extreme 1TB Portable SSD', brand: 'SanDisk', price: 89.99, compareAt: 129.99, rating: 4.7, reviews: 3567, cat: 'electronics', bullets: ['Up to 1050MB/s read speed', 'IP65 water and dust resistant', 'Drop protection up to 2m', 'USB 3.2 Gen 2'] },
  { title: 'JBL Charge 5 Portable Bluetooth Speaker', brand: 'JBL', price: 149.95, compareAt: 179.95, rating: 4.7, reviews: 6234, cat: 'electronics', bullets: ['IP67 waterproof and dustproof', '20 hours of playtime', 'Built-in powerbank', 'PartyBoost for speaker pairing'] },

  // Books (13)
  { title: 'Atomic Habits by James Clear - Hardcover', brand: 'Avery Publishing', price: 18.99, compareAt: 27.00, rating: 4.8, reviews: 98234, cat: 'books', bullets: ['#1 New York Times bestseller', 'Proven framework for habit building', '320 pages', 'Over 15 million copies sold'] },
  { title: 'The Midnight Library by Matt Haig - Paperback', brand: 'Penguin Books', price: 13.49, compareAt: 17.00, rating: 4.5, reviews: 42567, cat: 'books', bullets: ['Internationally bestselling novel', 'A story about parallel lives', '304 pages', 'Winner of Goodreads Choice Award'] },
  { title: 'Project Hail Mary by Andy Weir - Paperback', brand: 'Ballantine Books', price: 14.99, compareAt: 18.00, rating: 4.7, reviews: 35678, cat: 'books', bullets: ['From the author of The Martian', 'Epic sci-fi adventure', '496 pages', 'Soon to be a major motion picture'] },
  { title: 'Educated: A Memoir by Tara Westover', brand: 'Random House', price: 15.29, compareAt: 18.00, rating: 4.7, reviews: 67890, cat: 'books', bullets: ['#1 New York Times bestseller', 'A story of self-invention', '352 pages', 'Bill Gates top pick'] },
  { title: 'The Psychology of Money by Morgan Housel', brand: 'Harriman House', price: 16.99, compareAt: 24.99, rating: 4.7, reviews: 28456, cat: 'books', bullets: ['Timeless lessons on wealth and happiness', '20 short stories', '256 pages', 'Wall Street Journal bestseller'] },
  { title: 'Dune by Frank Herbert - Deluxe Edition', brand: 'Ace Books', price: 22.49, compareAt: 30.00, rating: 4.7, reviews: 45123, cat: 'books', bullets: ['Science fiction masterpiece', 'Deluxe hardcover edition', '896 pages', 'Winner of Hugo and Nebula Awards'] },
  { title: 'Thinking, Fast and Slow by Daniel Kahneman', brand: 'Farrar Straus Giroux', price: 13.99, compareAt: 20.00, rating: 4.6, reviews: 34567, cat: 'books', bullets: ['Nobel Prize-winning insights', 'How we think and make choices', '499 pages', 'International bestseller'] },
  { title: 'The Alchemist by Paulo Coelho - 25th Anniversary', brand: 'HarperOne', price: 14.39, compareAt: 18.99, rating: 4.7, reviews: 89012, cat: 'books', bullets: ['Over 150 million copies sold', 'Translated into 80 languages', '208 pages', 'Special anniversary edition'] },
  { title: 'Clean Code by Robert C. Martin', brand: 'Prentice Hall', price: 39.99, compareAt: 49.99, rating: 4.6, reviews: 12345, cat: 'books', bullets: ['Software craftsmanship handbook', 'Agile best practices', '464 pages', 'Essential for developers'] },
  { title: 'Sapiens: A Brief History of Humankind', brand: 'Harper Perennial', price: 15.59, compareAt: 22.99, rating: 4.6, reviews: 56789, cat: 'books', bullets: ['By Yuval Noah Harari', 'Explores 70,000 years of history', '464 pages', 'Over 25 million copies sold'] },
  { title: 'The Body Keeps the Score by Bessel van der Kolk', brand: 'Penguin Books', price: 16.19, compareAt: 19.00, rating: 4.8, reviews: 78901, cat: 'books', bullets: ['Brain, mind, and body in healing of trauma', '#1 New York Times bestseller', '464 pages', 'Essential reading for mental health'] },
  { title: 'Where the Crawdads Sing by Delia Owens', brand: 'G.P. Putnam Sons', price: 12.99, compareAt: 18.00, rating: 4.7, reviews: 92345, cat: 'books', bullets: ['#1 New York Times bestseller', 'Now a major motion picture', '384 pages', 'A captivating mystery'] },
  { title: 'Good to Great by Jim Collins', brand: 'HarperBusiness', price: 18.49, compareAt: 29.99, rating: 4.6, reviews: 15678, cat: 'books', bullets: ['Why some companies make the leap', 'Based on 5 years of research', '320 pages', 'Business classic'] },

  // Clothing (12)
  { title: 'Levi\'s 501 Original Fit Men\'s Jeans', brand: 'Levi\'s', price: 49.99, compareAt: 69.50, rating: 4.5, reviews: 23456, cat: 'clothing', bullets: ['100% cotton', 'Button fly', 'Straight leg through thigh', 'Iconic since 1873'] },
  { title: 'Nike Air Max 270 Running Shoes', brand: 'Nike', price: 129.99, compareAt: 150.00, rating: 4.6, reviews: 8923, cat: 'clothing', bullets: ['Max Air 270 unit in heel', 'Lightweight mesh upper', 'Foam midsole', 'Rubber outsole for traction'] },
  { title: 'Carhartt Men\'s Loose Fit Heavyweight T-Shirt', brand: 'Carhartt', price: 19.99, compareAt: 24.99, rating: 4.7, reviews: 34567, cat: 'clothing', bullets: ['6.75 oz heavyweight cotton', 'Relaxed fit', 'Side-seamed construction', 'Tagless neck label'] },
  { title: 'The North Face Thermoball Eco Jacket', brand: 'The North Face', price: 199.00, compareAt: 230.00, rating: 4.6, reviews: 4521, cat: 'clothing', bullets: ['ThermoBall Eco insulation', 'Water-repellent finish', 'Packable design', 'Made with recycled materials'] },
  { title: 'Adidas Ultraboost 23 Women\'s Running Shoes', brand: 'Adidas', price: 159.99, compareAt: 190.00, rating: 4.5, reviews: 5678, cat: 'clothing', bullets: ['BOOST midsole cushioning', 'Primeknit+ upper', 'Continental rubber outsole', 'Responsive energy return'] },
  { title: 'Hanes Men\'s EcoSmart Fleece Hoodie', brand: 'Hanes', price: 14.00, compareAt: 22.00, rating: 4.4, reviews: 67890, cat: 'clothing', bullets: ['50% cotton, 50% polyester', 'Up to 5% recycled polyester', 'Pill-resistant fabric', 'Front kangaroo pocket'] },
  { title: 'Ray-Ban Aviator Classic Sunglasses', brand: 'Ray-Ban', price: 161.00, compareAt: 182.00, rating: 4.7, reviews: 12345, cat: 'clothing', bullets: ['Crystal green G-15 lenses', 'Gold-tone metal frame', '100% UV protection', 'Iconic pilot shape'] },
  { title: 'Columbia Women\'s Benton Springs Fleece Jacket', brand: 'Columbia', price: 34.99, compareAt: 60.00, rating: 4.6, reviews: 45678, cat: 'clothing', bullets: ['100% polyester MTR fleece', 'Full zip front', 'Zippered side pockets', 'Machine washable'] },
  { title: 'Dickies Men\'s Original 874 Work Pant', brand: 'Dickies', price: 24.99, compareAt: 30.00, rating: 4.5, reviews: 18923, cat: 'clothing', bullets: ['Wrinkle-resistant', 'Stain release finish', 'Permanent crease', 'Classic straight leg'] },
  { title: 'Under Armour Men\'s Tech 2.0 Short-Sleeve T-Shirt', brand: 'Under Armour', price: 22.99, compareAt: 25.00, rating: 4.6, reviews: 56234, cat: 'clothing', bullets: ['UA Tech fabric is quick-drying', 'Anti-odor technology', 'Loose comfortable fit', 'New streamlined fit'] },
  { title: 'Champion Men\'s Reverse Weave Crew Sweatshirt', brand: 'Champion', price: 44.99, compareAt: 60.00, rating: 4.5, reviews: 9876, cat: 'clothing', bullets: ['Reverse weave construction', 'Ribbed side panels', 'Reduced shrinkage', 'Iconic C logo on sleeve'] },
  { title: 'Wrangler Authentics Men\'s Classic Cargo Pant', brand: 'Wrangler', price: 27.99, compareAt: 34.99, rating: 4.4, reviews: 23456, cat: 'clothing', bullets: ['100% cotton twill', 'Relaxed fit through seat and thigh', 'Six functional pockets', 'Reinforced knees'] },

  // Home & Kitchen (13)
  { title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker 6Qt', brand: 'Instant Pot', price: 79.99, compareAt: 99.99, rating: 4.7, reviews: 156789, cat: 'home-kitchen', bullets: ['7-in-1 functionality', '6 quart capacity', '13 smart programs', 'Stainless steel inner pot'] },
  { title: 'Keurig K-Elite Single-Serve Coffee Maker', brand: 'Keurig', price: 149.99, compareAt: 189.99, rating: 4.5, reviews: 23456, cat: 'home-kitchen', bullets: ['Iced coffee setting', 'Strong brew option', 'Large 75oz water reservoir', 'Programmable features'] },
  { title: 'Dyson V15 Detect Cordless Vacuum Cleaner', brand: 'Dyson', price: 649.99, compareAt: 749.99, rating: 4.6, reviews: 8765, cat: 'home-kitchen', bullets: ['Laser reveals microscopic dust', 'Piezo sensor counts particles', '60 min runtime', 'LCD screen shows real-time data'] },
  { title: 'Lodge Pre-Seasoned Cast Iron Skillet 12-Inch', brand: 'Lodge', price: 29.90, compareAt: 39.90, rating: 4.7, reviews: 89012, cat: 'home-kitchen', bullets: ['Pre-seasoned with vegetable oil', 'Unparalleled heat retention', 'Made in the USA', 'Oven safe to any temperature'] },
  { title: 'iRobot Roomba j7+ Self-Emptying Robot Vacuum', brand: 'iRobot', price: 549.99, compareAt: 799.99, rating: 4.3, reviews: 6543, cat: 'home-kitchen', bullets: ['PrecisionVision navigation', 'Self-emptying base', 'Identifies and avoids obstacles', 'Smart mapping technology'] },
  { title: 'Ninja Professional Plus Blender 72oz', brand: 'Ninja', price: 79.99, compareAt: 109.99, rating: 4.7, reviews: 34567, cat: 'home-kitchen', bullets: ['1400 peak watts', '72oz total crushing pitcher', 'Auto-iQ programs', 'Dishwasher-safe parts'] },
  { title: 'KitchenAid Artisan Series 5-Qt Stand Mixer', brand: 'KitchenAid', price: 379.99, compareAt: 449.99, rating: 4.8, reviews: 45678, cat: 'home-kitchen', bullets: ['325-watt motor', '10+ optional attachments', 'Tilt-head design', '59-point planetary mixing'] },
  { title: 'Calphalon Premier Nonstick 10-Piece Cookware Set', brand: 'Calphalon', price: 249.99, compareAt: 349.99, rating: 4.5, reviews: 5678, cat: 'home-kitchen', bullets: ['3 layers of nonstick', 'Hard-anodized aluminum', 'Oven safe to 450°F', 'Stacking cookware saves 30% space'] },
  { title: 'Philips Sonicare DiamondClean Smart Toothbrush', brand: 'Philips', price: 199.99, compareAt: 269.99, rating: 4.6, reviews: 12345, cat: 'home-kitchen', bullets: ['Smart sensor technology', '4 high-performance brush heads', 'Charging glass and travel case', 'Bluetooth app connected'] },
  { title: 'AeroGarden Harvest Indoor Garden System', brand: 'AeroGarden', price: 89.95, compareAt: 109.95, rating: 4.5, reviews: 7890, cat: 'home-kitchen', bullets: ['Grow up to 6 plants at once', '20W LED grow light', 'Automatic watering reminders', 'Includes herb seed pod kit'] },
  { title: 'Nespresso Vertuo Next Coffee Machine', brand: 'Nespresso', price: 159.00, compareAt: 209.00, rating: 4.4, reviews: 15678, cat: 'home-kitchen', bullets: ['Centrifusion technology', '5 cup sizes', 'WiFi connected', 'Made with 54% recycled plastic'] },
  { title: 'Cuisinart 14-Cup Food Processor', brand: 'Cuisinart', price: 199.95, compareAt: 249.95, rating: 4.6, reviews: 8901, cat: 'home-kitchen', bullets: ['720-watt motor', '14-cup work bowl', 'Stainless steel blades', 'BPA-free housing'] },
  { title: 'Yankee Candle Large Jar - Autumn Wreath', brand: 'Yankee Candle', price: 27.99, compareAt: 31.99, rating: 4.5, reviews: 23456, cat: 'home-kitchen', bullets: ['110-150 hours burn time', 'Premium soy-blend wax', 'Natural fiber wick', 'Classic autumn fragrance'] },

  // Toys & Games (12)
  { title: 'LEGO Star Wars Millennium Falcon 75375', brand: 'LEGO', price: 84.99, compareAt: 99.99, rating: 4.8, reviews: 3456, cat: 'toys-games', bullets: ['921 pieces', '7 minifigures included', 'Rotating gun turrets', 'Detailed interior'] },
  { title: 'Nintendo Switch OLED Model - White', brand: 'Nintendo', price: 349.99, compareAt: null, rating: 4.8, reviews: 45678, cat: 'toys-games', bullets: ['7-inch OLED screen', 'Wide adjustable stand', 'Wired LAN port in dock', '64GB internal storage'] },
  { title: 'Hasbro Monopoly Classic Board Game', brand: 'Hasbro', price: 19.99, compareAt: 24.99, rating: 4.5, reviews: 12345, cat: 'toys-games', bullets: ['Classic property trading game', '2-8 players', 'Ages 8 and up', 'Includes updated tokens'] },
  { title: 'Magna-Tiles Clear Colors 100-Piece Set', brand: 'Magna-Tiles', price: 114.99, compareAt: 129.99, rating: 4.8, reviews: 8901, cat: 'toys-games', bullets: ['100 magnetic building tiles', 'STEM-approved toy', 'Compatible with all Magna-Tiles', 'Ages 3+'] },
  { title: 'Hot Wheels Ultimate Garage Playset', brand: 'Hot Wheels', price: 89.99, compareAt: 119.99, rating: 4.6, reviews: 5678, cat: 'toys-games', bullets: ['Stores 100+ cars', 'Multi-level parking', 'Includes 2 vehicles', 'Working elevator and launcher'] },
  { title: 'Play-Doh Mega Pack of 36 Cans', brand: 'Play-Doh', price: 19.99, compareAt: 29.99, rating: 4.7, reviews: 23456, cat: 'toys-games', bullets: ['36 non-toxic colors', 'Net weight 3oz per can', 'Great for parties and classrooms', 'Ages 2+'] },
  { title: 'Ravensburger Disney 1000-Piece Puzzle', brand: 'Ravensburger', price: 17.99, compareAt: 21.99, rating: 4.7, reviews: 4567, cat: 'toys-games', bullets: ['Premium quality 1000 pieces', 'Anti-glare surface', 'Precision-cut pieces', 'Finished size 27x20 inches'] },
  { title: 'Nerf Elite 2.0 Eaglepoint RD-8 Blaster', brand: 'Nerf', price: 29.99, compareAt: 39.99, rating: 4.4, reviews: 6789, cat: 'toys-games', bullets: ['Detachable scope', '8-dart drum', 'Bolt action priming', 'Includes 16 darts'] },
  { title: 'Barbie DreamHouse Dollhouse 2024', brand: 'Barbie', price: 179.99, compareAt: 229.99, rating: 4.5, reviews: 3456, cat: 'toys-games', bullets: ['75+ pieces included', '3 stories and 10 rooms', 'Working elevator', 'Lights and sounds'] },
  { title: 'Exploding Kittens Card Game Original Edition', brand: 'Exploding Kittens', price: 19.99, compareAt: null, rating: 4.6, reviews: 34567, cat: 'toys-games', bullets: ['2-5 players', '15 minutes to play', 'Highly strategic party game', 'Family-friendly edition'] },
  { title: 'Melissa & Doug Wooden Building Blocks Set 100pc', brand: 'Melissa & Doug', price: 24.99, compareAt: 29.99, rating: 4.7, reviews: 7890, cat: 'toys-games', bullets: ['100 wooden blocks in 4 colors', '9 different shapes', 'Solid wood construction', 'Ages 3+'] },
  { title: 'Catan Board Game Strategy Game', brand: 'Catan Studio', price: 39.99, compareAt: 49.99, rating: 4.7, reviews: 23456, cat: 'toys-games', bullets: ['3-4 players', '60 minutes average play time', 'Trade, build, settle', 'Award-winning strategy game'] },

  // Sports (13)
  { title: 'Hydro Flask 32oz Wide Mouth Water Bottle', brand: 'Hydro Flask', price: 44.95, compareAt: 49.95, rating: 4.7, reviews: 34567, cat: 'sports', bullets: ['TempShield double-wall insulation', 'Keeps drinks cold 24hrs/hot 12hrs', 'BPA-free and phthalate-free', 'Powder-coated for grip'] },
  { title: 'Fitbit Charge 6 Advanced Fitness Tracker', brand: 'Fitbit', price: 139.95, compareAt: 159.95, rating: 4.4, reviews: 8901, cat: 'sports', bullets: ['Built-in GPS', 'Heart rate monitoring', '7-day battery life', 'Google apps and services'] },
  { title: 'Manduka PRO Yoga Mat 71-Inch', brand: 'Manduka', price: 120.00, compareAt: 140.00, rating: 4.7, reviews: 5678, cat: 'sports', bullets: ['6mm thick high-density cushion', 'Closed-cell surface', 'Lifetime guarantee', 'Made without toxic chemicals'] },
  { title: 'Bowflex SelectTech 552 Adjustable Dumbbells', brand: 'Bowflex', price: 349.00, compareAt: 429.00, rating: 4.6, reviews: 12345, cat: 'sports', bullets: ['Adjusts from 5 to 52.5 lbs', 'Replaces 15 sets of dumbbells', 'Dial to switch weight', 'Compact design'] },
  { title: 'Yeti Rambler 20oz Tumbler with MagSlider Lid', brand: 'Yeti', price: 35.00, compareAt: 38.00, rating: 4.8, reviews: 56789, cat: 'sports', bullets: ['Double-wall vacuum insulation', '18/8 stainless steel', 'Dishwasher safe', 'No sweat design'] },
  { title: 'Osprey Atmos AG 65 Backpacking Pack', brand: 'Osprey', price: 290.00, compareAt: 320.00, rating: 4.7, reviews: 3456, cat: 'sports', bullets: ['Anti-Gravity suspension system', '65-liter capacity', 'Integrated rain cover', 'Adjustable torso length'] },
  { title: 'Garmin Forerunner 265 GPS Running Smartwatch', brand: 'Garmin', price: 399.99, compareAt: 449.99, rating: 4.6, reviews: 4567, cat: 'sports', bullets: ['AMOLED touchscreen display', 'Training readiness score', 'Up to 13 days battery life', 'Advanced running dynamics'] },
  { title: 'TRX ALL-IN-ONE Suspension Training System', brand: 'TRX', price: 129.95, compareAt: 169.95, rating: 4.6, reviews: 7890, cat: 'sports', bullets: ['Full body workout system', 'Anchor mounts anywhere', 'Includes workout guide', 'Supports up to 350 lbs'] },
  { title: 'Callaway Rogue ST Max Driver 2024', brand: 'Callaway', price: 399.99, compareAt: 549.99, rating: 4.5, reviews: 2345, cat: 'sports', bullets: ['Jailbreak AI Speed Frame', 'Tungsten Speed Cartridge', 'New Flash Face technology', 'Exceptional forgiveness'] },
  { title: 'Coleman Sundome 4-Person Camping Tent', brand: 'Coleman', price: 69.99, compareAt: 99.99, rating: 4.4, reviews: 18923, cat: 'sports', bullets: ['Setup in 10 minutes', 'WeatherTec system', 'Room for queen-size airbed', 'Large windows for ventilation'] },
  { title: 'Theragun Elite Percussive Therapy Device', brand: 'Therabody', price: 299.00, compareAt: 399.00, rating: 4.5, reviews: 6789, cat: 'sports', bullets: ['QuietForce Technology', '5 built-in speeds', '120 min battery life', 'OLED screen with force meter'] },
  { title: 'Wilson NCAA Official Game Basketball', brand: 'Wilson', price: 69.99, compareAt: 89.99, rating: 4.6, reviews: 3456, cat: 'sports', bullets: ['Official NCAA game ball', 'Premium composite leather', 'Moisture-absorbing cover', 'Deep channel design'] },
  { title: 'Schwinn IC4 Indoor Cycling Exercise Bike', brand: 'Schwinn', price: 799.00, compareAt: 999.00, rating: 4.4, reviews: 5678, cat: 'sports', bullets: ['100 micro-adjustable resistance levels', 'Dual link pedals with toe cages', 'Bluetooth connectivity', 'LCD display'] },

  // Beauty (12)
  { title: 'CeraVe Moisturizing Cream 19oz', brand: 'CeraVe', price: 16.99, compareAt: 21.99, rating: 4.7, reviews: 89012, cat: 'beauty', bullets: ['3 essential ceramides', 'MVE technology for 24hr hydration', 'Fragrance-free', 'Developed with dermatologists'] },
  { title: 'Olaplex No. 3 Hair Perfector Treatment', brand: 'Olaplex', price: 28.00, compareAt: 30.00, rating: 4.4, reviews: 45678, cat: 'beauty', bullets: ['Repairs damaged hair', 'Reduces breakage', 'Strengthens hair structure', 'Weekly at-home treatment'] },
  { title: 'Maybelline Lash Sensational Sky High Mascara', brand: 'Maybelline', price: 9.97, compareAt: 13.49, rating: 4.3, reviews: 67890, cat: 'beauty', bullets: ['Lengthening and volumizing', 'Flex Tower mascara brush', 'Buildable formula', 'Ophthalmologist tested'] },
  { title: 'La Roche-Posay Anthelios Sunscreen SPF 60', brand: 'La Roche-Posay', price: 35.99, compareAt: 39.99, rating: 4.6, reviews: 12345, cat: 'beauty', bullets: ['Cell-Ox Shield technology', 'Ultra-light fluid texture', 'Broad spectrum SPF 60', 'Oil-free formula'] },
  { title: 'Dyson Airwrap Multi-Styler Complete Long', brand: 'Dyson', price: 599.99, compareAt: null, rating: 4.5, reviews: 8901, cat: 'beauty', bullets: ['Coanda air styling', '6 attachments for multiple styles', 'Engineered for long hair', 'Intelligent heat control'] },
  { title: 'The Ordinary Niacinamide 10% + Zinc 1% Serum', brand: 'The Ordinary', price: 5.90, compareAt: 7.90, rating: 4.4, reviews: 56789, cat: 'beauty', bullets: ['Reduces blemishes', 'Controls sebum activity', 'Cruelty-free and vegan', 'Lightweight water-based formula'] },
  { title: 'Mario Badescu Drying Lotion for Acne', brand: 'Mario Badescu', price: 17.00, compareAt: null, rating: 4.3, reviews: 34567, cat: 'beauty', bullets: ['Overnight spot treatment', 'Salicylic acid formula', 'Calamine and sulfur blend', 'Dries blemishes overnight'] },
  { title: 'Neutrogena Hydro Boost Water Gel Moisturizer', brand: 'Neutrogena', price: 19.97, compareAt: 26.49, rating: 4.6, reviews: 23456, cat: 'beauty', bullets: ['Hyaluronic acid formula', 'Oil-free and non-comedogenic', '48-hour hydration', 'Lightweight gel texture'] },
  { title: 'Revlon One-Step Hair Dryer and Volumizer', brand: 'Revlon', price: 34.99, compareAt: 59.99, rating: 4.5, reviews: 78901, cat: 'beauty', bullets: ['Dries and volumizes in one step', 'Oval brush design', '3 heat/speed settings', 'Ionic technology reduces frizz'] },
  { title: 'Paula\'s Choice 2% BHA Liquid Exfoliant', brand: 'Paula\'s Choice', price: 32.00, compareAt: 35.00, rating: 4.5, reviews: 15678, cat: 'beauty', bullets: ['Salicylic acid exfoliant', 'Unclogs and minimizes pores', 'Fragrance-free', 'Gentle enough for daily use'] },
  { title: 'Tatcha The Dewy Skin Cream Moisturizer', brand: 'Tatcha', price: 68.00, compareAt: null, rating: 4.5, reviews: 4567, cat: 'beauty', bullets: ['Rich plumping cream', 'Japanese purple rice', 'Hyaluronic acid and ceramides', 'For dry to combination skin'] },
  { title: 'Sol de Janeiro Brazilian Bum Bum Cream 240ml', brand: 'Sol de Janeiro', price: 45.00, compareAt: 48.00, rating: 4.6, reviews: 23456, cat: 'beauty', bullets: ['Fast-absorbing body cream', 'Cupuaçu butter formula', 'Addictive caramel scent', 'Visibly tightening'] },

  // Automotive (12)
  { title: 'Chemical Guys HOL126 Car Wash Kit 14-Piece', brand: 'Chemical Guys', price: 59.99, compareAt: 79.99, rating: 4.5, reviews: 12345, cat: 'automotive', bullets: ['Complete car wash and detailing kit', 'Includes soap, wax, and microfiber towels', 'Safe for all exterior surfaces', 'Professional-grade formulas'] },
  { title: 'NOCO Boost Plus GB40 1000A Jump Starter', brand: 'NOCO', price: 99.95, compareAt: 124.95, rating: 4.6, reviews: 67890, cat: 'automotive', bullets: ['1000 amp 12V lithium jump starter', 'Up to 20 jump starts per charge', 'USB power bank function', 'Safe for gas and diesel engines'] },
  { title: 'Armor All Car Interior Cleaner Spray 16oz', brand: 'Armor All', price: 7.99, compareAt: 10.99, rating: 4.4, reviews: 23456, cat: 'automotive', bullets: ['Cleans and freshens interior', 'Safe on fabric, carpet, leather', 'Removes tough stains', 'Fresh clean scent'] },
  { title: 'BLACK+DECKER 20V MAX Cordless Drill/Driver Kit', brand: 'BLACK+DECKER', price: 49.99, compareAt: 64.99, rating: 4.5, reviews: 45678, cat: 'automotive', bullets: ['20V MAX lithium-ion battery', '24-position clutch', 'LED work light', 'Includes 30-piece accessory kit'] },
  { title: 'Michelin Guardian Hybrid Wiper Blade 26-inch', brand: 'Michelin', price: 24.97, compareAt: 29.97, rating: 4.5, reviews: 8901, cat: 'automotive', bullets: ['Smart hinge design', 'All-weather performance', 'Easy installation', 'EZ Lok connector system'] },
  { title: 'DEWALT 20V MAX Impact Driver Kit', brand: 'DEWALT', price: 119.00, compareAt: 159.00, rating: 4.7, reviews: 34567, cat: 'automotive', bullets: ['1825 in-lbs max torque', 'Compact design for tight spaces', '3 LED lights', 'Belt clip included'] },
  { title: 'Rain-X Original Glass Water Repellent 7oz', brand: 'Rain-X', price: 5.97, compareAt: 8.49, rating: 4.5, reviews: 56789, cat: 'automotive', bullets: ['Dramatically improves visibility', 'Repels rain, sleet, and snow', 'Easy to apply', 'Lasts for weeks'] },
  { title: 'Meguiar\'s Ultimate Liquid Wax 16oz', brand: 'Meguiar\'s', price: 22.99, compareAt: 29.99, rating: 4.6, reviews: 18923, cat: 'automotive', bullets: ['ThinFilm technology', 'Hydrophobic polymer technology', 'Brilliant high-gloss finish', 'Easy wipe-on, wipe-off application'] },
  { title: 'Thinkcar OBD2 Scanner Bluetooth', brand: 'Thinkcar', price: 29.99, compareAt: 49.99, rating: 4.4, reviews: 6789, cat: 'automotive', bullets: ['Read and clear engine codes', 'Bluetooth connectivity', 'Compatible with iOS and Android', 'Supports all OBD2 protocols'] },
  { title: 'EPAuto 12V DC Portable Air Compressor Pump', brand: 'EPAuto', price: 29.97, compareAt: 39.97, rating: 4.5, reviews: 78901, cat: 'automotive', bullets: ['Digital tire inflator', 'Auto shut-off at preset pressure', '4 display units: PSI, KPA, BAR, KG/CM', 'LED flashlight built-in'] },
  { title: 'Energizer LED Headlamp Rechargeable 1000 Lumens', brand: 'Energizer', price: 19.99, compareAt: 27.99, rating: 4.5, reviews: 12345, cat: 'automotive', bullets: ['1000 lumens max output', 'IPX4 water resistant', 'USB rechargeable', '7 light modes'] },
  { title: 'WeatherTech FloorLiner Digital Fit - Universal', brand: 'WeatherTech', price: 79.95, compareAt: 99.95, rating: 4.6, reviews: 23456, cat: 'automotive', bullets: ['Custom-fit laser measured', 'High-density tri-extruded material', 'Channels away water and debris', 'Made in America'] },
];

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

async function main() {
  console.log('Starting seed...');

  // Create or find a seller user
  const seller = await prisma.user.upsert({
    where: { email: 'seller@evara.com' },
    update: {},
    create: {
      email: 'seller@evara.com',
      name: 'Evara Marketplace',
      role: 'SELLER',
      password: '$2b$10$placeholder_hashed_password_not_for_login',
    },
  });
  console.log(`Seller user: ${seller.id}`);

  // Upsert categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description, image: `https://picsum.photos/seed/${cat.slug}/400/400` },
    });
    categoryMap[cat.slug] = c.id;
    console.log(`Category: ${cat.name} -> ${c.id}`);
  }

  // Create products
  let created = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = slugify(p.title);
    const sku = `SKU-${String(i + 1).padStart(4, '0')}`;
    const imageUrl = `https://picsum.photos/seed/${slug.substring(0, 30)}/400/400`;

    try {
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          title: p.title,
          slug,
          description: `${p.title} by ${p.brand}. ${p.bullets.join('. ')}.`,
          bulletPoints: p.bullets,
          brand: p.brand,
          price: p.price,
          compareAtPrice: p.compareAt ?? undefined,
          sku,
          status: 'ACTIVE',
          averageRating: p.rating,
          reviewCount: p.reviews,
          sellerId: seller.id,
          categories: { connect: [{ id: categoryMap[p.cat] }] },
          images: {
            create: [
              { url: imageUrl, alt: p.title, position: 0 },
              { url: `https://picsum.photos/seed/${slug.substring(0, 25)}-2/400/400`, alt: `${p.title} - angle 2`, position: 1 },
            ],
          },
          variants: {
            create: [
              {
                name: 'Default',
                sku: `${sku}-DEF`,
                price: p.price,
                stock: Math.floor(Math.random() * 200) + 10,
                options: {},
              },
            ],
          },
        },
      });
      created++;
    } catch (e: any) {
      if (e.code === 'P2002') {
        console.log(`Skipping duplicate: ${p.title}`);
      } else {
        throw e;
      }
    }
  }

  console.log(`\nCreated ${created} products`);

  const count = await prisma.product.count();
  console.log(`Total products in database: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
