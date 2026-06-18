import { NextRequest } from 'next/server';

// Import shared listeners from bid route
let bidListeners: Map<string, Set<(data: string) => void>>;
try {
  bidListeners = require('../bid/route').bidListeners;
} catch {
  bidListeners = new Map();
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auctionId = params.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // stream closed
        }
      };

      // Send heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Register listener
      if (!bidListeners.has(auctionId)) {
        bidListeners.set(auctionId, new Set());
      }
      bidListeners.get(auctionId)!.add(send);

      // Send initial connection message
      send(JSON.stringify({ type: 'connected', auctionId }));

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        const listeners = bidListeners.get(auctionId);
        if (listeners) {
          listeners.delete(send);
          if (listeners.size === 0) bidListeners.delete(auctionId);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
