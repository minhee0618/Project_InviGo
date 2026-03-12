
//대시보드
document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  const dashboardBtn = document.querySelector(".dashboard-btn");

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      window.open(`/Ndashboard/Ndashboard.html?id=${encodeURIComponent(id)}`, "_blank");
    });
  }
});

// 초대장 로드
document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");

  try {
    const API_BASE = "http://127.0.0.1:3000";
    const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(id)}`);

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText} – ${txt.slice(0, 120)}`);
    }

    const json = await res.json();
    if (!json?.success) throw new Error("not found");

    const inv = json.data || {};

    // 1) 이미지 표시
    const img = document.getElementById("preview-image");
    const src = inv.imageUrl || inv.imageDataUrl || "";
    if (img) {
      if (src) {
        img.src = src;
        img.alt = inv.name || inv.title || "invitation";
      } else {
        img.removeAttribute("src");
        img.alt = "이미지가 없습니다.";
      }
    }

    // 2) 응답설정 표시 
    const subContainer  = document.querySelector(".sub-container");
    const surveySection = document.querySelector(".survey-section");
    const surveyTitleEls = surveySection ? surveySection.querySelectorAll("h3") : [];
    const surveyWrap    = document.getElementById("surveys");

    const enabled = !!inv.rsvp?.enabled;
    const surveys = Array.isArray(inv.rsvp?.surveys) ? inv.rsvp.surveys : [];
    const hasSurveys = surveys.length > 0;

            //항상 숨김
    subContainer?.classList.add("hidden");
    surveySection?.classList.add("hidden");
    surveyTitleEls.forEach(h => h.classList.add("hidden"));
    if (surveyWrap) surveyWrap.innerHTML = "";

            // sub-container - enabled 
    if (enabled) {
      subContainer?.classList.remove("hidden");
    }

            // 설문 응답 -  enabled && hasSurveys 일 때만
    if (enabled && hasSurveys) {
      surveySection?.classList.remove("hidden");
      surveyTitleEls.forEach(h => h.classList.remove("hidden"));

      surveyWrap.innerHTML = surveys.map((s, idx) => {
        const options = Array.isArray(s.options) && s.options.length
          ? s.options
          : [s.option1, s.option2, s.option3, s.option4, s.option5].filter(Boolean);

        return `
          <div class="survey-item">
            <div class="survey-q">Q${idx + 1}. ${s.question ?? ""}</div>
            <div class="survey-o">
              ${options.map(opt => `
                <label>
                  <input type="radio" name="q${idx}" value="${String(opt).replace(/"/g,'&quot;')}">
                  ${opt}
                </label>
              `).join("")}
            </div>
          </div>
        `;
      }).join("");
    }
  } catch (e) {
    console.error("초대장 불러오기 실패:", e);
    alert("❌초대장을 불러오지 못했습니다❌");
  }
});

//message-card
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:3000";
  const id = new URLSearchParams(location.search).get("id");

  const nameEl = document.getElementById("shareName");
  const msgEl  = document.getElementById("shareComment");
  const btn    = document.getElementById("shareMessageBtn");

  async function sendMessage() {
    const name = (nameEl?.value || "").trim();
    const message = (msgEl?.value || "").trim();

    btn && (btn.disabled = true);
    try {
      const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(id)}/messages`, {   
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText}\n${t}`);
      }
      const j = await res.json();

      if (!j?.success || !j?.messageId) throw new Error("save failed");
      // const finalUrl =
      //   (j.shareUrl ? `${location.origin}${j.shareUrl}` : `${location.origin}/open.html?id=${encodeURIComponent(j.invitationId)}&msg=${encodeURIComponent(j.messageId)}`);

      const shareUrl = `${location.origin}/open.html?share=${encodeURIComponent(j.shareId)}`;
      alert(`✔️메시지 저장 완료 ✔️ \n공유 링크: ${shareUrl}`);
      msgEl && (msgEl.value = "");
    } 
    catch (e) {
      console.error("sendMessage error:", e);
      alert("❌ 메시지 저장 실패. 잠시 후 다시 시도해 주세요.");
    } 
    finally {
      btn && (btn.disabled = false);
    }
  }

  btn?.addEventListener("click", sendMessage);
});

