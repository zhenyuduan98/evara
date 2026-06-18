#!/bin/bash
# First, register a test user and make them admin
echo "Setting up test user..."

# Register
curl -s -X POST http://localhost:8888/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@test.com","password":"Test123456!","name":"Test Admin"}' > /dev/null 2>&1

# Make admin via prisma
cd ~/amazon-clone
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async()=>{
  await p.user.updateMany({where:{email:'testadmin@test.com'},data:{role:'ADMIN'}});
  console.log('done');
  await p.\$disconnect();
})().catch(e=>{console.error(e);process.exit(1)});
" 2>&1

# Get session cookie via credentials login
COOKIE_JAR=/tmp/smoke-cookies.txt
rm -f $COOKIE_JAR

# Get CSRF token first
CSRF=$(curl -s -c $COOKIE_JAR -b $COOKIE_JAR http://localhost:8888/api/auth/csrf | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).csrfToken)}catch(e){console.log('')}})")
echo "CSRF: $CSRF"

# Login via next-auth credentials
curl -s -c $COOKIE_JAR -b $COOKIE_JAR -X POST http://localhost:8888/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=testadmin@test.com&password=Test123456!&csrfToken=$CSRF&callbackUrl=http://localhost:8888&json=true" \
  -L > /dev/null 2>&1

# Verify session
echo "Session check:"
curl -s -b $COOKIE_JAR http://localhost:8888/api/auth/session | head -c 200
echo ""

