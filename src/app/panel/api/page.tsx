"use client";

import { useState } from "react";
import { KeyIcon, CopyIcon, EyeIcon, EyeOffIcon, RefreshCwIcon } from "lucide-react";

export default function ApiPage() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = "gh7_sk_demo_1234567890abcdef";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">API</h1>
        <p className="text-sm text-gray-500 mt-1">
          GH7.ai API ile kendi entegrasyonlarınızı oluşturun
        </p>
      </div>

      {/* API Key */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <KeyIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">API Anahtarı</h3>
            <p className="text-xs text-gray-500">Bu anahtarı güvenli bir yerde saklayın</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-700">
            {showKey ? apiKey : "gh7_sk_••••••••••••••••"}
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title={showKey ? "Gizle" : "Göster"}
          >
            {showKey ? (
              <EyeOffIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <EyeIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <button
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Kopyala"
          >
            <CopyIcon className="w-4 h-4 text-gray-500" />
          </button>
          <button
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Yenile"
          >
            <RefreshCwIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Pro plan ile API erişimi aktif olur. Free planda API kullanılamaz.
        </p>
      </div>

      {/* API Docs */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h3 className="font-medium text-gray-900 mb-4">Hızlı Başlangıç</h3>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono">
{`curl -X GET "https://api.gh7.ai/v1/brands/score" \\
  -H "Authorization: Bearer gh7_sk_..." \\
  -H "Content-Type: application/json"

# Yanıt:
{
  "brand": "ISITMAX",
  "geoScore": 74,
  "shareOfVoice": 26,
  "coverage": 100,
  "avgPosition": 1.4,
  "sentiment": 0.64
}`}
          </pre>
        </div>
      </div>

      {/* Endpoints */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h3 className="font-medium text-gray-900 mb-4">API Endpoint&apos;leri</h3>
        <div className="space-y-3">
          {[
            { method: "GET", path: "/v1/brands/score", desc: "GEO skoru ve metrikleri getir" },
            { method: "GET", path: "/v1/keywords", desc: "Takip edilen aramaları listele" },
            { method: "POST", path: "/v1/keywords", desc: "Yeni arama ekle" },
            { method: "GET", path: "/v1/competitors", desc: "Rakipleri listele" },
            { method: "GET", path: "/v1/cities", desc: "İl bazlı verileri getir" },
            { method: "POST", path: "/v1/scan/trigger", desc: "Manuel tarama başlat" },
          ].map((ep) => (
            <div
              key={ep.path}
              className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
            >
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  ep.method === "GET"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {ep.method}
              </span>
              <code className="text-sm text-gray-700 font-mono">{ep.path}</code>
              <span className="text-sm text-gray-500 ml-auto">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
