import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { admin } from "./firebase.js";

const router = express.Router();
const bucket = admin.storage().bucket();

// OpenAI 클라이언트
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 모델 설정 
const IMAGE_MODEL = process.env.IMAGE_MODEL || "gpt-image-1"; 


router.post("/generate-and-upload-image", async (req, res) => {
  try {
    const { prompt, size = "1024x1024" } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ success: false, error: "prompt가 필요합니다." });
    }

    // 1 이미지 생성
    const aiRes = await openai.images.generate({
      model: IMAGE_MODEL,   
      prompt,
      n: 1,
      size,                 
    });

    // 2 이미지 데이터 추출 
    let imgBuffer = null;

    //// b64_json 케이스 (gpt-image-1)
    const b64 = aiRes?.data?.[0]?.b64_json;
    if (b64) {
      imgBuffer = Buffer.from(b64, "base64");
    }

    //// URL 케이스 (dall-e-3)
    if (!imgBuffer) {
      const imageUrl = aiRes?.data?.[0]?.url;
      if (!imageUrl) {
        return res.status(500).json({ success: false, error: "이미지 데이터가 없습니다." });
      }
      const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      imgBuffer = Buffer.from(imageRes.data, "binary");
    }

    // 3. Firebase Storage 업로드
    const filename = `backgrounds/${Date.now()}-${uuidv4()}.png`;
    const file = bucket.file(filename);
    const token = uuidv4();

    await file.save(imgBuffer, {
      metadata: {
        contentType: "image/png",
        metadata: { firebaseStorageDownloadTokens: token },
      },
      public: true, 
    });

    const downloadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
      `${encodeURIComponent(filename)}?alt=media&token=${token}`;

    return res.json({ success: true, url: downloadUrl });
  } catch (err) {
    console.error("🔥 AI 이미지 생성/업로드 실패:", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, error: "AI 이미지 생성 실패" });
  }
});

export default router;
