import { Worker } from 'bullmq';
import { sendEmailDirect } from '../lib/email-direct';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, html } = job.data;
    console.log(`[EmailWorker] Processing job ${job.id}: ${subject} -> ${to}`);
    await sendEmailDirect(to, subject, html);
    console.log(`[EmailWorker] Job ${job.id} completed`);
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  },
);

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on('completed', (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully`);
});

export default emailWorker;
