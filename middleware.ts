import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export const middleware = async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    const session = await auth();

    if (!session && pathname !== "/sign-in") {
        const newUrl = new URL("/sign-in", req.nextUrl.origin);
        return NextResponse.redirect(newUrl);
    }

    if (session && pathname === "/sign-in") {
        const newUrl = new URL("/", req.nextUrl.origin);
        return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)"],
    runtime: "nodejs",
};