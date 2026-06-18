import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const warehouseId = searchParams.get('warehouseId');
  const orderId = searchParams.get('orderId');

  if (!warehouseId) {
    return NextResponse.json({ error: 'warehouseId required' }, { status: 400 });
  }

  // Get pending shipments for the warehouse
  const where: Record<string, unknown> = { warehouseId, status: 'PENDING' };
  if (orderId) where.orderId = orderId;

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  // Get all bin locations for this warehouse, sorted by location
  const bins = await prisma.warehouseBin.findMany({
    where: { warehouseId },
    orderBy: { binLocation: 'asc' },
  });

  // Create a bin location map for sorting
  const binMap = new Map(bins.map((b) => [b.productId, b]));

  // Build pick list items from shipments (simplified - in real app would parse order items)
  const pickItems = shipments.map((s) => {
    return {
      shipmentId: s.id,
      orderId: s.orderId,
      warehouseId: s.warehouseId,
    };
  });

  // Sort by bin location for optimal warehouse traversal
  const sortedBins = bins
    .filter((b) => b.quantity > 0)
    .sort((a, b) => {
      // Parse binLocation format: "A-01-03" = aisle-shelf-bin
      const parseLocation = (loc: string) => {
        const parts = loc.split('-');
        return {
          aisle: parts[0] || '',
          shelf: parts[1] || '',
          bin: parts[2] || '',
        };
      };
      const locA = parseLocation(a.binLocation);
      const locB = parseLocation(b.binLocation);
      // Sort by aisle → shelf → bin for optimal walking path
      if (locA.aisle !== locB.aisle) return locA.aisle.localeCompare(locB.aisle);
      if (locA.shelf !== locB.shelf) return locA.shelf.localeCompare(locB.shelf);
      return locA.bin.localeCompare(locB.bin);
    })
    .map((b) => ({
      binLocation: b.binLocation,
      productId: b.productId,
      quantity: b.quantity,
    }));

  return NextResponse.json({
    pickList: sortedBins,
    shipments: pickItems,
    totalItems: sortedBins.length,
  });
}
