const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const faqs = [
  { question: 'How do I track my order?', answer: 'Go to Your Orders page, click on the order, and you will see the tracking information with real-time updates.', keywords: ['track', 'order', 'tracking', 'shipping', 'where'], order: 1 },
  { question: 'How do I return an item?', answer: 'Go to Your Orders, select the item you want to return, choose a reason, and print the return label. You have 30 days from delivery.', keywords: ['return', 'refund', 'send back', 'exchange'], order: 2 },
  { question: 'How do I cancel an order?', answer: 'Go to Your Orders and click Cancel Order. If the order has already shipped, you may need to return it instead.', keywords: ['cancel', 'order', 'stop'], order: 3 },
  { question: 'What payment methods do you accept?', answer: 'We accept Visa, Mastercard, American Express, PayPal, gift cards, and store credit.', keywords: ['payment', 'pay', 'credit card', 'visa', 'mastercard', 'paypal'], order: 4 },
  { question: 'How do I change my password?', answer: 'Go to Account Settings > Security > Change Password. You will need to enter your current password and then your new password.', keywords: ['password', 'change', 'reset', 'login', 'security'], order: 5 },
  { question: 'How do I contact customer support?', answer: 'You can reach us via live chat, email at support@example.com, or by creating a support ticket from your account.', keywords: ['contact', 'support', 'help', 'agent', 'chat', 'email'], order: 6 },
  { question: 'What is your shipping policy?', answer: 'Standard shipping takes 5-7 business days. Prime members get free 2-day shipping. Express shipping is available for an extra fee.', keywords: ['shipping', 'delivery', 'prime', 'fast', 'time', 'days'], order: 7 },
  { question: 'How do I apply a coupon code?', answer: 'Enter your coupon code at checkout in the Promo Code field and click Apply. The discount will be reflected in your total.', keywords: ['coupon', 'promo', 'discount', 'code', 'apply'], order: 8 },
  { question: 'How do I update my shipping address?', answer: 'Go to Account Settings > Addresses to add, edit, or remove shipping addresses. You can also change the address during checkout.', keywords: ['address', 'shipping', 'change', 'update', 'move'], order: 9 },
  { question: 'How do I leave a product review?', answer: 'Go to the product page or Your Orders and click Write a Review. Rate the product 1-5 stars and share your experience.', keywords: ['review', 'rating', 'feedback', 'star', 'rate'], order: 10 },
  { question: 'What is the Prime membership?', answer: 'Prime membership includes free 2-day shipping, exclusive deals, and more. You can subscribe from your Account Settings.', keywords: ['prime', 'membership', 'subscribe', 'benefits', 'free shipping'], order: 11 },
  { question: 'How do I check my gift card balance?', answer: 'Go to Account Settings > Gift Cards and Store Credit to view your current balance and transaction history.', keywords: ['gift card', 'balance', 'credit', 'redeem'], order: 12 },
];

async function main() {
  console.log('Seeding ChatbotFAQ entries...');
  // Delete existing
  await prisma.chatbotFAQ.deleteMany();
  for (const faq of faqs) {
    await prisma.chatbotFAQ.create({ data: faq });
  }
  console.log(`Seeded ${faqs.length} FAQ entries`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
