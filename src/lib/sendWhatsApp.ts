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

export async function sendWhatsApp(to: string, message: string) {
  const configuredFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (!configuredFrom) {
    throw new Error("TWILIO_WHATSAPP_FROM is not configured.");
  }

  const formattedNumber = formatPhoneNumber(to);
  const client = getTwilioClient();

  const from = configuredFrom.startsWith("whatsapp:")
    ? configuredFrom
    : `whatsapp:${configuredFrom}`;

  const response = await client.messages.create({
    from,
    to: `whatsapp:${formattedNumber}`,
    body: message,
  });

  console.info("Twilio WhatsApp request submitted.", {
    sid: response.sid,
    status: response.status,
    channel: "whatsapp",
  });

  return response;
}
