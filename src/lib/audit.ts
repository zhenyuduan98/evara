import { prisma } from '@/lib/prisma';

export async function logAdminAction(
  adminId: string,
  action: string,
  target: string,
  details?: Record<string, any>,
  options?: { targetId?: string; ip?: string }
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        target,
        targetId: options?.targetId,
        details: details ?? undefined,
        ip: options?.ip,
      },
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}
