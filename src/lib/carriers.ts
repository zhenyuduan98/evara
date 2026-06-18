export interface CarrierRate {
  carrier: string;
  service: string;
  rate: number;
  currency: string;
  estimatedDays: number;
  trackingAvailable: boolean;
}

export interface Address {
  zip: string;
  state?: string;
  country?: string;
}

export async function getCarrierRates(
  weight: number,
  origin: Address,
  destination: Address
): Promise<CarrierRate[]> {
  const baseRate = weight * 0.5;
  const distanceFactor = Math.abs(
    parseInt(origin.zip.slice(0, 3) || '100') - parseInt(destination.zip.slice(0, 3) || '100')
  ) * 0.01 + 1;

  return [
    {
      carrier: 'UPS',
      service: 'UPS Ground',
      rate: Math.round((baseRate * distanceFactor * 1.2 + 5.99) * 100) / 100,
      currency: 'USD',
      estimatedDays: 5,
      trackingAvailable: true,
    },
    {
      carrier: 'UPS',
      service: 'UPS 2nd Day Air',
      rate: Math.round((baseRate * distanceFactor * 2.0 + 12.99) * 100) / 100,
      currency: 'USD',
      estimatedDays: 2,
      trackingAvailable: true,
    },
    {
      carrier: 'UPS',
      service: 'UPS Next Day Air',
      rate: Math.round((baseRate * distanceFactor * 3.5 + 24.99) * 100) / 100,
      currency: 'USD',
      estimatedDays: 1,
      trackingAvailable: true,
    },
    {
      carrier: 'FedEx',
      service: 'FedEx Home Delivery',
      rate: Math.round((baseRate * distanceFactor * 1.1 + 6.49) * 100) / 100,
      currency: 'USD',
      estimatedDays: 5,
      trackingAvailable: true,
    },
    {
      carrier: 'FedEx',
      service: 'FedEx 2Day',
      rate: Math.round((baseRate * distanceFactor * 1.9 + 13.49) * 100) / 100,
      currency: 'USD',
      estimatedDays: 2,
      trackingAvailable: true,
    },
    {
      carrier: 'FedEx',
      service: 'FedEx Overnight',
      rate: Math.round((baseRate * distanceFactor * 3.2 + 26.99) * 100) / 100,
      currency: 'USD',
      estimatedDays: 1,
      trackingAvailable: true,
    },
    {
      carrier: 'USPS',
      service: 'USPS Priority Mail',
      rate: Math.round((baseRate * distanceFactor * 0.9 + 4.99) * 100) / 100,
      currency: 'USD',
      estimatedDays: 3,
      trackingAvailable: true,
    },
    {
      carrier: 'USPS',
      service: 'USPS Priority Mail Express',
      rate: Math.round((baseRate * distanceFactor * 2.5 + 22.99) * 100) / 100,
      currency: 'USD',
      estimatedDays: 1,
      trackingAvailable: true,
    },
    {
      carrier: 'USPS',
      service: 'USPS Ground Advantage',
      rate: Math.round((baseRate * distanceFactor * 0.7 + 3.49) * 100) / 100,
      currency: 'USD',
      estimatedDays: 7,
      trackingAvailable: true,
    },
  ];
}

export function generateTrackingNumber(carrier: string): string {
  const prefix = carrier === 'UPS' ? '1Z' : carrier === 'FedEx' ? '7489' : '9400';
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${digits}`;
}

export function generateLabelUrl(carrier: string, trackingNumber: string): string {
  return `/labels/${carrier.toLowerCase()}/${trackingNumber}.pdf`;
}
