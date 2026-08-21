import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// =========================================================
// ENV VARS REQUIRED (set these in Vercel → Project → Settings → Environment Variables)
//   GOOGLE_SERVICE_ACCOUNT_EMAIL   -> "client_email" from your service account JSON key
//   GOOGLE_PRIVATE_KEY             -> "private_key" from the same JSON key (keep the \n's)
//   GOOGLE_SHEET_ID                -> the id in your sheet's URL: /d/<THIS>/edit
//   LEAD_FORM_ALLOWED_ORIGIN       -> e.g. https://feedmasterph.com (restricts who can call this)
// =========================================================

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_APPEND_RANGE = 'Sheet1!A:D'; // Timestamp, Name, Email, Source
const SHEET_EMAIL_COLUMN_RANGE = 'Sheet1!C2:C';
const ALLOWED_ORIGIN = process.env.LEAD_FORM_ALLOWED_ORIGIN || '*';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// ---------------------------------------------------------
// Minimal in-memory rate limit (per server instance).
// Good enough to stop casual abuse. For real protection at
// scale, swap this for Upstash Redis or Vercel's Edge Config.
// ---------------------------------------------------------
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again in a minute.' },
      { status: 429, headers }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400, headers });
  }

  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim().toLowerCase();
  const source = (body.source || 'website').toString().trim();
  const honeypot = (body.companyWebsite || '').toString().trim();

  // bot caught the honeypot field — pretend success, don't tip them off
  if (honeypot) {
    return NextResponse.json({ ok: true, duplicate: false }, { headers });
  }

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid name' }, { status: 400, headers });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ ok: false, error: 'Invalid email address' }, { status: 400, headers });
  }

  try {
    const sheets = getSheetsClient();

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_EMAIL_COLUMN_RANGE,
    });
    const existingEmails = (existing.data.values || [])
      .flat()
      .map((e) => String(e).trim().toLowerCase());
    const isDuplicate = existingEmails.includes(email);

    if (!isDuplicate) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: SHEET_APPEND_RANGE,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[new Date().toISOString(), name, email, source]],
        },
      });
    }

    return NextResponse.json({ ok: true, duplicate: isDuplicate }, { headers });
  } catch (err) {
    console.error('Sheets append error:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error. Please try again shortly.' },
      { status: 500, headers }
    );
  }
}
