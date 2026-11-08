/**
 * Device tilt for the frozen PV's holographic effect.
 *
 * Android and most browsers send orientation events freely. iPhones only
 * send them after the visitor allows it, and the request has to come from
 * a tap. The ice intro asks on the tap that shatters the glass; the PV
 * itself asks if it is tapped. The PV is always listening, so once allowed
 * the tilt simply starts arriving.
 */

type PermissionRequester = { requestPermission?: () => Promise<"granted" | "denied"> };

export function motionNeedsPermission(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as PermissionRequester).requestPermission === "function"
  );
}

/** Call from inside a tap or key handler. Resolves true when tilt is available. */
export async function requestMotion(): Promise<boolean> {
  if (!motionNeedsPermission()) return true;
  try {
    const answer = await (DeviceOrientationEvent as unknown as PermissionRequester).requestPermission!();
    if (answer === "granted") return true;
  } catch {
    // Not from a gesture, or not allowed: the PV keeps its gentle idle sway.
  }
  return false;
}
