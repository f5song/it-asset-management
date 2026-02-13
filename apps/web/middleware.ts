// apps/web/src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // proxy เฉพาะ /api/exceptions/*
  if (req.nextUrl.pathname.startsWith('/api/exceptions')) {
    const apiUrl = new URL(
      req.nextUrl.pathname.replace('/api', '' /* drop /api */) + req.nextUrl.search,
      'http://localhost:8000'
    );
    // /api/exceptions/... → http://localhost:8000/exceptions/...
    return NextResponse.rewrite(apiUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/exceptions/:path*'],
};