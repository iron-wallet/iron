export function truncateHex(address: string): string {
	return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const isProd = process.env.NODE_ENV == "production";
