import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, event_id, url, hashed_phone, product, quantity } = body;

    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    const pixelCode = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

    if (!accessToken || !pixelCode) {
      console.warn("TikTok Tracking config is missing on the server.");
      return NextResponse.json({ success: false, error: 'Config missing' }, { status: 500 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Basic TikTok cookie capturing from headers for Advanced Matching
    let ttp, ttclid;
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
      ttp = cookies['_ttp'];
      ttclid = cookies['ttclid'] || cookies['_ttclid'];
    }

    const userObj: Record<string, string> = {
      phone_number: hashed_phone,
    };
    if (ttp) userObj.ttp = ttp;
    if (ttclid) userObj.ttclid = ttclid;

    const payload = {
      pixel_code: pixelCode,
      event: event || 'Purchase',
      event_id: event_id,
      event_time: Math.floor(Date.now() / 1000),
      context: {
        user: userObj,
        page: { url: url || '' },
        ip: ip,
        user_agent: userAgent
      },
      properties: {
        contents: [
          {
            content_id: String(product.id),
            content_type: 'product',
            content_name: product.title,
            price: Number(product.price)
          }
        ],
        currency: 'MAD',
        value: Number(product.price) * Number(quantity)
      }
    };

    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json({ success: true, tiktokResponse: data });
  } catch (error: any) {
    console.error("TikTok Event API Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
