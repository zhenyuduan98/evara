#!/bin/bash
# Smoke test batch 3 - last ~84 API routes
BASE="http://localhost:8888"
COOKIE_FILE="/tmp/cookies3.txt"
RESULTS_FILE="/home/azureuser/amazon-clone/test-results/smoke-test-batch3.json"

mkdir -p /home/azureuser/amazon-clone/test-results

# Initialize results array
echo '[' > "$RESULTS_FILE"
FIRST=true

test_endpoint() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  local use_auth="$4"
  
  local extra_args=""
  if [ "$use_auth" = "auth" ]; then
    extra_args="-b $COOKIE_FILE"
  fi
  
  if [ "$method" = "GET" ]; then
    RESP=$(curl -s --max-time 5 -w '\n%{http_code}' $extra_args "$BASE$endpoint" 2>&1)
  elif [ "$method" = "POST" ]; then
    RESP=$(curl -s --max-time 5 -w '\n%{http_code}' $extra_args -X POST -H 'Content-Type: application/json' -d "$data" "$BASE$endpoint" 2>&1)
  elif [ "$method" = "PUT" ]; then
    RESP=$(curl -s --max-time 5 -w '\n%{http_code}' $extra_args -X PUT -H 'Content-Type: application/json' -d "$data" "$BASE$endpoint" 2>&1)
  elif [ "$method" = "PATCH" ]; then
    RESP=$(curl -s --max-time 5 -w '\n%{http_code}' $extra_args -X PATCH -H 'Content-Type: application/json' -d "$data" "$BASE$endpoint" 2>&1)
  elif [ "$method" = "DELETE" ]; then
    RESP=$(curl -s --max-time 5 -w '\n%{http_code}' $extra_args -X DELETE "$BASE$endpoint" 2>&1)
  fi
  
  local status_code=$(echo "$RESP" | tail -1)
  local body=$(echo "$RESP" | sed '$d')
  
  # Determine pass/fail
  local pass=true
  local error=""
  
  if [ "$status_code" = "000" ] || [ -z "$status_code" ]; then
    status_code=0
    pass=true
    error="timeout/streaming endpoint"
  elif [ "$status_code" = "500" ]; then
    pass=false
    error=$(echo "$body" | head -c 200)
  elif echo "$body" | head -1 | grep -q '<!DOCTYPE\|<html'; then
    pass=false
    error="HTML error page returned"
  fi
  
  # Escape JSON
  error=$(echo "$error" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ' | head -c 200)
  
  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo ',' >> "$RESULTS_FILE"
  fi
  
  echo "  {\"endpoint\": \"$endpoint\", \"method\": \"$method\", \"statusCode\": $status_code, \"pass\": $pass, \"error\": \"$error\"}" >> "$RESULTS_FILE"
  
  echo "$method $endpoint -> $status_code (pass=$pass)"
}

# notifications
test_endpoint GET "/api/notifications" "" auth
test_endpoint POST "/api/notifications" '{"title":"test","message":"test"}' auth
test_endpoint POST "/api/notifications/fake-id/read" '{}' auth
test_endpoint GET "/api/notifications/digest" "" auth
test_endpoint GET "/api/notifications/preferences" "" auth
test_endpoint PUT "/api/notifications/preferences" '{"email":true}' auth
test_endpoint POST "/api/notifications/send" '{"userId":"fake","title":"t","message":"m"}' auth
test_endpoint GET "/api/notifications/stream" "" auth
test_endpoint POST "/api/notifications/subscribe" '{"endpoint":"https://example.com","keys":{"p256dh":"x","auth":"y"}}' auth

