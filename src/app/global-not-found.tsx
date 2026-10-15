import type { Metadata } from "next";
import Link from "next/link";
import { archivo } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404",
  description: "這個網址沒有訊號。No signal at this address.",
};

/** Shown for any URL that matches no route, in both languages. */
export default function GlobalNotFound() {
  return (
    <html lang="zh-Hant-TW" className={archivo.variable}>
      <body className="bg-paper text-ink antialiased">
        <main className="flex min-h-[100svh] flex-col justify-center gap-6 px-5 md:px-10">
          <p className="text-[clamp(5rem,22vw,14rem)] leading-none font-extrabold font-expanded">
            404
          </p>
          <div>
            <h1 className="text-2xl font-bold">這個網址沒有訊號。</h1>
            <p className="mt-1 text-ink-soft">
              頁面可能已經移走，或網址打錯了。
            </p>
          </div>
          <div lang="en">
            <p className="text-xl font-bold">No signal at this address.</p>
            <p className="mt-1 text-ink-soft">
              The page may have moved, or the URL has a typo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/zh-TW"
              className="rounded-full bg-ink px-6 py-3 font-semibold text-paper"
            >
              回到首頁
            </Link>
            <Link
              href="/en"
              lang="en"
              className="rounded-full border border-coast px-6 py-3 font-semibold"
            >
              Go to the home page
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
