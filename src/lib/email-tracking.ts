const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Add tracking pixel to email HTML
 */
export function addTrackingPixel(html: string, notificationId: string): string {
  const pixel = `<img src="${BASE_URL}/api/track/open/${notificationId}" width="1" height="1" style="display:none" alt="" />`;
  return html.replace('</body>', `${pixel}</body>`);
}

/**
 * Wrap links in email HTML with click tracking
 */
export function wrapLinksWithTracking(html: string, notificationId: string): string {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_, url) => `href="${BASE_URL}/api/track/click/${notificationId}?url=${encodeURIComponent(url)}"`
  );
}

/**
 * Apply all tracking to email HTML
 */
export function applyEmailTracking(html: string, notificationId: string): string {
  let tracked = wrapLinksWithTracking(html, notificationId);
  tracked = addTrackingPixel(tracked, notificationId);
  return tracked;
}