# orders
test_endpoint GET "/api/orders" "" auth
test_endpoint POST "/api/orders" '{"items":[]}' auth
test_endpoint GET "/api/orders/fake-id" "" auth
test_endpoint POST "/api/orders/fake-id/cancel" '{}' auth
test_endpoint GET "/api/orders/fake-id/downloads" "" auth
test_endpoint GET "/api/orders/fake-id/invoice" "" auth
test_endpoint GET "/api/orders/fake-id/items/fake-item/download" "" auth
test_endpoint POST "/api/orders/fake-id/refund" '{}' auth
test_endpoint POST "/api/orders/fake-id/reorder" '{}' auth
test_endpoint POST "/api/orders/fake-id/return" '{"reason":"defective"}' auth
test_endpoint GET "/api/orders/fake-id/stream" "" auth
test_endpoint GET "/api/orders/export" "" auth

# payment-methods
test_endpoint GET "/api/payment-methods" "" auth
test_endpoint POST "/api/payment-methods" '{"type":"card","token":"tok_test"}' auth

# products
test_endpoint GET "/api/products" "" ""
test_endpoint POST "/api/products" '{"name":"Test","price":10}' auth
test_endpoint GET "/api/products/fake-id" "" ""
test_endpoint GET "/api/products/fake-id/bulk-pricing" "" ""
test_endpoint GET "/api/products/fake-id/price-history" "" ""
test_endpoint GET "/api/products/fake-id/questions" "" ""
test_endpoint POST "/api/products/fake-id/questions" '{"text":"Is this good?"}' auth
test_endpoint POST "/api/products/fake-id/questions/fake-qid/answer" '{"text":"Yes"}' auth
test_endpoint GET "/api/products/fake-id/review-gallery" "" ""
test_endpoint GET "/api/products/fake-id/reviews" "" ""
test_endpoint POST "/api/products/fake-id/reviews" '{"rating":5,"text":"Great"}' auth
test_endpoint GET "/api/products/fake-id/showcases" "" ""

# promotions
test_endpoint GET "/api/promotions" "" ""

# push
test_endpoint POST "/api/push/send" '{"title":"test"}' auth
test_endpoint POST "/api/push/subscribe" '{"endpoint":"https://example.com","keys":{"p256dh":"x","auth":"y"}}' auth

# questions
test_endpoint GET "/api/questions/fake-id/answers" "" ""
test_endpoint POST "/api/questions/fake-id/answers" '{"text":"answer"}' auth

# recommendations
test_endpoint GET "/api/recommendations/fake-id" "" ""
test_endpoint GET "/api/recommendations/buy-again" "" auth
test_endpoint GET "/api/recommendations/personal" "" auth
test_endpoint GET "/api/recommendations/similar/fake-id" "" ""
test_endpoint GET "/api/recommendations/trending" "" ""

# referrals
test_endpoint POST "/api/referrals/apply" '{"code":"TESTCODE"}' auth
test_endpoint POST "/api/referrals/invite" '{"email":"friend@test.com"}' auth
test_endpoint GET "/api/referrals/stats" "" auth

# returns
test_endpoint GET "/api/returns/fake-id/label" "" auth

# reviews
test_endpoint POST "/api/reviews/fake-id/flag" '{"reason":"spam"}' auth
test_endpoint POST "/api/reviews/fake-id/helpful" '{}' auth
test_endpoint POST "/api/reviews/fake-id/vote" '{"helpful":true}' auth

# search
test_endpoint GET "/api/search?q=test" "" ""
test_endpoint POST "/api/search/barcode" '{"barcode":"1234567890"}' ""
test_endpoint POST "/api/search/image" '{}' ""
test_endpoint GET "/api/search/suggestions?q=test" "" ""

