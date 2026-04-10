/**
 * Netgsm SMS API integration
 * Docs: https://www.netgsm.com.tr/dokuman/
 */

export async function sendSms(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_HEADER;

  if (!usercode || !password || !header) {
    console.error(
      "[netgsm] Missing env vars. Required: NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER"
    );
    return { success: false, error: "SMS servisi yapılandırılmamış" };
  }

  // Strip all non-digit chars
  const cleanPhone = phone.replace(/\D/g, "");

  console.log(
    `[netgsm] Sending SMS to ${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-2)}`
  );

  const params = new URLSearchParams({
    usercode,
    password,
    gsmno: cleanPhone,
    message,
    msgheader: header,
  });

  try {
    const response = await fetch("https://api.netgsm.com.tr/sms/send/get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await response.text();
    console.log(`[netgsm] API response: ${text.trim()}`);

    // Netgsm response codes:
    // 00 = success (format: "00 messageId")
    // 20 = post error
    // 30 = invalid user/pass
    // 40 = sender ID not defined
    // 50 = receiver rejected (IYS)
    // 51 = number not approved (IYS)
    // 70 = invalid params
    // 80 = query limit exceeded
    // 85 = duplicate in same minute
    const code = text.trim().split(" ")[0];

    if (code === "00") {
      return { success: true };
    }

    const errorMap: Record<string, string> = {
      "20": "Mesaj gönderilemedi (POST hatası)",
      "30": "Geçersiz kullanıcı bilgileri",
      "40": "Mesaj başlığı tanımlı değil",
      "50": "Alıcı reddetti (IYS)",
      "51": "Numara onaylı değil (IYS)",
      "70": "Geçersiz parametreler",
      "80": "Sorgu limiti aşıldı",
      "85": "Aynı dakika içinde tekrar gönderim",
    };

    return {
      success: false,
      error: errorMap[code] || `Netgsm hata kodu: ${code}`,
    };
  } catch (err) {
    console.error("[netgsm] Network error:", err);
    return { success: false, error: "SMS servisiyle bağlantı kurulamadı" };
  }
}

/**
 * Normalize a Turkish phone number to 90XXXXXXXXXX format.
 * Accepts: +905326629792, 05326629792, 5326629792, 905326629792
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  // Remove leading 0 (Turkish local format: 05XX XXX XX XX)
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Add 90 country code if not present
  if (cleaned.length === 10 && !cleaned.startsWith("90")) {
    cleaned = "90" + cleaned;
  }

  return cleaned;
}

/**
 * Validate that a phone number looks like a valid Turkish mobile number.
 */
export function isValidTurkishPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Turkish mobile: 905XXXXXXXXX (12 digits total: 90 + 5XX + XXX XX XX)
  return /^905\d{9}$/.test(normalized);
}
