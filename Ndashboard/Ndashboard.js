(() => {
  const API_BASE = "http://127.0.0.1:3000";
  const params = new URLSearchParams(location.search);
  const invitationId = params.get("id");

  const openLinkEl = document.getElementById("openLink");
  const summaryEl  = document.getElementById("summary");
  const tbodyEl    = document.getElementById("rsvp-body");
  const chartEl    = document.getElementById("rsvpChart");

  const getOpenUrlById = id =>
    `${location.origin}/Nopen/Nopen.html?id=${encodeURIComponent(id)}`;

  const esc = s => s == null ? "" : String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  const fmt = ts => {
    if (!ts) return "";
    const d = new Date(ts);
    return isNaN(d) ? String(ts) : d.toLocaleString();
  };

  const isTrue = v => v === true || v === "true" || v === 1 || v === "1";

  // -----------------------
  // 초대장 링크
  if (invitationId && openLinkEl) {
    const url = getOpenUrlById(invitationId);
    openLinkEl.href = url;
    openLinkEl.textContent = invitationId;
  }

  // -----------------------
  // RSVP 통계 차트
  async function loadChart() {
    try {
      const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(invitationId)}/rsvp/stats`);
      if (!res.ok) throw new Error(`${res.status}`);
      const j = await res.json();
      const yes = j?.stats?.yes ?? 0;
      const no  = j?.stats?.no  ?? 0;
      if (summaryEl) summaryEl.textContent = `참석: ${yes}명 | 불참: ${no}명`;

      if (chartEl) {
        new Chart(chartEl, {
          type: "pie",
          data: {
            labels: ["참석", "불참"],
            datasets: [{
              data: [yes, no],
              backgroundColor: ["#B3AFC3", "#222"]
            }]
          }
        });
      }
    } catch {
      if (summaryEl) summaryEl.textContent = "❌ 통계를 불러오지 못했습니다";
    }
  }

  // -----------------------
  // RSVP 목록
  let rsvpList = [];
  let currentAttendFilter = "all";
  let currentReminderFilter = "all";

  async function loadList() {
    try {
      const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(invitationId)}/rsvp/list`);
      if (!res.ok) throw new Error(`${res.status}`);
      const j = await res.json();
      rsvpList = Array.isArray(j?.list) ? j.list : [];
      applyFilters();
    } catch (e) {
      if (tbodyEl)
        tbodyEl.innerHTML = `<tr><td colspan="5">❌ 목록을 불러오지 못했습니다</td></tr>`;
    }
  }

  function renderRows(rows) {
    if (!tbodyEl) return;
    if (!rows.length) {
      tbodyEl.innerHTML = `<tr><td colspan="5">데이터가 없습니다</td></tr>`;
      return;
    }
    tbodyEl.innerHTML = "";
    rows.forEach(x => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${esc(x.rsvpName)}</td>
        <td>${x.attendance === "yes" ? "⭕" : x.attendance === "no" ? "❌" : "-"}</td>
        <td>${isTrue(x.wantsReminder) ? "✔️" : "-"}</td>
        <td>${esc(x.rsvpEmail)}</td>
        <td>${esc(fmt(x.createdAt))}</td>
      `;
      tbodyEl.appendChild(tr);
    });
  }

  function applyFilters() {
    let rows = rsvpList.slice();
    if (currentAttendFilter !== "all") {
      rows = rows.filter(x => (x.attendance ?? null) === currentAttendFilter);
    }
    if (currentReminderFilter === "yes") {
      rows = rows.filter(x => isTrue(x.wantsReminder));
    } else if (currentReminderFilter === "no") {
      rows = rows.filter(x => !isTrue(x.wantsReminder));
    }
    renderRows(rows);
  }

  const attendFilterToggle   = document.getElementById("attendFilterToggle");
  const attendFilterOptions  = document.getElementById("attendFilterOptions");
  const reminderFilterToggle = document.getElementById("reminderFilterToggle");
  const reminderFilterOptions= document.getElementById("reminderFilterOptions");

  attendFilterToggle?.addEventListener("click", () => {
    attendFilterOptions?.classList.toggle("hidden");
  });
  reminderFilterToggle?.addEventListener("click", () => {
    reminderFilterOptions?.classList.toggle("hidden");
  });

  attendFilterOptions?.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-value]");
    if (!li) return;
    currentAttendFilter = li.dataset.value;
    attendFilterOptions?.classList.add("hidden");
    applyFilters();
  });
  reminderFilterOptions?.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-value]");
    if (!li) return;
    currentReminderFilter = li.dataset.value;
    reminderFilterOptions?.classList.add("hidden");
    applyFilters();
  });

  // -----------------------
  // 설문 정의 가져오기
  async function fetchSurveyDefs() {
    try {
      const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(invitationId)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const j = await res.json();
      const surveys = j?.data?.rsvp?.surveys;
      return Array.isArray(surveys) ? surveys : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  // -----------------------
  // 통계 계산
  function makeSurveyStatsFromList(surveys, rsvpList) {
    const stats = {};
    const safeSurveys = Array.isArray(surveys) ? surveys : [];

    // 질문별 초기화
    safeSurveys.forEach(s => {
      const q = s.question?.trim() || "";
      const opts = Array.isArray(s.options) ? s.options : [];
      stats[q] = Object.fromEntries([...opts, "무응답"].map(o => [o, 0]));
    });

    rsvpList.forEach(item => {
      const answers = Array.isArray(item.surveyAnswers) ? item.surveyAnswers : [];
      safeSurveys.forEach((s, idx) => {
        const q = s.question?.trim() || "";
        const opts = Array.isArray(s.options) ? s.options : [];

        const found =
          answers.find(a =>
            (a.question && a.question.replace(/Q\d+\.?\s*/,"").trim() === q) ||
            (typeof a.index === "number" && a.index === idx)
          ) || {};

        let label = found.answer || opts[found.index] || "무응답";
        if (!opts.includes(label)) label = "무응답";
        stats[q][label] = (stats[q][label] || 0) + 1;
      });
    });

    return stats;
  }

  // -----------------------
  // 설문 그래프 렌더링
  function renderSurveyBarsSimple(surveys, surveyStats, totalCount) {
    const container = document.querySelector("#surveyCharts, #surveyChart");
    if (!container) return;
    container.innerHTML = "";

    const total = Math.max(1, totalCount || 1);

    surveys.forEach((s, i) => {
      const q = s.question?.trim() || `Q${i + 1}`;
      const opts = Array.isArray(s.options) ? s.options : [];
      const block = document.createElement("div");
      block.className = "survey-block";

      let html = `<h4>Q${i + 1}. ${esc(q)}</h4><div class="survey-bars">`;
      [...opts, "무응답"].forEach(opt => {
        const count = surveyStats[q]?.[opt] ?? 0;
        const percent = ((count / total) * 100).toFixed(1);
        html += `
          <div class="bar-row">
            <span class="bar-label">${esc(opt)}</span>
            <div class="bar-track">
              <div class="bar-fill"
                style="width:${percent}%;${opt==="무응답"?'background-color:#999;':''}">
              </div>
            </div>
            <span class="bar-count">${count}명 (${percent}%)</span>
          </div>`;
      });
      html += "</div>";
      block.innerHTML = html;
      container.appendChild(block);
    });
  }

  // -----------------------
  // 메시지 (익명 코멘트)
  const messageListEl = document.getElementById("messageList");

  function renderOpenComments(items) {
    if (!messageListEl) return;
    if (!Array.isArray(items) || !items.length) {
      messageListEl.innerHTML = `<p class="empty">아직 메시지가 없습니다.</p>`;
      return;
    }
    messageListEl.innerHTML = items.map(x => `
      <div class="msg-card">
        <div class="msg-body">${esc(x.comment || "")}</div>
        <div class="msg-time">${esc(x._when || "")}</div>
      </div>
    `).join("");
  }

  async function loadOpenComments() {
    try {
      const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(invitationId)}/open-comments`);
      if (!res.ok) throw new Error(`${res.status}`);
      const j = await res.json();
      const raw = Array.isArray(j?.items) ? j.items : [];
      const items = raw.map(x => {
        const ts = x.createdAtMs ?? x.createdAt;
        const when = ts ? new Date(ts).toLocaleString() : "";
        return { ...x, _when: when };
      });
      renderOpenComments(items);
    } catch (e) {
      console.error("open-comments load error:", e);
    }
  }

  const reminderBtn = document.getElementById("ReminderSendBtn");

  if (reminderBtn) {
    reminderBtn.addEventListener("click", () => {

      // wantsReminder === true , 이메일이 있는 사람만 추출
      const recipients = rsvpList
        .filter(p => isTrue(p.wantsReminder) && p.rsvpEmail)
        .map((p, i) => ({
          id: `recipient-${i}`,
          name: p.rsvpName || "",
          email: p.rsvpEmail
        }));

      if (recipients.length === 0) {
        alert("리마인더 이메일 발송에 동의한 사용자가 없습니다.");
        return;
      }

      const popup        = document.getElementById("emailPopup");
      const popupText    = document.getElementById("emailPopupText");
      const listContainer= document.getElementById("recipientList");
      const sendBtn      = document.getElementById("sendEmailBtn");
      const cancelBtn    = document.getElementById("cancelEmailBtn");
      const resultPopup  = document.getElementById("emailResultPopup");
      const resultText   = document.getElementById("emailResultText");
      const resultList   = document.getElementById("emailResultList");
      const closeResult  = document.getElementById("closeEmailResultBtn");


      ////  수신자 리스트 렌더링
      listContainer.innerHTML = "";
      recipients.forEach(r => {
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="checkbox" id="${r.id}" checked>
          ${r.name} (${r.email})
        `;
        listContainer.appendChild(label);
      });

      popupText.textContent = `${recipients.length}명에게 이메일을 발송할까요?`;
      popup.classList.remove("hidden");

      //// 전송 버튼 클릭
      sendBtn.onclick = async () => {
        const selected = recipients.filter(r => {
          const checkbox = document.getElementById(r.id);
          return checkbox && checkbox.checked;
        });

        if (selected.length === 0) {
          alert("선택된 수신자가 없습니다.");
          return;
        }

        sendBtn.disabled = true;
        const original = sendBtn.textContent;
        sendBtn.textContent = "전송 중...";

        try {
          const res = await fetch(`${API_BASE}/api/invitations/${encodeURIComponent(invitationId)}/reminder-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipients: selected })
          });

          const result = await res.json();

          if (result.success && Array.isArray(result.results)) {
            resultList.innerHTML = "";
            let successCount = 0, failCount = 0;

            result.results.forEach(r => {
              const li = document.createElement("li");
              if (r.status === "sent") {
                li.textContent = `✔️ ${r.name} (${r.email})`;
                li.classList.add("success");
                successCount++;
              } else {
                li.textContent = `❌ ${r.name} (${r.email}) - ${r.error || "전송 실패"}`;
                li.classList.add("fail");
                failCount++;
              }
              resultList.appendChild(li);
            });

            resultText.textContent = `성공: ${successCount}명 / 실패: ${failCount}명`;
            resultPopup.classList.remove("hidden");
          } else {
            alert("❌ 이메일 발송 실패: " + (result.error || "알 수 없는 오류"));
          }
        } catch (err) {
          console.error("이메일 전송 오류:", err);
          alert("❌ 서버 오류로 이메일 발송에 실패했습니다.");
        }

        sendBtn.disabled = false;
        sendBtn.textContent = original;
        popup.classList.add("hidden");
      };

      cancelBtn.onclick = () => popup.classList.add("hidden");
      closeResult.onclick = () => resultPopup.classList.add("hidden");
    });
}

  // -----------------------
  // 실행 boot
  (async function boot() {
    if (!invitationId) {
      if (summaryEl) summaryEl.textContent = "❌ 초대장 ID가 없습니다";
      return;
    }

    await loadChart();
    await loadList();
    await loadOpenComments();

    const surveys = await fetchSurveyDefs();
    if (surveys.length) {
      const surveyStats = makeSurveyStatsFromList(surveys, rsvpList);
      renderSurveyBarsSimple(surveys, surveyStats, rsvpList.length);
    } else {
      const container = document.querySelector("#surveyCharts, #surveyChart");
      if (container)
        container.innerHTML = `<div class="empty">설문이 설정되지 않았습니다</div>`;
    }
  })();
})();
