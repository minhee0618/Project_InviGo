
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
    
    //구글캘린더
    const calBtn = document.getElementById("GoogleCalendarBtn");
    if (calBtn) {

      const title = `InviGo Invitation - ${inv.name || inv.title}`;
      const locationText = inv.address || "";
      const detailsLines = [
          "InviGo에서 생성된 초대장입니다.",
          inv.date && inv.time
            ? `일시: ${inv.date} ${inv.time}`
            : inv.date
            ? `일자: ${inv.date}`
            : "",
          inv.telephone ? `tel: ${inv.telephone}` : "",
          inv.email ? `email: ${inv.email}` : "",
          "",
          `InviGo링크: ${window.location.href}`
      ].filter(Boolean);
      const details = detailsLines.join("\n");

      // 시간 포맷 유틸
      const pad = n => String(n).padStart(2, "0");
      const toYmd = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
      const toGoogleUtc = d =>
        new Date(d.getTime() - d.getTimezoneOffset()*60000)
          .toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      // timed /all-day 
      let startTimed = null, endTimed = null, allDayRange = null;
      if (inv?.date) {
        const [y,m,d] = String(inv.date).split("-").map(v => parseInt(v,10));
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          if (inv?.time) {
            const [hh,mm] = String(inv.time).split(":").map(v => parseInt(v,10));
            if (!isNaN(hh) && !isNaN(mm)) {
              const s = new Date(y, m-1, d, hh, mm, 0);
              const e = new Date(s.getTime() + 60*60*1000); // +1시간
              startTimed = toGoogleUtc(s);
              endTimed   = toGoogleUtc(e);
            }
          }
          if (!startTimed || !endTimed) {
            const s = new Date(y, m-1, d);
            const e = new Date(s.getTime() + 24*60*60*1000); 
            allDayRange = `${toYmd(s)}/${toYmd(e)}`;
          }
        }
      }

      const datesParam = (startTimed && endTimed)
        ? `${startTimed}/${endTimed}`           // timed event
        : (allDayRange || (() => {              // all-day or fallback(오늘)
            const t = new Date(), n = new Date(t.getTime()+86400000);
            return `${toYmd(t)}/${toYmd(n)}`;
          })());

      const gcalUrl =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(title)}` +
        `&dates=${encodeURIComponent(datesParam)}` +
        `&details=${encodeURIComponent(details)}` +
        (locationText ? `&location=${encodeURIComponent(locationText)}` : "") +
        `&sf=true&output=xml`;

      calBtn.addEventListener("click", () => {
        window.open(gcalUrl, "_blank", "noopener,noreferrer");
      });
    }

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

      if (surveyWrap) {
        surveyWrap.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
          const group = radio.name;
          surveyWrap.querySelectorAll(`input[name="${group}"]`)
          .forEach(x => x.closest('label')?.classList.remove('selected'));
          radio.closest('label')?.classList.add('selected');
        });
      });
      }
    }

    // 3) 응답설정 저장
    (function attachRsvpSave() {
    const nameEl = document.getElementById("rsvpName");       
    const emailEl = document.getElementById("rsvpEmail");     
    const remEl   = document.getElementById("rsvpReminder"); 
    const finalBtn = document.getElementById("finalSubmitBtn");

          // 참석/불참
    let attendance = null;                                     
    const choiceBtns = document.querySelectorAll(".rsvp-choice");
    choiceBtns.forEach(btn => {                               
      btn.addEventListener("click", () => {
        choiceBtns.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        attendance = btn.dataset.choice === "yes" ? "yes" : "no";
      });
    });


    function collectSurvey() {                              
      const answers = [];
      if (!surveyWrap) return answers;
      const items = surveyWrap.querySelectorAll(".survey-item");
      items.forEach((item, idx) => {
        const q = item.querySelector(".survey-q")?.textContent?.trim() || "";
        const checked = item.querySelector(`input[name="q${idx}"]:checked`);
        const answer = checked ? checked.value : null;
        answers.push({ index: idx, question: q, answer });
      });
      return answers;
    }

    finalBtn?.addEventListener("click", async () => {        
      try {
        const rsvpName = (nameEl?.value || "").trim();
        const rsvpEmail = (emailEl?.value || "").trim();
        const wantsReminder = !!remEl?.checked;
        const surveyAnswers = collectSurvey();

        const payload = {
          rsvpName,
          rsvpEmail,
          wantsReminder,
          attendance,          
          surveyAnswers,      
          userAgent: navigator.userAgent
        };

        finalBtn.disabled = true;
        
        const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(id)}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        finalBtn.disabled = false;

        if (!res.ok) {
          const t = await res.text();
          throw new Error(`HTTP ${res.status} ${res.statusText}\n${t}`);
        }
        const j = await res.json();
        if (!j?.success) throw new Error("save failed");

        alert("✔️ 참석/설문 응답이 저장되었습니다 ✔️");

      } catch (err) {
          console.error("RSVP 저장 실패:", err);
          alert("❌ 저장에 실패했습니다 ❌ 잠시 후 다시 시도해 주세요.");
          finalBtn.disabled = false;
        }
      });
    })();

  } catch (e) {
    console.error("초대장 불러오기 실패:", e);
    alert("❌초대장을 불러오지 못했습니다❌");
  }

  //open-comment
  (() => {
  const API_BASE = "http://127.0.0.1:3000";
  const params = new URLSearchParams(location.search);
  const invitationId = params.get("id");

  const ta  = document.getElementById("open-comment");
  const btn = document.getElementById("open-comment-btn");

  async function saveOpenComment() {
    const comment = (ta?.value || "").trim();

    btn && (btn.disabled = true);
    try {
      const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(invitationId)}/open-comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText}\n${t}`);
      }

      const j = await res.json();
      if (!j?.success || !j?.commentId) throw new Error("save failed");

      alert("✔️ 코멘트가 저장되었습니다 ✔️");
      if (ta) ta.value = "";
    } catch (e) {
      console.error("open-comment save error:", e);
      alert("❌ 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  btn?.addEventListener("click", saveOpenComment);
  })();
});
