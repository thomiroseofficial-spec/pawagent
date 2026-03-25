import { NextRequest, NextResponse } from "next/server";

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

interface NaverShoppingItem {
  title: string;
  link: string;
  lprice: string;
  mallName: string;
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      // Fallback: return mock data if API keys not configured
      return NextResponse.json({
        query,
        prices: [
          {
            shopName: "네이버 쇼핑",
            price: 0,
            shippingFee: 0,
            url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`,
            checkedAt: new Date().toISOString(),
          },
        ],
        fallback: true,
        message: "NAVER_CLIENT_ID/SECRET not configured. Using fallback link.",
      });
    }

    const response = await fetch(
      `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=5&sort=asc`,
      {
        headers: {
          "X-Naver-Client-Id": NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Naver API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const items: NaverShoppingItem[] = data.items || [];

    const prices = items.map((item) => ({
      shopName: item.mallName || "네이버 쇼핑",
      price: parseInt(item.lprice, 10),
      shippingFee: 0,
      url: item.link,
      checkedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ query, prices });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
