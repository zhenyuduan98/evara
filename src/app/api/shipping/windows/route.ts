import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip') || '10001';

  const now = new Date();
  const windows = [];

  // Standard: 5-7 business days
  for (let i = 5; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    windows.push({
      type: 'STANDARD',
      scheduledDate: date.toISOString().split('T')[0],
      timeSlot: null,
      fee: 0,
      label: `Standard Delivery - ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
    });
  }

  // Express: 2-3 days
  for (let i = 2; i <= 3; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    windows.push({
      type: 'EXPRESS',
      scheduledDate: date.toISOString().split('T')[0],
      timeSlot: null,
      fee: 9.99,
      label: `Express Delivery - ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
    });
  }

  // Same-day with time slots (if before 2pm)
  if (now.getHours() < 14) {
    const slots = ['2:00 PM - 5:00 PM', '5:00 PM - 8:00 PM', '7:00 PM - 10:00 PM'];
    for (const slot of slots) {
      windows.push({
        type: 'SAME_DAY',
        scheduledDate: now.toISOString().split('T')[0],
        timeSlot: slot,
        fee: 14.99,
        label: `Same Day - ${slot}`,
      });
    }
  }

  // Tomorrow time slots
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowSlots = ['9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM', '6:00 PM - 9:00 PM'];
  for (const slot of tomorrowSlots) {
    windows.push({
      type: 'SAME_DAY',
      scheduledDate: tomorrow.toISOString().split('T')[0],
      timeSlot: slot,
      fee: 12.99,
      label: `Tomorrow - ${slot}`,
    });
  }

  return NextResponse.json({ windows, zip });
}
