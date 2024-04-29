import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("hello", request.url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
