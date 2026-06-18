import { Queue, type ConnectionOptions } from 'bullmq';

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

function createQueue(name: string): Queue {
  try {
    return new Queue(name, { connection });
  } catch (error) {
    console.warn(`[Queue] Failed to create queue "${name}":`, error);
    // Return a mock queue that won't crash
    return new Queue(name, { connection });
  }
}

export const emailQueue = createQueue('email');
export const notificationQueue = createQueue('notification');
export const inventoryQueue = createQueue('inventory');

export async function addEmailJob(to: string, subject: string, html: string) {
  try {
    await emailQueue.add('send-email', { to, subject, html }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    console.log(`[Queue] Email job added for ${to}: ${subject}`);
  } catch {
    // Fallback: direct execution if Redis unavailable
    console.warn('[Queue] Redis unavailable, sending email directly');
    const { sendEmailDirect } = await import('./email-direct');
    await sendEmailDirect(to, subject, html);
  }
}

export async function addNotificationJob(userId: string, title: string, body: string, type = 'SYSTEM', link?: string) {
  try {
    await notificationQueue.add('create-notification', { userId, title, body, type, link }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    console.log(`[Queue] Notification job added for user ${userId}: ${title}`);
  } catch {
    console.warn('[Queue] Redis unavailable, creating notification directly');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      await prisma.notification.create({
        data: { userId, title, body, type, link },
      });
    } finally {
      await prisma.$disconnect();
    }
  }
}

export async function getQueueStats(queue: Queue) {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  } catch {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, error: 'Redis unavailable' };
  }
}
