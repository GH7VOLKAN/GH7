/**
 * İyzico Refund (İade) Wrapper
 *
 * Escrow akışında kullanıcı memnun kalmazsa tam iade yapılır.
 * `paymentTransactionId` = iyzico'nun payment.paymentItems[0].paymentTransactionId
 */

import { getIyzipay } from "./client";

interface RefundResult {
  status: string;
  paymentId?: string;
  paymentTransactionId?: string;
  price?: number;
  currency?: string;
  errorMessage?: string;
}

/**
 * İyzico üzerinden ödeme iadesi yapar.
 *
 * @param paymentTransactionId - İyzico ödeme transaction ID (Payment.iyzicoPaymentId DEĞİL,
 *   basketItem-level paymentTransactionId). Bu bilgi callback'te retrieveCheckoutForm
 *   sonucundan alınır.
 * @param price - İade edilecek tutar (TRY)
 * @param ip - Client IP (iyzico zorunlu kılıyor)
 */
export async function refundPayment(
  paymentTransactionId: string,
  price: number,
  ip = "85.34.78.112"
): Promise<{ success: boolean; errorMessage?: string }> {
  const iyzipay = getIyzipay();

  const request = {
    locale: "TR" as const,
    conversationId: `refund_${paymentTransactionId}_${Date.now()}`,
    paymentTransactionId,
    price: price.toFixed(2),
    currency: "TRY" as const,
    ip,
  };

  const result = await new Promise<RefundResult>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iyzipay.refund.create(request as any, (err, res) => {
      if (err) reject(err);
      else resolve(res as unknown as RefundResult);
    });
  });

  if (result.status !== "success") {
    console.error("[İyzico] Refund failed:", result);
    return { success: false, errorMessage: result.errorMessage ?? "İade başarısız" };
  }

  return { success: true };
}