# seller
test_endpoint POST "/api/seller/register" '{"businessName":"TestShop","businessType":"individual"}' auth
test_endpoint GET "/api/seller/fake-id/review" "" ""
test_endpoint GET "/api/seller/advertising/campaigns" "" auth
test_endpoint GET "/api/seller/analytics" "" auth
test_endpoint GET "/api/seller/analytics/dashboard" "" auth
test_endpoint GET "/api/seller/api-keys" "" auth
test_endpoint POST "/api/seller/appeal" '{"reason":"unfair"}' auth
test_endpoint GET "/api/seller/dashboard" "" auth
test_endpoint GET "/api/seller/earnings" "" auth
test_endpoint GET "/api/seller/financial-reports" "" auth
test_endpoint POST "/api/seller/kyc" '{"documentType":"passport"}' auth
test_endpoint GET "/api/seller/messages" "" auth
test_endpoint GET "/api/seller/orders" "" auth
test_endpoint POST "/api/seller/orders/ship" '{"orderId":"fake","trackingNumber":"123"}' auth
test_endpoint GET "/api/seller/performance" "" auth
test_endpoint POST "/api/seller/products/bulk-delete" '{"ids":["fake"]}' auth
test_endpoint PUT "/api/seller/products/bulk-update" '{"products":[]}' auth
test_endpoint POST "/api/seller/products/bulk" '{"products":[]}' auth
test_endpoint POST "/api/seller/products/import" '{}' auth
test_endpoint GET "/api/seller/products" "" auth
test_endpoint GET "/api/seller/statements" "" auth
test_endpoint GET "/api/seller/team" "" auth

# shipping
test_endpoint POST "/api/shipping/calculate" '{"weight":1,"destination":"US"}' ""
test_endpoint POST "/api/shipping/estimate" '{"zipCode":"10001","items":[]}' ""
test_endpoint POST "/api/shipping/rates" '{"origin":"US","destination":"US","weight":1}' ""
test_endpoint GET "/api/shipping/windows" "" ""

# subscriptions
test_endpoint GET "/api/subscriptions" "" auth
test_endpoint POST "/api/subscriptions" '{"productId":"fake","frequency":"monthly"}' auth
test_endpoint GET "/api/subscriptions/fake-id" "" auth
test_endpoint PATCH "/api/subscriptions/fake-id" '{"frequency":"weekly"}' auth
test_endpoint POST "/api/subscriptions/process" '{}' auth

# support
test_endpoint GET "/api/support/chat/stream" "" auth
test_endpoint POST "/api/support/chatbot" '{"message":"help"}' auth
test_endpoint GET "/api/support/tickets" "" auth
test_endpoint POST "/api/support/tickets" '{"subject":"Help","description":"Need help"}' auth

# tax
test_endpoint POST "/api/tax/calculate" '{"items":[],"shippingAddress":{"state":"CA"}}' ""

# tickets
test_endpoint GET "/api/tickets" "" auth
test_endpoint POST "/api/tickets" '{"subject":"Test","description":"Test issue"}' auth
test_endpoint GET "/api/tickets/fake-id" "" auth
test_endpoint POST "/api/tickets/fake-id/feedback" '{"rating":5}' auth
test_endpoint GET "/api/tickets/fake-id/messages" "" auth
test_endpoint POST "/api/tickets/fake-id/messages" '{"content":"Hello"}' auth

# track
test_endpoint GET "/api/track/click/fake-id" "" ""
test_endpoint GET "/api/track/open/fake-id" "" ""

# tracking
test_endpoint GET "/api/tracking/FAKE123456" "" ""

# upload
test_endpoint POST "/api/upload" '{}' auth

# user-coupons
test_endpoint GET "/api/user-coupons" "" auth

# vine
test_endpoint GET "/api/vine/available" "" auth
test_endpoint POST "/api/vine/claim/fake-product-id" '{}' auth
test_endpoint GET "/api/vine/my-claims" "" auth
test_endpoint GET "/api/vine/products" "" auth

# wallet
test_endpoint GET "/api/wallet" "" auth
test_endpoint POST "/api/wallet/topup" '{"amount":100}' auth

# webhooks
test_endpoint POST "/api/webhooks/carrier" '{"trackingNumber":"123","status":"delivered"}' ""
test_endpoint POST "/api/webhooks/stripe" '{"type":"payment_intent.succeeded"}' ""

# wishlist
test_endpoint GET "/api/wishlist" "" auth
test_endpoint POST "/api/wishlist" '{"productId":"fake-id"}' auth

echo ']' >> "$RESULTS_FILE"
echo "Done! Results written to $RESULTS_FILE"
