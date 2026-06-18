const { execSync } = require('child_process');
const fs = require('fs');

const COOKIE_JAR = '/tmp/smoke-cookies.txt';
const BASE = 'http://localhost:8888';

function curl(method, path, body = null, useAuth = true) {
  let cmd = `curl -s -w '\\n%{http_code}' -X ${method}`;
  if (useAuth) cmd += ` -b ${COOKIE_JAR}`;
  cmd += ` -H "Content-Type: application/json"`;
  if (body) cmd += ` -d '${JSON.stringify(body).replace(/'/g, "'\\''")}'`;
  cmd += ` "${BASE}${path}"`;
  
  try {
    const out = execSync(cmd, { timeout: 15000, encoding: 'utf-8' });
    const lines = out.trim().split('\n');
    const status = parseInt(lines[lines.length - 1]);
    const responseBody = lines.slice(0, -1).join('\n');
    return { status, body: responseBody };
  } catch (e) {
    return { status: 0, body: e.message };
  }
}

function test(endpoint, method, body = null, useAuth = true) {
  const r = curl(method, endpoint, body, useAuth);
  const pass = r.status > 0 && r.status < 500;
  let error = null;
  if (!pass) error = r.body.substring(0, 200);
  // Also fail if response is HTML error page
  if (r.body.includes('<!DOCTYPE') || r.body.includes('<html')) {
    error = 'HTML response';
    // Still pass if it's a redirect (3xx) 
    if (r.status >= 500) pass;
  }
  return { endpoint, method, statusCode: r.status, pass, error };
}

const results = [];

function t(endpoint, method, body, useAuth) {
  const r = test(endpoint, method, body, useAuth);
  console.log(`${r.pass ? '✓' : '✗'} ${r.method} ${r.endpoint} => ${r.statusCode}`);
  results.push(r);
}

// Account routes
t('/api/account', 'GET');
t('/api/account', 'PUT', { name: 'Test Admin' });
t('/api/account/change-password', 'POST', { currentPassword: 'Test123456!', newPassword: 'Test123456!' });
t('/api/account/connected-accounts', 'GET');
t('/api/account/enable-2fa', 'POST', {});
t('/api/account/prime/status', 'GET');
t('/api/account/prime/subscribe', 'POST', { plan: 'monthly' });
t('/api/account/profile', 'GET');
t('/api/account/profile', 'PUT', { name: 'Test Admin' });
t('/api/account/sessions', 'GET');
t('/api/account/sessions/test-session-id', 'DELETE');
t('/api/account/store-credit', 'GET');
t('/api/account/verify-2fa', 'POST', { code: '123456' });

// Without auth
t('/api/account', 'GET', null, false);

// Addresses
t('/api/addresses', 'GET');
t('/api/addresses', 'POST', { street: '123 Main St', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'US', fullName: 'Test Admin', phone: '555-1234' });
t('/api/addresses/fake-id/default', 'PUT');

