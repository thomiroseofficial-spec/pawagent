import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    // Strategy: scrape Naver Shopping search results (no API key needed)
    const searchUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}&sort=price_asc`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });

    if (!response.ok) {
      // Fallback: return search link
      return NextResponse.json({
        query,
        prices: [{
          shopName: "네이버 쇼핑",
          price: 0,
          shippingFee: 0,
          url: searchUrl,
          checkedAt: new Date().toISOString(),
        }],
        fallback: true,
      });
    }

    const html = await response.text();

    // Extract product data from Naver Shopping HTML
    // Naver embeds JSON data in __NEXT_DATA__ script tag
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const products = nextData?.props?.pageProps?.initialState?.products?.list || [];

        const prices = products.slice(0, 5).map((item: {
          item: {
            productTitle?: string;
            mallName?: string;
            price?: string | number;
            deliveryFee?: string | number;
            crUrl?: string;
            mallProductUrl?: string;
          }
        }) => ({
          shopName: item.item?.mallName || "쇼핑몰",
          price: parseInt(String(item.item?.price || "0"), 10),
          shippingFee: parseInt(String(item.item?.deliveryFee || "0"), 10),
          url: item.item?.crUrl || item.item?.mallProductUrl || searchUrl,
          checkedAt: new Date().toISOString(),
        })).filter((p: { price: number }) => p.price > 0);

        if (prices.length > 0) {
          return NextResponse.json({ query, prices });
        }
      } catch {
        // JSON parse failed, fall through to regex extraction
      }
    }

    // Fallback: regex extraction from HTML
    const priceMatches = [...html.matchAll(/\"price\":\"?(\d+)\"?/g)].slice(0, 5);
    const mallMatches = [...html.matchAll(/\"mallName\":\"([^"]+)\"/g)].slice(0, 5);

    if (priceMatches.length > 0) {
      const prices = priceMatches.map((match, i) => ({
        shopName: mallMatches[i]?.[1] || `쇼핑몰 ${i + 1}`,
        price: parseInt(match[1], 10),
        shippingFee: 0,
        url: searchUrl,
        checkedAt: new Date().toISOString(),
      })).filter(p => p.price > 0);

      if (prices.length > 0) {
        return NextResponse.json({ query, prices });
      }
    }

    // Final fallback: return search link
    return NextResponse.json({
      query,
      prices: [{
        shopName: "네이버 쇼핑",
        price: 0,
        shippingFee: 0,
        url: searchUrl,
        checkedAt: new Date().toISOString(),
      }],
      fallback: true,
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
