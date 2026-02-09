import { NextResponse } from 'next/server';

const REQUIRED_FIELDS = ['name', 'phone', 'side', 'attendance', 'guests'];

export async function POST(request) {
  const scriptUrl = process.env.APPS_SCRIPT_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { ok: false, message: 'APPS_SCRIPT_URL 환경변수가 필요합니다.' },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ ok: false, message: '요청 본문이 올바르지 않습니다.' }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body?.[field]) {
      return NextResponse.json(
        { ok: false, message: `${field} 값이 필요합니다.` },
        { status: 400 },
      );
    }
  }

  const guests = Number(body.guests);
  if (!Number.isFinite(guests) || guests < 1 || guests > 20) {
    return NextResponse.json(
      { ok: false, message: '예상 인원은 1~20 사이여야 합니다.' },
      { status: 400 },
    );
  }

  const payload = new URLSearchParams({
    name: String(body.name ?? ''),
    phone: String(body.phone ?? ''),
    side: String(body.side ?? ''),
    attendance: String(body.attendance ?? ''),
    guests: String(body.guests ?? ''),
    message: String(body.message ?? ''),
  });

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, message: 'RSVP 전송 실패' },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: 'RSVP 전송 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
