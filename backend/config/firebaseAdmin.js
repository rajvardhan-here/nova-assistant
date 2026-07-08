import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production (Render) — from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local development — from file
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  serviceAccount = JSON.parse(
    readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8")
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAuth();

export default adminAuth;