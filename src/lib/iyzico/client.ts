/**
 * GH7.ai — İyzico Client (Singleton)
 *
 * iyzipay SDK callback-style API'sini promisify ederek kullanıyoruz.
 */

import Iyzipay from "iyzipay";

let instance: Iyzipay | null = null;

export function getIyzipay(): Iyzipay {
  if (!instance) {
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const uri =
      process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

    if (!apiKey || !secretKey) {
      throw new Error("[İyzico] IYZICO_API_KEY ve IYZICO_SECRET_KEY env değerleri gerekli");
    }

    instance = new Iyzipay({ apiKey, secretKey, uri });
  }
  return instance;
}
