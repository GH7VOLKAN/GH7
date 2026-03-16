/**
 * GH7.ai — İyzico Checkout Form
 *
 * İyzico checkout form oluşturma ve doğrulama.
 * Checkout form: kullanıcı kart bilgilerini İyzico'nun güvenli sayfasında girer,
 * biz hiçbir kart bilgisini görmeyiz.
 */

import { getIyzipay } from "./client";
import { getPlanPrice, type PlanPeriod } from "./plans";
import type { PlanType } from "@/lib/plans";

interface CheckoutProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
}

interface CheckoutFormResult {
  status: string;
  token: string;
  checkoutFormContent: string;
}

interface CheckoutFormRetrieveResult {
  status: string;
  paymentStatus: string;
  paymentId: string;
  price: number | string;
  paidPrice: number | string;
  currency: string;
  basketId: string;
  token: string;
}

export async function createCheckoutForm(
  profile: CheckoutProfile,
  plan: Exclude<PlanType, "free">,
  period: PlanPeriod,
): Promise<{ token: string; checkoutFormContent: string }> {
  const iyzipay = getIyzipay();
  const price = getPlanPrice(plan, period);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [firstName, ...rest] = (profile.fullName || "GH7 Kullanıcı").split(" ");
  const lastName = rest.join(" ") || "—";

  const request = {
    locale: "TR" as const,
    conversationId: `${profile.id}_${plan}_${period}_${Date.now()}`,
    price: price.toFixed(2),
    paidPrice: price.toFixed(2),
    currency: "TRY" as const,
    installments: 1,
    basketId: `gh7_${plan}_${period}_${profile.id}`,
    paymentGroup: "SUBSCRIPTION" as const,
    paymentChannel: "WEB" as const,
    callbackUrl: `${appUrl}/api/payment/callback`,
    buyer: {
      id: profile.id,
      name: firstName,
      surname: lastName,
      gsmNumber: profile.phone || "+905000000000",
      email: profile.email,
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
        id: `gh7_${plan}_${period}`,
        name: `GH7.ai ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${period === "monthly" ? "Aylık" : "Yıllık"})`,
        category1: "SaaS Abonelik",
        itemType: "VIRTUAL" as const,
        price: price.toFixed(2),
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await new Promise<CheckoutFormResult>((resolve, reject) => {
    // @types/iyzipay yanlış şekilde paymentCard zorunlu kılıyor —
    // checkout form'da kart bilgisi İyzico tarafında girilir, request'te yok.
    iyzipay.checkoutFormInitialize.create(request as any, (err, res) => {
      if (err) reject(err);
      else resolve(res as unknown as CheckoutFormResult);
    });
  });

  if (result.status !== "success") {
    console.error("[İyzico] Checkout form create failed:", result);
    throw new Error("İyzico checkout form oluşturulamadı");
  }

  return {
    token: result.token,
    checkoutFormContent: result.checkoutFormContent,
  };
}

export async function retrieveCheckoutForm(
  token: string,
): Promise<CheckoutFormRetrieveResult> {
  const iyzipay = getIyzipay();

  const result = await new Promise<CheckoutFormRetrieveResult>((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(
      { locale: "TR" as const, conversationId: token, token },
      (err, res) => {
        if (err) reject(err);
        else resolve(res as unknown as CheckoutFormRetrieveResult);
      },
    );
  });

  return result;
}
