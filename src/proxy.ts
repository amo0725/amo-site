import { NextResponse, type NextRequest } from "next/server";
import { locales } from "@/content/locales";

const preferred = (request: NextRequest) => {
  const accept = request.headers.get("accept-language") ?? "";
  const primary = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return primary.startsWith("en") ? "en" : "zh-TW";
};

/** Paths that exist without a language in front of them, once given one. */
const SECTIONS = new Set(["work", "experience"]);

/**
 * Runs only on addresses with no page of their own (see the matcher):
 *
 * - "/" goes to the language the visitor prefers.
 * - A language in the wrong case (/EN, /zh-tw/work/…) goes to the real one.
 * - A path that forgot its language (/work/inbox-freeze) gets the preferred
 *   one in front.
 * - /en/work and /en/experience go to that section of the page.
 * - Anything else is shown a language's own 404 (the one in the path, or
 *   the preferred one), at the same address, with a 404 status.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [first = "", ...rest] = pathname.split("/").filter(Boolean);
  const tail = rest.length ? `/${rest.join("/")}` : "";

  if (!first) {
    const response = NextResponse.redirect(
      new URL(`/${preferred(request)}${search}`, request.url),
    );
    response.headers.set("Vary", "Accept-Language");
    return response;
  }

  const locale = locales.find((l) => l.toLowerCase() === first.toLowerCase());
  if (locale === first) {
    if (rest.length === 0) return NextResponse.next();
    // /en/work and /en/experience have no page of their own: the section.
    if (rest.length === 1 && SECTIONS.has(rest[0])) {
      return NextResponse.redirect(
        new URL(`/${locale}${search}#${rest[0]}`, request.url),
      );
    }
    // Any other path inside a language that the matcher let through has
    // no page: that language's 404.
    return notFound(request, locale);
  }
  if (locale && locale !== first) {
    return NextResponse.redirect(
      new URL(`/${locale}${tail}${search}`, request.url),
      308,
    );
  }

  if (SECTIONS.has(first.toLowerCase())) {
    const response = NextResponse.redirect(
      new URL(
        `/${preferred(request)}/${first.toLowerCase()}${tail}${search}`,
        request.url,
      ),
    );
    response.headers.set("Vary", "Accept-Language");
    return response;
  }

  const response = await notFound(request, preferred(request));
  response.headers.set("Vary", "Accept-Language");
  return response;
}

/**
 * The language's own 404 page (prerendered at /{locale}/404), served at the
 * requested address with a 404 status. A rewrite would keep the page's 200,
 * so the page is fetched and passed on with the right status; if that
 * fails, the rewrite still shows the page.
 */
async function notFound(request: NextRequest, locale: string) {
  const target = new URL(`/${locale}/404`, request.url);
  try {
    const page = await fetch(target, {
      headers: {
        accept: "text/html",
        cookie: request.headers.get("cookie") ?? "",
      },
    });
    if (page.ok) {
      return new NextResponse(page.body, {
        status: 404,
        headers: {
          "content-type": page.headers.get("content-type") ?? "text/html",
          "cache-control": "public, max-age=0, s-maxage=3600",
          "x-robots-tag": "noindex",
        },
      });
    }
  } catch {
    // Fall through to the rewrite.
  }
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: [
    // Everything but the two languages, Next's own files and the files
    // that really exist (public folders, sitemap, robots, manifest, icon).
    "/((?!en/|en$|zh-TW/|zh-TW$|_next/|_vercel/|projects/|reel/|icon\\.svg$|robots\\.txt$|sitemap\\.xml$|manifest\\.webmanifest$).*)",
    // Inside a language: anything but a case, a body of work, the share
    // cards (those pages 404 an unknown id themselves) or the 404 page.
    "/:lang(en|zh-TW)/((?!work/[^/]+$|work/[^/]+/opengraph-image/|experience/[^/]+$|opengraph-image/|404$).*)",
  ],
};
