import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const PRICE_CACHE_MINUTES = 60;

function fallbackResponse(query: string, searchUrl: string) {
  return NextResponse.json({
    query,
    prices: [
      {
        shopName: "네이버 쇼핑",
        price: 0,
        shippingFee: -1,
        url: searchUrl,
        checkedAt: new Date().toISOString(),
      },
    ],
    fallback: true,
  });
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");
    const productId = request.nextUrl.searchParams.get("productId");

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 }
      );
    }

    // Check cached prices if productId provided
    if (productId) {
      const cutoff = new Date(
        Date.now() - PRICE_CACHE_MINUTES * 60 * 1000
      ).toISOString();

      const { data: cachedPrices } = await supabase
        .from("prices")
        .select("*")
        .eq("productId", productId)
        .gt("checkedAt", cutoff)
        .order("price", { ascending: true });

      if (cachedPrices?.length) {
        return NextResponse.json({
          query,
          prices: cachedPrices,
          cached: true,
        });
      }
    }

    const searchUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}&sort=price_asc`;
    let prices: {
      shopName: string;
      price: number;
      shippingFee: number;
      url: string;
      checkedAt: string;
    }[] = [];

    // Strategy 1: Use Naver API if keys are configured
    if (NAVER_CLIENT_ID && NAVER_CLIENT_SECRET) {
      const apiResponse = await fetch(
        `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=5&sort=asc`,
        {
          headers: {
            "X-Naver-Client-Id": NAVER_CLIENT_ID,
            "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
          },
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const items = data.items || [];
        prices = items.map(
          (item: {
            mallName?: string;
            lprice?: string;
            link?: string;
          }) => ({
            shopName: item.mallName || "네이버 쇼핑",
            price: parseInt(item.lprice || "0", 10),
            shippingFee: -1,
            url: item.link || searchUrl,
            checkedAt: new Date().toISOString(),
          })
        );
      }
    }

    // Strategy 2: Scrape Naver Shopping if API didn't return results
    if (prices.length === 0) {
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "ko-KR,ko;q=0.9",
        },
      });

      if (response.ok) {
        const html = await response.text();
        const nextDataMatch = html.match(
          /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
        );

        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const products =
              nextData?.props?.pageProps?.initialState?.products?.list || [];

            prices = products
              .slice(0, 5)
              .map(
                (item: {
                  item: {
                    productTitle?: string;
                    mallName?: string;
                    price?: string | number;
                    deliveryFee?: string | number;
                    crUrl?: string;
                    mallProductUrl?: string;
                  };
                }) => ({
                  shopName: item.item?.mallName || "쇼핑몰",
                  price: parseInt(String(item.item?.price || "0"), 10),
                  shippingFee: parseInt(
                    String(item.item?.deliveryFee || "0"),
                    10
                  ),
                  url:
                    item.item?.crUrl || item.item?.mallProductUrl || searchUrl,
                  checkedAt: new Date().toISOString(),
                })
              )
              .filter((p: { price: number }) => p.price > 0);
          } catch {
            // JSON parse failed
          }
        }

        // Fallback regex extraction
        if (prices.length === 0) {
          const priceMatches = [
            ...html.matchAll(/"price":"?(\d+)"?/g),
          ].slice(0, 5);
          const mallMatches = [
            ...html.matchAll(/"mallName":"([^"]+)"/g),
          ].slice(0, 5);

          prices = priceMatches
            .map((match, i) => ({
              shopName: mallMatches[i]?.[1] || `쇼핑몰 ${i + 1}`,
              price: parseInt(match[1], 10),
              shippingFee: -1,
              url: searchUrl,
              checkedAt: new Date().toISOString(),
            }))
            .filter((p) => p.price > 0);
        }
      }
    }

    if (prices.length === 0) {
      return fallbackResponse(query, searchUrl);
    }

    // Save prices to DB if productId provided
    if (productId && prices.length > 0) {
      // Delete old prices for this product
      await supabase.from("prices").delete().eq("productId", productId);

      // Insert new prices
      await supabase.from("prices").insert(
        prices.map((p) => ({
          productId,
          shopName: p.shopName.slice(0, 100),
          price: p.price,
          shippingFee: p.shippingFee,
          url: p.url.slice(0, 500),
          checkedAt: p.checkedAt,
        }))
      );
    }

    return NextResponse.json({ query, prices });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
