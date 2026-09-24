import "server-only";

/**
 * Klaviyo list subscription.
 *
 * Klaviyo has no "post an email to this URL" webhook. Subscribing needs a
 * specific endpoint, an API key in an Authorization header, a dated revision
 * header, and a JSON:API shaped body naming the list. None of that fits in a
 * plain URL, which is why CLUB_SIGNUP_WEBHOOK_URL alone cannot talk to it.
 *
 * Two values are needed, both from the Klaviyo dashboard:
 *   KLAVIYO_PRIVATE_API_KEY  starts with pk_, Settings > API keys
 *   KLAVIYO_LIST_ID          the short id in the list's URL, Audience > Lists
 *
 * The private key must stay server side. It is read only inside a server
 * action, so it is never sent to the browser.
 */

const ENDPOINT = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/";

/**
 * Klaviyo pins behaviour to a dated revision. Overridable so a future API
 * change can be adopted without a code edit.
 */
const DEFAULT_REVISION = "2025-07-15";

export type KlaviyoConfig = {
  apiKey: string;
  listId: string;
  revision: string;
};

export function getKlaviyoConfig(): KlaviyoConfig | null {
  // Trimmed, because a secret pasted into the dashboard easily picks up a
  // trailing space or newline, and Klaviyo then rejects the key or list id.
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  const listId = process.env.KLAVIYO_LIST_ID?.trim();
  if (!apiKey || !listId) return null;
  return {
    apiKey,
    listId,
    revision: process.env.KLAVIYO_REVISION?.trim() || DEFAULT_REVISION,
  };
}

export function isKlaviyoConfigured(): boolean {
  return getKlaviyoConfig() !== null;
}

/**
 * Subscribes one email to the configured list.
 *
 * If the list has double opt in enabled, Klaviyo sends the confirmation
 * message itself and the profile is not subscribed until they click it. That
 * is the honest default for a marketing list, so nothing here tries to bypass
 * it with historical_import.
 *
 * Throws on failure so the caller can tell the visitor something went wrong
 * rather than silently dropping the address.
 */
export async function subscribeToKlaviyo(
  email: string,
  source: string,
): Promise<void> {
  const config = getKlaviyoConfig();
  if (!config) throw new Error("Klaviyo is not configured");

  const body = {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        // Where the signup came from. It belongs here on the job, where
        // Klaviyo stores it on the consent record. It cannot go on the
        // profile: see below.
        custom_source: source,
        profiles: {
          data: [
            {
              // Only email and subscriptions here. This endpoint rejects the
              // whole request if a profile carries anything else, custom
              // properties included.
              type: "profile",
              attributes: {
                email,
                subscriptions: {
                  email: { marketing: { consent: "SUBSCRIBED" } },
                },
              },
            },
          ],
        },
      },
      relationships: {
        list: { data: { type: "list", id: config.listId } },
      },
    },
  };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${config.apiKey}`,
      accept: "application/vnd.api+json",
      "content-type": "application/vnd.api+json",
      revision: config.revision,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  // Success is 202 Accepted: the job is queued, not completed inline.
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Klaviyo responded ${response.status}. ${detail.slice(0, 300)}`,
    );
  }
}
