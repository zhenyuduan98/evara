// SMS Service - Placeholder for Twilio integration
// TODO: Install twilio SDK: npm install twilio
// TODO: Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

export interface SMSOptions {
  phone: string;
  message: string;
}

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    // TODO: Uncomment when twilio is installed
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // const result = await client.messages.create({
    //   body: message,
    //   from: fromNumber,
    //   to: phone,
    // });
    // return { success: true, messageId: result.sid };
    console.log(`[SMS] Would send via Twilio to ${phone}: ${message}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  // Fallback: console log
  console.log(`[SMS] (no Twilio configured) To: ${phone} | Message: ${message}`);
  return { success: true, messageId: `console-${Date.now()}` };
}

export async function sendOTP(phone: string, code: string): Promise<{ success: boolean }> {
  return sendSMS(phone, `Your verification code is: ${code}. It expires in 10 minutes.`);
}
