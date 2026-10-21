import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured.");
  }

  return twilio(accountSid, authToken);
}

function formatPhoneNumber(phone: string) {
  const cleaned = phone.trim().replace(/\D/g, "");

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  throw new Error("Invalid Indian phone number format.");
}

export async function sendSMS(to: string, message: string) {
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    throw new Error("TWILIO_PHONE_NUMBER is not configured.");
  }

  const formattedNumber = formatPhoneNumber(to);
  const client = getTwilioClient();

  const response = await client.messages.create({
    body: message,
    from,
    to: formattedNumber,
  });

  console.info("Twilio SMS request submitted.", {
    sid: response.sid,
    status: response.status,
    channel: "sms",
  });

  return response;
}
