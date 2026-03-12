console.log("👉 RUNNING FILE:", import.meta.url);

import "dotenv/config";
import express from "express";            //서버 프레임워크
import cors from "cors";                  //CORS 미들웨어
import {db} from "./firebase.js";         //DB 객체

import admin from "firebase-admin";       //카운터
import nodemailer from "nodemailer";
import aiRouter from "./ai.js";

const app = express();                //EXPRESS 인스턴스 생성 
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use("/api/ai", aiRouter);

//POST 초대장 저장 
app.post("/api/invitations", async (req, res) => {
  try {
    const invitationData = req.body;
    if (!invitationData || Object.keys(invitationData).length === 0) {
      return res.status(400).json({ success: false, message: "데이터가 비어있습니다." });
    }

    const docRef = await db.collection("invitations").add({
      ...invitationData,               
      createdAt: new Date(),
    });

    console.log("✔️ 초대장 저장 완료 ✔️", docRef.id);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ 초대장 저장 실패 POST /api/invitations error:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// GET 초대장 조회
app.get("/api/invitations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const snap = await db.collection("invitations").doc(id).get();
    
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "not found" });
    }
    
    res.json({ success: true, data: { id: snap.id, ...snap.data() } }); 
  } catch (err) {
    console.error("GET /api/invitations/:id error:", err);
    res.status(500).json({ success: false, message: "server error" });
  }
});

//POST 초대 메시지 저장 
app.post("/api/invitations/:id/messages", async (req, res) => {
try {
    const { id } = req.params;
    const { name = "", message = "" } = req.body || {};

    ////  Firestore에 메시지 저장
    const colRef = db.collection("invitations").doc(id).collection("messages");
    const docRef = await colRef.add({
      name: String(name).slice(0, 80),
      message: String(message).slice(0, 2000),
      createdAt: new Date(),
    });

    console.log("✔️메시지 저장:");

    ////shareId로 반환 
    res.json({
      success: true,
      invitationId: id,
      messageId: docRef.id,
      shareUrl: `/open.html?id=${encodeURIComponent(id)}&msg=${encodeURIComponent(docRef.id)}`
    })
  } catch (e) {
    console.error("❌ POST /api/invitations/:id/messages error:", e);
    res.status(500).json({ success: false, message: "server error" });
  }
});

// GET 초대 메시지 조회 
app.get("/api/invitations/:id/messages/:msgId", async (req, res) => {
  try {
    const { id, msgId } = req.params;
    const snap = await db.collection("invitations").doc(id)
    .collection("messages")
    .doc(msgId).
    get();

    if (!snap.exists) return res.json({ success: true, data: null });
  
    res.json({ success: true, data: { id: snap.id, invitationId: id, ...snap.data() } });
  } catch (e) {
    console.error("GET /api/invitations/:id/messages/:msgId error:", e);
    res.status(500).json({ success: false, message: "server error" });
  }
});

////  RSVP/설문 저장 
app.post("/api/invitations/:id/rsvp", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      rsvpName,
      rsvpEmail,
      wantsReminder,
      attendance,      
      surveyAnswers,  
      userAgent,
    } = req.body || {};

        // subcollection - invitations/{id}/rsvp-responses/{autoId}
    const col = db.collection("invitations").doc(id).collection("rsvp-responses");
    const docRef = await col.add({
      rsvpName,
      rsvpEmail,
      wantsReminder: !!wantsReminder,
      attendance,
      surveyAnswers: Array.isArray(surveyAnswers) ? surveyAnswers : [],
      createdAt: new Date(),
      userAgent: userAgent || null,
    });

    console.log("✔️ RSVP 저장" );
    res.json({ success: true, responseId: docRef.id });
  } catch (err) {
    console.error("❌ RSVP 저장 실패:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

//POST 초대응답 코멘트 저장
app.post("/api/invitations/:id/open-comments", async (req, res) => {
  try {
    const { id } = req.params; 
    const { comment = "" } = req.body || {}; 

    ////  Firestore에 메시지 저장
    const colRef = db.collection("invitations").doc(id).collection("open-comments");
    const docRef = await colRef.add({
      comment: String(comment).slice(0, 50),            
      isAnonymous: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), 
    });

    console.log("✔️ open-comment 저장");
    res.json({ success:true, invitationId:id, commentId: docRef.id });
  } catch (e) {
    console.error("❌ POST /api/invitations/:id/open-comments error:", e);
    res.status(500).json({ success:false, message:"server error" });
  }
});

//POST 초대응답 코멘트 조회
app.get("/api/invitations/:id/open-comments", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "id required" });

    const colRef = db.collection("invitations").doc(id).collection("open-comments");
    const snap = await colRef.get();

    const items = snap.docs.map(d => {
      const data = d.data() || {};
      return {
        id: d.id,
        comment: data.comment || "",
        isAnonymous: !!data.isAnonymous,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : null
      };
    });

    res.json({ success: true, items });
  } catch (err) {
    console.error("❌ open-comments list error:", err);
    res.status(500).json({ success: false, message: "server error" });
  }
});

