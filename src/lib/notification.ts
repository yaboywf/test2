import { NotificationSchema } from "@/schemas/notification.schema";

type GoogleTokenResponse = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

async function getAccessToken() {
    const now = Math.floor(Date.now() / 1000);

    const header = {
        alg: "RS256",
        typ: "JWT",
    };

    const payload = {
        iss: process.env.FIREBASE_CLIENT_EMAIL!,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
    };

    function base64url(input: string) {
        return btoa(input)
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    }

    const encoder = new TextEncoder();

    const unsignedJWT =
        base64url(JSON.stringify(header)) +
        "." +
        base64url(JSON.stringify(payload));

    const keyData = process.env.FIREBASE_PRIVATE_KEY!
        .replace(/\\n/g, "\n");

    const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        str2ab(keyData),
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        encoder.encode(unsignedJWT)
    );

    const signedJWT =
        unsignedJWT +
        "." +
        base64urlBytes(new Uint8Array(signature));

    const tokenRes = await fetch(
        "https://oauth2.googleapis.com/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: signedJWT,
            }),
        }
    );

    const tokenJson = await tokenRes.json() as GoogleTokenResponse;

    return tokenJson.access_token;
}

function base64urlBytes(bytes: Uint8Array) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function str2ab(pem: string) {
    const binary = atob(
        pem
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace(/\n/g, "")
    );
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return buffer;
}

export async function sendNotification(token: string, title: string, body: string) {
    const validation = NotificationSchema.safeParse({ token, title, body });
    if (!validation.success) return { success: false, message: validation.error.message };

    const accessToken = await getAccessToken();
    const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/bb21-portal/messages:send`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: {
                    token,
                    data: {
                        title,
                        body,
                        image: "https://bb21coy-v3.dylanyeowf.workers.dev/bb-banner-2.webp",
                        icon: "https://bb21coy-v3.dylanyeowf.workers.dev/bb-crest-192.png",
                        badge: "https://bb21coy-v3.dylanyeowf.workers.dev/bb-crest-72.png"
                    }
                }
            })
        }
    );

    if (!res.ok) return console.error(await res.json());
    return;
}