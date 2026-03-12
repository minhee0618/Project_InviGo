
import admin from "firebase-admin";
import { readFileSync } from "fs";

// 서비스 계정 키 로드
const serviceAccount = JSON.parse(
  readFileSync("./server/firebase-key.json", "utf-8")
);

// Firebase Admin 초기화 
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://nprojectnew.firebasestorage.app",
  });
}

// Firestore 핸들
const db = admin.firestore();

export { admin, db };