// GET RSVP 차트 조회 
app.get("/api/invitations/:id/rsvp/stats", async (req, res) => {
  try {
    const { id } = req.params;
    const col = db.collection("invitations").doc(id).collection("rsvp-responses");
    const snap = await col.get();

    let yes = 0, no = 0;
    snap.forEach(doc => {
      const d = doc.data() || {};
      if (d.attendance === "yes") yes++;
      else if (d.attendance === "no") no++;
    });

    res.json({ success: true, stats: { yes, no } });
  } catch (e) {
    console.error("rsvp/stats error:", e);
    res.status(500).json({ success:false, message:"server error" });
  }
});

// GET  RSVP 리스트 조회
app.get("/api/invitations/:id/rsvp/list", async (req, res) => {
  try {
    const { id } = req.params;
    const col = db.collection("invitations").doc(id).collection("rsvp-responses");
    const snap = await col.orderBy("createdAt", "desc").get();

    const list = snap.docs.map(d => {
      const x = d.data() || {};
      // Firestore Timestamp 처리
      const ts = x.createdAt?.toDate ? x.createdAt.toDate().toISOString() : (x.createdAt || null);
      return {
        rsvpName: x.rsvpName || "",
        rsvpEmail: x.rsvpEmail || "",
        wantsReminder: !!x.wantsReminder,
        attendance: x.attendance || null,
        createdAt: ts,
        surveyAnswers: Array.isArray(x.surveyAnswers) ? x.surveyAnswers : []
      };
    });

    res.json({ success: true, list });

  } catch (e) {
    console.error("rsvp/list error:", e);
    res.status(500).json({ success:false, message:"server error" });
  }
});

//POST 이메일
app.post("/api/invitations/:id/reminder-email", async (req, res) => {
  try {
    const invitationId = req.params.id;
    const recipients = Array.isArray(req.body?.recipients) ? req.body.recipients : [];

    if (!invitationId) {
      return res.status(400).json({ success: false, error: "Missing invitationId" });
    }
    if (!recipients.length) {
      return res.status(400).json({ success: false, error: "No recipients" });
    }

    // 트랜스포터 구성 
    let transporter;
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, 
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
    } else if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: String(process.env.EMAIL_SECURE || "false") === "true",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
    } else {
      return res.status(500).json({ success: false, error: "Email transporter is not configured" });
    }

    const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5501";
    const PROJECT_NAME    = process.env.PROJECT_NAME || "InviGo";
    const FROM            = process.env.SMTP_FROM || process.env.EMAIL_USER;
    const openUrl         = `${FRONTEND_ORIGIN}/Nopen/Nopen.html?id=${encodeURIComponent(invitationId)}`;

    const results = [];
    for (const { email, name } of recipients) {
      const to = String(email || "").trim();
      const displayName = (name && String(name).trim()) || "초대받은 분";

      const isEmailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
      if (!isEmailLike) {
        results.push({ email: to, name: displayName, status: "fail", error: "잘못된 이메일 형식" });
        continue;
      }

      try {
        const info = await transporter.sendMail({
          from: FROM ? `"${PROJECT_NAME} 초대장" <${FROM}>` : `"${PROJECT_NAME} 초대장"`,
          to,
          subject: "초대장 리마인더 ✉️",
          html: `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333">
              <p><strong>${displayName}</strong>님, 초대 일정 잊지 않으셨죠?</p>
              <p>아래 링크에서 초대장을 확인하고 참석 여부를 알려주세요.</p>
              <p><a href="${openUrl}" target="_blank" rel="noreferrer noopener">${openUrl}</a></p>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
              <p style="font-size:12px;color:#777">${PROJECT_NAME} · 이 메일은 초대 리마인더로 발송되었습니다.</p>
            </div>
          `,
        });

        if (info && (info.accepted?.length || info.messageId)) {
          results.push({ email: to, name: displayName, status: "sent" });
        } else {
          results.push({ email: to, name: displayName, status: "fail", error: "SMTP 전송 실패" });
        }
      } catch (err) {
        results.push({ email: to, name: displayName, status: "fail", error: err?.message || "전송 실패" });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("📧 reminder-email error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

//  API 404 캐치
app.use("/api", (req, res) => {
  res.status(404).json({ success:false, message:"API route not found", url:req.originalUrl });
});

app.get("/", (_req, res) => res.send("InviGo server is running."));

app.listen(3000, () => {
  console.log("🚀Server running at http://localhost:3000 🚀");               
});
