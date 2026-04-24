/**
 * Smoke scriptler için .env.local yükleyici.
 * Node.js'in native env dosyası desteği tsx ile her zaman çalışmadığı için
 * manuel parse. .env.local varsa yükler, yoksa sessiz geçer (zaten shell'den
 * export etmiş olabilir).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // "..." veya '...' saran tırnakları kaldır
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // Önceden set edilmişse override etme
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
