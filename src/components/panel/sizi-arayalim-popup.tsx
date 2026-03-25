"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiziArayalimPopup({ open, onOpenChange }: Props) {
  const [phone, setPhone] = useState("+90 ");
  const [timeSlot, setTimeSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    // Save lead to DB (placeholder for now)
    try {
      await fetch("/api/panel/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, timeSlot, subject }),
      });
    } catch {}
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setPhone("+90 ");
      setTimeSlot("");
      setSubject("");
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Talebiniz alındı</h3>
            <p className="text-sm text-gray-500 mt-2">En kısa sürede sizi arayacağız.</p>
            <button onClick={handleClose} className="mt-6 bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-medium">
              Tamam
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">En kısa sürede sizi arayalım</h3>
            <p className="text-sm text-gray-500 mb-6">Bilgilerinizi bırakın, size uygun zamanda ulaşalım.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uygun saatiniz</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="">Seçin</option>
                  <option value="09-12">09:00 - 12:00</option>
                  <option value="12-15">12:00 - 15:00</option>
                  <option value="15-18">15:00 - 18:00</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hangi konuda?</label>
                <div className="space-y-2">
                  {["Fiyat bilgisi", "Teknik detay", "Ajans hizmeti"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="subject"
                        value={opt}
                        checked={subject === opt}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!phone || phone.length < 10}
                className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40"
              >
                Arayın Beni →
              </button>

              <p className="text-center text-xs text-gray-400">
                veya hemen arayın: 0850 XXX XX XX
              </p>
            </div>

            <button onClick={handleClose} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600">
              Kapat
            </button>
          </>
        )}
      </div>
    </div>
  );
}
