// src/lib/auth.js
// Client-side Google login helper (Firebase).
// Server auth (JWT + cookies) is implemented in `src/lib/auth.ts`.

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();

export async function loginWithGoogle(firebaseAuth) {
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user;
}


