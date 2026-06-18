import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const notificationWorker = new Worker(
  'notification',
  async (job) => {
    const { userId, title, body, type, link } = job.data;
    console.log(`[NotificationWorker] Processing job ${job.id}: ${title} for user ${userId}`);

    await prisma.notification.create({
      data: { userId, title, body, type: type || 'SYSTEM', link },
    });

    console.log(`[NotificationWorker] Job ${job.id} completed`);
  },
  {
    connection,
    concurrency: 10,
  },
);

notificationWorker.on('failed', (job, err) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
});

export default notificationWorker;
