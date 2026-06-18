import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, errorResponse, successResponse } from '@/lib/api-helpers';

// Simplified state tax rates
const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.0725, TX: 0.0625, NY: 0.08, FL: 0.06, WA: 0.065,
  PA: 0.06, IL: 0.0625, OH: 0.0575, GA: 0.04, NC: 0.0475,
  NJ: 0.06625, VA: 0.053, MI: 0.06, AZ: 0.056, MA: 0.0625,
  TN: 0.07, IN: 0.07, MO: 0.04225, MD: 0.06, WI: 0.05,
  CO: 0.029, MN: 0.06875, SC: 0.06, AL: 0.04, LA: 0.0445,
  KY: 0.06, OR: 0, MT: 0, NH: 0, DE: 0,
};

function getTaxRate(state: string): number {
  return STATE_TAX_RATES[state.toUpperCase()] ?? 0.08;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return errorResponse('User not found', 404);

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        items: true,
        shippingAddress: true,
        user: { select: { name: true, email: true } },
        invoice: true,
      },
    });
    if (!order) return errorResponse('Order not found', 404);

    // Return existing invoice or auto-generate
    let invoice = order.invoice;
    if (!invoice) {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const items = order.items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: Number(item.price),
      }));

      invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shippingCost,
          total: order.total,
        },
      });
    }

    const format = req.nextUrl.searchParams.get('format');
    if (format === 'pdf') {
      const items = (invoice.items as Array<{ title: string; quantity: number; price: number }>);
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invoice.invoiceNumber}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px}
table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5}.total{font-weight:bold}.header{display:flex;justify-content:space-between;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}
h1{color:#333}h2{color:#666;margin-top:30px}.right{text-align:right}</style></head>
<body><div class="header"><div><h1>INVOICE</h1><p>${invoice.invoiceNumber}</p><p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p></div>
<div class="right"><p><strong>Evara</strong></p><p>Order: ${order.orderNumber}</p></div></div>
<h2>Bill To</h2><p>${order.user.name || 'Customer'}<br>${order.user.email}<br>
${order.shippingAddress.addressLine1}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
<h2>Items</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
${items.map(item => `<tr><td>${item.title}</td><td>${item.quantity}</td><td>$${Number(item.price).toFixed(2)}</td><td>$${(item.quantity * Number(item.price)).toFixed(2)}</td></tr>`).join('')}
</tbody></table>
<table style="width:300px;margin-left:auto"><tr><td>Subtotal</td><td class="right">$${Number(invoice.subtotal).toFixed(2)}</td></tr>
<tr><td>Tax</td><td class="right">$${Number(invoice.tax).toFixed(2)}</td></tr>
<tr><td>Shipping</td><td class="right">$${Number(invoice.shipping).toFixed(2)}</td></tr>
<tr class="total"><td>Total</td><td class="right">$${Number(invoice.total).toFixed(2)}</td></tr></table></body></html>`;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html', 'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"` },
      });
    }

    return successResponse({
      invoice: {
        ...invoice,
        order: {
          orderNumber: order.orderNumber,
          shippingMethod: order.shippingMethod,
          shippingAddress: order.shippingAddress,
          user: { name: order.user.name, email: order.user.email },
        },
      },
    });
  } catch (error) {
    console.error('Invoice error:', error);
    return errorResponse('Internal server error', 500);
  }
}
