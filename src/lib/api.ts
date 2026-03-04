type Methods = "get" | "post" | "put" | "delete";

export async function api<T>(
	method: Methods = "post",
	url: string,
	body: Record<string, unknown> = {},
): Promise<T> {
	const options: RequestInit = {
		method: method.toUpperCase(),
		headers: {
			"Content-Type": "application/json",
		},
	}

	if (body && method != "get") options.body = JSON.stringify(body)

	const res = await fetch(url, options);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || "Request failed");
	}

	return (await res.json()) as T;
}