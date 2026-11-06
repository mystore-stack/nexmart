/**
 * NexMart Biometric Authentication Service
 * Uses WebAuthn / Android Platform Authenticator (Fingerprint, Face Unlock)
 * Phase 4 — Android Native Features
 */

export interface BiometricStatus {
  available: boolean;
  type?: "fingerprint" | "face" | "platform";
  enrolled: boolean;
}

const STORAGE_KEY = "nexmart_biometric_enrolled";

export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isBiometricEnrolled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export async function enrollBiometrics(userId: string, userName: string): Promise<boolean> {
  const available = await isBiometricsAvailable();
  if (!available) return false;

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: "NexMart Super App",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Enforces device biometric
          userVerification: "required",
        },
        timeout: 60000,
      },
    });

    if (credential) {
      localStorage.setItem(STORAGE_KEY, "true");
      return true;
    }
  } catch (err: any) {
    console.debug("[Biometrics] Enrollment cancelled or failed:", err);
  }

  return false;
}

export async function verifyBiometrics(): Promise<boolean> {
  const available = await isBiometricsAvailable();
  if (!available) return false;

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
      },
    });

    return !!credential;
  } catch (err: any) {
    console.debug("[Biometrics] Verification cancelled or failed:", err);
    return false;
  }
}

export function disableBiometrics(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
