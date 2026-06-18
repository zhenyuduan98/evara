import { prisma } from '@/lib/prisma';
import { LedgerType } from '@prisma/client';

interface LedgerEntryInput {
  orderId?: string;
  sellerId?: string;
  type: LedgerType;
  account: string;
  amount: number;
  description: string;
  reference?: string;
}

export async function recordTransaction(entries: LedgerEntryInput[]) {
  // Validate double-entry: debits must equal credits
  let debits = 0, credits = 0;
  for (const e of entries) {
    if (e.type === 'DEBIT') debits += e.amount;
    else credits += e.amount;
  }
  if (Math.abs(debits - credits) > 0.01) {
    throw new Error(`Double-entry mismatch: debits=${debits}, credits=${credits}`);
  }

  return prisma.ledgerEntry.createMany({
    data: entries.map(e => ({
      orderId: e.orderId,
      sellerId: e.sellerId,
      type: e.type,
      account: e.account,
      amount: e.amount,
      description: e.description,
      reference: e.reference,
    })),
  });
}

// Helper functions for common transactions
export async function recordOrderPayment(orderId: string, amount: number, reference?: string) {
  return recordTransaction([
    { orderId, type: 'DEBIT', account: 'cash', amount, description: 'Order payment received', reference },
    { orderId, type: 'CREDIT', account: 'revenue', amount, description: 'Order revenue', reference },
  ]);
}

export async function recordRefund(orderId: string, amount: number, reference?: string) {
  return recordTransaction([
    { orderId, type: 'DEBIT', account: 'revenue', amount, description: 'Refund issued', reference },
    { orderId, type: 'CREDIT', account: 'cash', amount, description: 'Refund payment', reference },
  ]);
}

export async function recordSellerPayout(sellerId: string, amount: number, reference?: string) {
  return recordTransaction([
    { sellerId, type: 'DEBIT', account: 'seller_payable', amount, description: 'Seller payout', reference },
    { sellerId, type: 'CREDIT', account: 'cash', amount, description: 'Payout disbursement', reference },
  ]);
}

export async function recordCommission(orderId: string, sellerId: string, amount: number, reference?: string) {
  return recordTransaction([
    { orderId, sellerId, type: 'DEBIT', account: 'seller_payable', amount, description: 'Commission deduction', reference },
    { orderId, sellerId, type: 'CREDIT', account: 'commission_revenue', amount, description: 'Commission earned', reference },
  ]);
}
