import "server-only";

const DEFAULT_API_VERSION = "2026-04";

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

function normalizeDomain(raw: string): string {
  return raw.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

type StorefrontConfig = {
  endpoint: string;
  token: string;
};

/**
 * Reads the two env vars the site needs. Returns null when either is missing
 * so the storefront can render its pre-live placeholder state instead of
 * crashing. See SETUP.md for where these values come from.
 */
export function getStorefrontConfig(): StorefrontConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;

  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || DEFAULT_API_VERSION;
  return {
    endpoint: `https://${normalizeDomain(domain)}/api/${version}/graphql.json`,
    token,
  };
}

export function isStorefrontConfigured(): boolean {
  return getStorefrontConfig() !== null;
}

type StorefrontRequest = {
  query: string;
  variables?: Record<string, unknown>;
  /** Seconds to cache the response. Use 0 for cart calls. */
  revalidate?: number;
  tags?: string[];
};

/**
 * Single entry point to the Storefront API. Public token only, always
 * server side, never an Admin token. Prices and availability are requested
 * in a US context because we ship to the United States only at launch.
 */
export async function storefront<T>({
  query,
  variables,
  revalidate = 300,
  tags,
}: StorefrontRequest): Promise<T> {
  const config = getStorefrontConfig();
  if (!config) {
    throw new ShopifyError(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Storefront-Access-Token": config.token,
      },
      body: JSON.stringify({ query, variables }),
      next: revalidate === 0 ? { revalidate: 0 } : { revalidate, tags },
      cache: revalidate === 0 ? "no-store" : undefined,
    });
  } catch (cause) {
    throw new ShopifyError("Could not reach the Shopify Storefront API.", cause);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ShopifyError(
      `Storefront API responded ${response.status}.`,
      body.slice(0, 500),
    );
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new ShopifyError(
      payload.errors.map((e) => e.message).join(" "),
      payload.errors,
    );
  }

  if (!payload.data) {
    throw new ShopifyError("Storefront API returned no data.");
  }

  return payload.data;
}
