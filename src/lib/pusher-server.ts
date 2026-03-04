import SparkMD5 from "spark-md5";

async function sign(stringToSign: string, secret: string) {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(stringToSign)
    );

    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function triggerPusher(
    channel: string,
    event: string,
    payload: unknown
) {
    const appId = process.env.PUSHER_APP_ID!;
    const key = process.env.PUSHER_KEY!;
    const secret = process.env.PUSHER_SECRET!;
    const cluster = process.env.PUSHER_CLUSTER!;

    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
        name: event,
        channel,
        data: JSON.stringify(payload),
    });

    const bodyMd5 = SparkMD5.hash(body);

    const query =
        `auth_key=${key}` +
        `&auth_timestamp=${timestamp}` +
        `&auth_version=1.0` +
        `&body_md5=${bodyMd5}`;

    const stringToSign = `POST\n/apps/${appId}/events\n${query}`;

    const signature = await sign(stringToSign, secret);

    await fetch(
        `https://api-${cluster}.pusher.com/apps/${appId}/events?${query}&auth_signature=${signature}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body
        }
    );
}