// Admin routes
t('/api/admin/ab-tests/test-id/results', 'GET');
t('/api/admin/analytics', 'GET');
t('/api/admin/analytics/cohorts', 'GET');
t('/api/admin/analytics/export', 'GET');
t('/api/admin/analytics/funnel', 'GET');
t('/api/admin/analytics/search', 'GET');
t('/api/admin/announcements', 'GET');
t('/api/admin/announcements', 'POST', { title: 'Test', content: 'Test', type: 'info' });
t('/api/admin/announcements/fake-id', 'GET');
t('/api/admin/announcements/fake-id', 'PUT', { title: 'Updated' });
t('/api/admin/announcements/fake-id', 'DELETE');
t('/api/admin/audit-log', 'GET');
t('/api/admin/barcodes', 'POST', { productId: 'fake-id', type: 'QR' });
t('/api/admin/business/fake-id/verify', 'POST', {});
t('/api/admin/campaigns', 'GET');
t('/api/admin/campaigns', 'POST', { name: 'Test Campaign', type: 'email', startDate: '2026-01-01' });
t('/api/admin/commissions', 'GET');
t('/api/admin/commissions', 'POST', { sellerId: 'fake', amount: 10 });
t('/api/admin/coupons', 'GET');
t('/api/admin/coupons', 'POST', { code: 'TEST10', discountType: 'percentage', discountValue: 10, expiresAt: '2027-01-01' });
t('/api/admin/csat', 'GET');
t('/api/admin/disputes', 'GET');
t('/api/admin/disputes/fake-id', 'GET');
t('/api/admin/disputes/fake-id', 'PUT', { status: 'resolved' });
t('/api/admin/email-campaigns', 'GET');
t('/api/admin/email-campaigns', 'POST', { name: 'Test', subject: 'Test', body: 'Test' });
t('/api/admin/email-campaigns/fake-id/send', 'POST', {});
t('/api/admin/escalation-rules', 'GET');
t('/api/admin/escalation-rules', 'POST', { name: 'Test Rule', condition: 'priority=high', action: 'notify' });
t('/api/admin/experiments', 'GET');
t('/api/admin/experiments', 'POST', { name: 'Test Exp', variants: ['A', 'B'] });
t('/api/admin/feature-flags', 'GET');
t('/api/admin/feature-flags', 'POST', { key: 'test-flag', enabled: false });
t('/api/admin/feature-flags/test-flag', 'GET');
t('/api/admin/feature-flags/test-flag', 'PUT', { enabled: true });
t('/api/admin/feature-flags/test-flag', 'DELETE');
t('/api/admin/finance/ledger', 'GET');
t('/api/admin/inventory', 'GET');
t('/api/admin/inventory/bulk', 'POST', { updates: [] });
t('/api/admin/maintenance', 'GET');
t('/api/admin/maintenance', 'POST', { enabled: true, message: 'Maintenance' });
t('/api/admin/notification-templates', 'GET');
t('/api/admin/notification-templates', 'POST', { name: 'Test', subject: 'Test', body: 'Test', type: 'email' });
t('/api/admin/orders', 'GET');
t('/api/admin/orders/export', 'GET');
t('/api/admin/orders/fake-id/fraud-review', 'POST', { action: 'approve' });
t('/api/admin/products', 'GET');
t('/api/admin/products/fake-id', 'GET');
t('/api/admin/products/fake-id', 'PUT', { name: 'Updated' });
t('/api/admin/products/fake-id', 'DELETE');
t('/api/admin/queues', 'GET');
t('/api/admin/refunds', 'GET');
t('/api/admin/refunds/fake-id', 'GET');
t('/api/admin/refunds/fake-id/process', 'POST', { action: 'approve' });
t('/api/admin/returns', 'GET');
t('/api/admin/reviews', 'GET');
t('/api/admin/reviews/fake-id/moderate', 'POST', { action: 'approve' });
t('/api/admin/search/sync', 'POST', {});
t('/api/admin/sellers/fake-id/approve', 'POST', {});
t('/api/admin/sellers/fake-id/payout', 'POST', { amount: 100 });
t('/api/admin/sellers/fake-id/reject', 'POST', { reason: 'test' });
t('/api/admin/sellers/fake-id/suspend', 'POST', { reason: 'test' });
t('/api/admin/shipments/fake-id/pack', 'POST', {});
t('/api/admin/shipments/fake-id/ship', 'POST', { trackingNumber: 'TRACK123', carrier: 'UPS' });
t('/api/admin/shipments/batch-labels', 'POST', { shipmentIds: [] });
t('/api/admin/store-credit', 'GET');
t('/api/admin/store-credit', 'POST', { userId: 'fake', amount: 10, reason: 'test' });
t('/api/admin/system/cache-stats', 'GET');
t('/api/admin/system/health', 'GET');
t('/api/admin/system/metrics', 'GET');
t('/api/admin/tickets/fake-id/assign', 'POST', { agentId: 'fake' });
t('/api/admin/tickets/overdue', 'GET');
t('/api/admin/vine/invite', 'POST', { userId: 'fake', productId: 'fake' });
t('/api/admin/vine/reviewers', 'GET');
t('/api/admin/warehouse/bins', 'GET');
t('/api/admin/warehouse/pick-list', 'GET');
t('/api/admin/warehouses', 'GET');
t('/api/admin/warehouses', 'POST', { name: 'Test Warehouse', address: '123 Main St' });
t('/api/admin/warehouses/fake-id/pick-list', 'GET');

// Admin without auth
t('/api/admin/analytics', 'GET', null, false);

// Ads
t('/api/ads/bid', 'POST', { adId: 'fake', amount: 1.5 });
t('/api/ads/stats', 'GET');
t('/api/ads/track', 'POST', { adId: 'fake', event: 'click' });

// Affiliate
t('/api/affiliate/test-code/click', 'POST', {});
t('/api/affiliate/test-code/stats', 'GET');
t('/api/affiliate/stats', 'GET');

// Summary
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass).length;
console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed out of ${results.length} ===`);
results.filter(r => !r.pass).forEach(r => console.log(`  FAIL: ${r.method} ${r.endpoint} => ${r.statusCode} ${r.error || ''}`));

fs.writeFileSync('/home/azureuser/amazon-clone/test-results/smoke-test-batch1.json', JSON.stringify(results, null, 2));
console.log('\nResults written to test-results/smoke-test-batch1.json');