//share
document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");

  function getOpenUrlById(id) {
    return `${location.origin}/Nopen/Nopen.html?id=${encodeURIComponent(id)}`;
  }

  const openUrl = getOpenUrlById(id);
  window.openUrl = openUrl;

  //  LINK
  const linkBtn = document.getElementById("linkBtn");
  const linkPopup = document.getElementById("linkPopup");
  const linkPopupClose = document.getElementById("linkPopupClose");
  const linkInput = document.getElementById("link-link");
  const linkCopyBtn = document.getElementById("linkCopyBtn");

  linkBtn?.addEventListener("click", () => {
    linkPopup?.classList.remove("hidden");
    if (linkInput) linkInput.value = openUrl;
  });
  linkPopupClose?.addEventListener("click", () => {
    linkPopup?.classList.add("hidden")
  });

  async function copyTextToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } 
    } catch {
      return false;
    }
  }

  linkCopyBtn?.addEventListener("click", async () => {
    const ok = await copyTextToClipboard(openUrl);
    if (ok) {
      alert("✔️ 초대장 링크가  클립보드에 복사되었습니다 ✔️");
    } else {
      alert("⚠️ 링크 복사에 실패했어요 ⚠️");
    }
  });

  // QR 
  const qrBtn = document.getElementById("qrBtn");
  const qrPopup = document.getElementById("qrPopup");
  const qrPopupClose = document.getElementById("qrPopupClose");
  const qrLinkInput = document.getElementById("qr-link");
  const qrImageWrap = document.getElementById("qrImage");
  const qrCopyBtn = document.getElementById("qrCopyBtn");

  qrBtn?.addEventListener("click", () => {
    qrPopup?.classList.remove("hidden");
    if (qrLinkInput) qrLinkInput.value = openUrl;
    if (qrImageWrap) renderQrImage(qrImageWrap, openUrl);
  });
  qrPopupClose?.addEventListener("click", () => {
    qrPopup?.classList.add("hidden")
  });

  function renderQrImage(container, url) {
    container.innerHTML = "";
    const img = new Image();
    img.alt = "QR Code";
    img.crossOrigin = "anonymous";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
    container.appendChild(img);
  }

  async function copyQrImageFrom(container) {
    const img = container.querySelector("img");
    if (!img) throw new Error("QR 이미지가 아직 준비되지 않았어요.");

    const resp = await fetch(img.src, { mode: "cors" });
    const blob = await resp.blob();
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
  }

  qrCopyBtn?.addEventListener("click", async () => {
    try {
      await copyQrImageFrom(qrImageWrap);
      alert("✔️ QR 이미지가 클립보드에 복사되었습니다 ✔️");
    } catch (err) {
      const ok = await copyTextToClipboard(openUrl);
      if (ok) {alert("⚠️ QR 복사에 실패했어요 ⚠️ 링크를 대신 복사했어요! ");} 
    }
  });


  // KAKAO 
  const kakoBtn = document.getElementById("kakoBtn");
  const kakaoPopup = document.getElementById("kakaoPopup");
  const kakaoPopupClose = document.getElementById("kakaoPopupClose");
  kakoBtn?.addEventListener("click", () => kakaoPopup?.classList.remove("hidden"));
  kakaoPopupClose?.addEventListener("click", () => kakaoPopup?.classList.add("hidden"));

  // FACEBOOK
  const facebookBtn = document.getElementById("facebookBtn");
  const facebookPopup = document.getElementById("facebookPopup");
  const facebookPopupClose = document.getElementById("facebookPopupClose");
  facebookBtn?.addEventListener("click", () => facebookPopup?.classList.remove("hidden"));
  facebookPopupClose?.addEventListener("click", () => facebookPopup?.classList.add("hidden"));
});