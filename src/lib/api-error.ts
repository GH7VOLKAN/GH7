import { NextResponse } from "next/server";
import { captureError } from "./monitoring";

/**
 * Standardised API error handler for Next.js route handlers.
 *
 * Logs the error via `captureError` and returns a JSON response
 * with a user-friendly Turkish message.
 */
export function handleApiError(
  error: unknown,
  context: string,
  status = 500,
) {
  captureError(error, { context });

  return NextResponse.json(
    {
      error: "Bir hata oluştu. Lütfen tekrar deneyin.",
      code: context,
    },
    { status },
  );
}
