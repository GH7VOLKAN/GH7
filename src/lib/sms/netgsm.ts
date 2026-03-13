/**
 * NetGSM SMS Servisi
 * API: https://api.netgsm.com.tr/sms/send/get
 */

interface SendSmsResult {
  success: boolean;
  message: string;
}

export async function sendSms(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const usercode = process.env.SMS_USERCODE;
  const password = process.env.SMS_PASSWORD;
  const sender = process.env.SMS_SENDER;

  if (!usercode || !password || !sender) {
    console.error("[sms] NetGSM credentials not configured");
    return { success: false, message: "SMS servisi yapılandırılmamış" };
  }

  // Normalize phone: remove spaces, ensure starts with 90
  let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (normalizedPhone.startsWith("+90")) {
    normalizedPhone = normalizedPhone.slice(1); // remove +
  } else if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "90" + normalizedPhone.slice(1);
  } else if (!normalizedPhone.startsWith("90")) {
    normalizedPhone = "90" + normalizedPhone;
  }

  const params = new URLSearchParams({
    usercode,
    password,
    gsmno: normalizedPhone,
    msgheader: sender,
    dession: "1", // 1 = immediate send
    msg: message,
  });

  try {
    const response = await fetch(
      `https://api.netgsm.com.tr/sms/send/get?${params.toString()}`,
      { method: "GET" }
    );

    const text = await response.text();

    // NetGSM returns codes: 00 = success, 20 = bad message, 30 = bad user, etc.
    if (text.startsWith("00")) {
      console.log(`[sms] Sent to ${normalizedPhone.slice(0, 5)}***`);
      return { success: true, message: "SMS gönderildi" };
    }

    console.error(`[sms] NetGSM error: ${text}`);
    return { success: false, message: `SMS gönderilemedi (kod: ${text.trim()})` };
  } catch (err) {
    console.error("[sms] NetGSM request failed:", err);
    return { success: false, message: "SMS servisi bağlantı hatası" };
  }
}
