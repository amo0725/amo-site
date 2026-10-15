import { NextResponse, type NextRequest } from "next/server";

/**
 * Sends visitors who land on "/" to the language they prefer.
 * English-first browsers get /en; everyone else gets Traditional Chinese.
 */
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const primary = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const locale = primary.startsWith("en") ? "en" : "zh-TW";
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  matcher: ["/"],
};
