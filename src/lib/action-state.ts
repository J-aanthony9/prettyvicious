/**
 * Shared shape for form action results. Kept out of actions.ts because a
 * "use server" module may only export async functions.
 */
export type ActionState = {
  ok: boolean;
  message: string;
};

export const EMPTY_ACTION_STATE: ActionState = { ok: false, message: "" };
