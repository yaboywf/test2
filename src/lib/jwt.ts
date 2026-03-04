import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ServerSession } from "@/types/accounts";

type JWTPayload = {
    uid: string;
    iat: number;
    exp: number;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function decodeJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as JWTPayload;
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return null;
    }
}

export async function getServerSession(): Promise<ServerSession | null> {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as ServerSession;
    } catch (error) {
        console.error("JWT Verification Error (getServerSession):", error);
        return null;
    }
}