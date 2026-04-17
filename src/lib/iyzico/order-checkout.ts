/**
 * İyzico Checkout Form for Service Orders (PRODUCT payment group)
 *
 * Hizmet paketi siparişleri için checkout. Subscription değil, tek seferlik ödeme.
 */

import { getIyzipay } from "./client";

interface OrderCheckoutInput {
  profileId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  orderId: string;
  packageName: string;
  price: number;
}

interface CheckoutFormResult {
  status: string;
  token: string;
  checkoutFormContent: string;
  errorMessage?: string;
}

export async function createOrderCheckoutForm(
  input: OrderCheckoutInput
): Promise<{ token: string; checkoutFormContent: string }> {
  const iyzipay = getIyzipay();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [firstName, ...rest] = (input.fullName || "GH7 Kullanıcı").split(" ");
  const lastName = rest.join(" ") || "—";

  const request = {
    locale: "TR" as const,
    conversationId: `order_${input.orderId}_${Date.now()}`,
    price: input.price.toFixed(2),
    paidPrice: input.price.toFixed(2),
    currency: "TRY" as const,
    installments: 1,
    basketId: `order_${input.orderId}`,
    paymentGroup: "PRODUCT" as const,
    paymentChannel: "WEB" as const,
    callbackUrl: `${appUrl}/api/orders/${input.orderId}/payment-callback`,
    buyer: {
      id: input.profileId,
      name: firstName,
      surname: lastName,
      gsmNumber: input.phone || "+905000000000",
      email: input.email,
      identityNumber: "11111111111",
      registrationAddress: "Türkiye",
      ip: "85.34.78.112",
      city: "Istanbul",
      country: "Turkey",
    },
    shippingAddress: {
      contactName: `${firstName} ${lastName}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Türkiye",
    },
    billingAddress: {
      contactName: `${firstName} ${lastName}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Türkiye",
    },
    basketItems: [
      {
        id: `order_${input.orderId}`,
        name: input.packageName,
        category1: "GEO Hizmet",
        itemType: "VIRTUAL" as const,
        price: input.price.toFixed(2),
      },
    ],
  };

  const result = await new Promise<CheckoutFormResult>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    iyzipay.checkoutFormInitialize.create(request as any, (err, res) => {
      if (err) reject(err);
      else resolve(res as unknown as CheckoutFormResult);
    });
  });

  if (result.status !== "success") {
    console.error("[İyzico] Order checkout form create failed:", result);
    throw new Error(
      `İyzico checkout form oluşturulamadı: ${result.errorMessage ?? "bilinmeyen hata"}`
    );
  }

  return {
    token: result.token,
    checkoutFormContent: result.checkoutFormContent,
  };
}
