"use client";

import { useEffect, useRef } from "react";

interface CheckoutModalProps {
  html: string;
  onClose: () => void;
}

/**
 * İyzico checkout form HTML'ini güvenli bir şekilde render eder.
 * İyzico, checkoutFormContent olarak bir <script> + <div> döner.
 * Bu HTML'i bir div'e inject edip script'leri execute ediyoruz.
 */
export function CheckoutModal({ html, onClose }: CheckoutModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    // HTML'i container'a inject et
    containerRef.current.innerHTML = html;

    // Script tag'lerini bul ve execute et
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((originalScript) => {
      const newScript = document.createElement("script");
      // Attribute'ları kopyala
      Array.from(originalScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      // Inline script içeriğini kopyala
      if (originalScript.textContent) {
        newScript.textContent = originalScript.textContent;
      }
      originalScript.parentNode?.replaceChild(newScript, originalScript);
    });
  }, [html]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-gray-900">Ödeme</h3>
          <p className="mt-1 text-sm text-gray-500">
            Kart bilgilerinizi güvenle girin
          </p>
        </div>

        {/* İyzico form buraya render edilecek */}
        <div ref={containerRef} id="iyzipay-checkout-form" className="min-h-[300px]" />
      </div>
    </div>
  );
}
