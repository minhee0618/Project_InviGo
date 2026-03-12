

/////////////////////////////////////icon btn - panel toogle  */
document.addEventListener("DOMContentLoaded", () => {
  const styleBtn = document.querySelector(".style-toggle");
  const responseBtn = document.querySelector(".response-toggle");
  const stylePanel = document.getElementById("style-panel");
  const responsePanel = document.getElementById("response-panel");

  function togglePanel(panelToOpen) {
    [stylePanel, responsePanel].forEach(panel => {
      if (panel === panelToOpen) {
        panel.classList.toggle("open");
      } else {
        panel.classList.remove("open");
      }
    });
  }

  styleBtn.addEventListener("click", () => togglePanel(stylePanel));
  responseBtn.addEventListener("click", () => togglePanel(responsePanel));
});

/////////////////////////////////////*main tool box - style-panel */
    /**style panel main tool box // info-fieldset-toggle */
document.addEventListener("DOMContentLoaded", () => {
  const infoToggleBtn = document.querySelector(".info-toggle-btn");
  const infoFieldset = infoToggleBtn.closest("fieldset");

  infoToggleBtn.addEventListener("click", () => {
    infoFieldset.classList.toggle("closed");
    infoToggleBtn.textContent = infoFieldset.classList.contains("closed") ? "▲" : "▼";
  });

  const textToggleBtn = document.querySelector(".text-toggle-btn");
  const textFieldset = textToggleBtn.closest("fieldset");

  textToggleBtn.addEventListener("click", () => {
    textFieldset.classList.toggle("closed");
    textToggleBtn.textContent = textFieldset.classList.contains("closed") ? "▲" : "▼";
  });
});
    /**style panel main tool box // information <-> preview*/
document.addEventListener("DOMContentLoaded", () =>{
  const fields = [
    { input: "#name",              preview: "#preview-name" },
    { input: "#date",              preview: "#preview-date" },
    { input: "#time",              preview: "#preview-time" },
    { input: "#information",       preview: "#preview-information", multiline: true},
    { input: "#addinformation",    preview: "#preview-addinformation",multiline: true},  
    { input: "#telephone",         preview: "#preview-telephone" },
    { input: "#email",             preview: "#preview-email" },
  ];

  const bindField = ({input, preview, multiline}) =>{
    const inputEle = document.querySelector(input);
    const previewEle = document.querySelector(preview);

    const renderInfo = () =>{
      const val = inputEle.value || "";
      if(multiline){
        previewEle.innerHTML = val.replace(/\n/g, "<br>")
      }else{previewEle.textContent = val}
    };

      inputEle.addEventListener("input", renderInfo);
      renderInfo();
    };
     fields.forEach(bindField);
});

    /**style panel main tool box // text-fieldset-toggle */
document.addEventListener("DOMContentLoaded",() => { 
  const addTextBtn = document.querySelector(".add-text-btn");
  const customText = document.querySelector(".custom-text");

  addTextBtn.addEventListener("click", () =>{
    const textField = document.createElement("div");
    textField.className = "custom-text-field";

    const textarea = document.createElement("textarea");
     textarea.placeholder = "add text";

    const deleteBtn = document.createElement("button");
     deleteBtn.className = "delete-text-btn"
     deleteBtn.type= "button"
     deleteBtn.textContent = "✕";
     deleteBtn.addEventListener("click", () => textField.remove());

    customText.appendChild(textField);
    textField.appendChild(textarea);
    textField.appendChild(deleteBtn);
  });
});
    /**style panel main tool box // add-text <-> preview*/
document.addEventListener("DOMContentLoaded", () =>{
  const customText = document.querySelector(".custom-text");
  const previewCustomTexts = document.querySelector(".preview-custom-texts");
  if (!customText || !previewCustomTexts) return;
  
  let seq = 0;

  const renderText = () =>{
    const savedT = new Map();
    document.querySelectorAll(".preview-custom-text").forEach((p) =>{
      const key = p.dataset.key;
      if(key){
        savedT.set(key, { left: p.style.left,
                          top: p.style.top,
                          pos: p.style.position,
        });
      };
    });

    previewCustomTexts.innerHTML = "";
    
    const previewCard = document.querySelector(".preview-card");
    customText.querySelectorAll("textarea").forEach((num)=>{
      if(!num.dataset.key)num.dataset.key = String(++seq);

      const p = document.createElement("p");
       p.className ="preview-custom-text";
       p.dataset.key = num.dataset.key
       p.innerHTML = (num.value || "").replace(/\n/g, "<br>");

       previewCustomTexts.appendChild(p);

       const stored = savedT.get(num.dataset.key);
       if(stored && (stored.left || stored.top)){
        p.style.position = stored.pos || "absolute";
        p.style.left = stored.left || "0px";
        p.style.top  = stored.top  || "0px"
       }

      if (previewCard && typeof makeDraggable === "function") {
        makeDraggable(p);
       }
    });
  };
  
  renderText();

  customText.addEventListener("input", (e) => {
    const num = e.target;
    if (!num.dataset.key) num.dataset.key = String(++seq);

    const p = previewCustomTexts.querySelector(`.preview-custom-text[data-key="${num.dataset.key}"]`);

    if (p) {
      p.innerHTML = (num.value || "").replace(/\n/g, "<br>");
    } else {renderText();}
  });

  new MutationObserver(renderText).observe(customText, { childList: true, subtree: true });
});

    /**style panel sub tool box // ratio*/
document.addEventListener("DOMContentLoaded", () =>{
  const ratioBoxes = document.querySelectorAll(".ratio-box");
  const previewCard = document.querySelector(".preview-card");

  ratioBoxes.forEach((box) => {
    box.addEventListener("click",() =>{
      const ratio = box.getAttribute("data-ratio") || "4/3";

      previewCard.style.aspectRatio = ratio;

      ratioBoxes.forEach(b => b.classList.remove("selected"));
      box.classList.add("selected");
    });
  });
});

    /**style panel sub tool box // element-toolbar*/
import {
  getTextSettingsHTML, attachTextSettingEvents,
  getBackgroundSettingsHTML, attachBackgroundSettingEvents,
  getTemplateSettingsHTML, attachTemplateSettingEvents,
  getImageSettingsHTML, attachImageSettingEvents,
  getMusicSettingsHTML, attachMusicSettingEvents,
  getMapSettingsHTML, attachMapSettingEvents
} from "./Ncreate_element.js";

document.addEventListener("DOMContentLoaded", () => {
  const defaultBox = document.getElementById("default-tool-box");
  const editBox = document.getElementById("edit-tool-box");
  const activeElementBtn = document.getElementById("active-element-btn");
  const settingHost = document.querySelector(".elements-setting");
  const backBtn = document.getElementById("element-back-btn");
  const previewCard = document.querySelector(".preview-card");

  document.querySelectorAll("#default-tool-box .element-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.element;

      defaultBox.style.display = "none";
      editBox.style.display = "block";

      activeElementBtn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      activeElementBtn.dataset.element = type;

  
      if (type === "text") {
        settingHost.innerHTML = getTextSettingsHTML();
        attachTextSettingEvents(previewCard);    
      } else if (type === "background") {
        settingHost.innerHTML = getBackgroundSettingsHTML();
        attachBackgroundSettingEvents(previewCard);
      } else if (type === "template") {
        settingHost.innerHTML = getTemplateSettingsHTML();
        attachTemplateSettingEvents(previewCard);
      } else if (type === "image") {
        settingHost.innerHTML = getImageSettingsHTML();
        attachImageSettingEvents(previewCard);
      } else if (type === "music") {
        settingHost.innerHTML = getMusicSettingsHTML();
        attachMusicSettingEvents(previewCard);
      } else if (type === "map") {
        settingHost.innerHTML = getMapSettingsHTML();
        attachMapSettingEvents(previewCard);
      }
    });
  });

  backBtn.addEventListener("click", () => {
    editBox.style.display = "none";
    defaultBox.style.display = "block";
    settingHost.innerHTML = "";
  });
});


    /**style panel sub tool box // PNG Download*/
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("download-btn");
  const previewCard = document.querySelector(".preview-card");

  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");

  downloadBtn.addEventListener("click", async () => {
    try {
      const canvas = await html2canvas(previewCard, {
        backgroundColor: null,
        useCORS: true,
        scale: 2
      });

      const link = document.createElement("a");
      link.download = `InviGo-invitation-${stamp()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      alert("⚠️ Something went wrong while saving the invitation image.\nPlease try again in a moment.");
    }
  });
});


/////////////////////////////////////*main tool box - response-panel */
document.addEventListener("DOMContentLoaded", () => {
  const rsvpCheck = document.getElementById("rsvp-check");
  const addSurvey = document.querySelector(".add-survey");
  const addSurveyBtn = document.querySelector(".add-survey-btn");
  const surveys = document.querySelector(".surveys");

  const toggleSurvey = () => {
    addSurvey.style.display = rsvpCheck.checked ? "block" : "none";
    if (!rsvpCheck.checked) surveys.innerHTML = "";
  };

  rsvpCheck.addEventListener("change", toggleSurvey);
  toggleSurvey();

  addSurveyBtn.addEventListener("click", () => {
    const surveyHTML = `
      <div class="survey-box">
        <button class="delete-survey-btn" type="button">✕</button>
        <label>Q. <input type="text" class="survey-question" placeholder="질문을 입력하세요" /></label>
        <label>Option 1 <input type="text" class="survey-option" placeholder="Option 1" /></label>
        <label>Option 2 <input type="text" class="survey-option" placeholder="Option 2" /></label>
      </div>
    `;
    surveys.insertAdjacentHTML("beforeend", surveyHTML);
  });

  surveys.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-survey-btn")) {
      e.target.closest(".survey-box")?.remove();
    }
  });
});

/////////////////////////////////////*ai - modal */
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:3000";

  const modal    = document.getElementById("ai-modal");
  if (!modal) return;

  const backdrop = modal.querySelector(".ai-modal-backdrop");
  const btnClose = document.getElementById("ai-close");

  const titleEl  = document.getElementById("ai-title");
  const promptEl = document.getElementById("ai-prompt");
  const preview  = document.getElementById("ai-preview");
  const btnGen   = document.getElementById("ai-generate");
  const btnApply = document.getElementById("ai-apply");

  // 선택적으로 메시지 영역이 있다면 (없어도 동작)
  const msgEl    = document.getElementById("ai-preview-message");

  let mode = "image";  
  let generatedUrl = ""; 

  function resetModalUI() {
    if (titleEl) {
      titleEl.textContent = mode === "background" ? "Generate AI Background" : "Generate AI Image";
    }
    if (promptEl) promptEl.value = "";
    generatedUrl = "";
    if (preview) { preview.src = ""; preview.hidden = true; }
    if (btnApply) btnApply.disabled = true;
    if (msgEl) { msgEl.textContent = "프롬프트를 입력한 뒤 Generate를 누르세요."; msgEl.style.opacity = 0.8; }
  }

  function openModal(nextMode = "image") {
    mode = nextMode;
    resetModalUI();
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  backdrop?.addEventListener("click", closeModal);
  btnClose?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("hidden") && e.key === "Escape") closeModal();
  });

  // 외부 트리거 버튼.generate-ai-image-btn / .generate-ai-background-btn
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest(".generate-ai-image-btn"))      openModal("image");
    if (t.closest(".generate-ai-background-btn")) openModal("background");
  });

  // Generate 서버 호출
  btnGen?.addEventListener("click", async () => {
    const text = (promptEl?.value || "").trim();
    if (!text) { alert("프롬프트를 입력해 주세요."); return; }

    //// 로딩
    btnGen.disabled = true;
    btnGen.textContent = "Generating...";
    if (msgEl) msgEl.textContent = "AI가 이미지를 생성 중입니다...";
    if (msgEl) msgEl.style.opacity = 1;

    try {
      const res = await fetch(`${API_BASE}/api/ai/generate-and-upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body  : JSON.stringify({ prompt: text, size: "1024x1024" })
      });

      const j = await res.json();
      if (j?.success && j?.url) {
        generatedUrl = j.url;
        if (preview) {
          preview.src = generatedUrl;
          preview.hidden = false;
        }
        if (btnApply) btnApply.disabled = false;
        if (msgEl) { msgEl.textContent = "생성 완료! Apply를 눌러 적용하세요."; msgEl.style.opacity = 1; }
      } else {
        const errMsg = j?.error || "알 수 없는 오류";
        alert("❌ 생성 실패: " + errMsg);
        if (msgEl) { msgEl.textContent = "생성 실패. 프롬프트를 조정해 다시 시도하세요."; }
      }
    } catch (err) {
      console.error("AI generate error:", err);
      alert("❌ 서버 오류로 이미지 생성에 실패했습니다.");
      if (msgEl) msgEl.textContent = "서버 오류로 생성 실패";
    } finally {
      btnGen.disabled = false;
      btnGen.textContent = "Generate";
    }
  });

  // Apply
  btnApply?.addEventListener("click", () => {
    if (!generatedUrl) return;
    // 배경 이미지 
    if (mode === "background") {
      const target =
        document.querySelector(".preview-page-section") ||
        document.querySelector(".preview-card");

      if (target) {
        target.style.backgroundImage = `url(${generatedUrl})`;
        target.style.backgroundSize = "cover";
        target.style.backgroundPosition = "center";
      }
      //// 전역 보관
      window.appliedAiBackgroundUrl = generatedUrl;
    } else {
      // 일반 이미지 
    const imgEl = document.getElementById("image-file") || document.getElementById("preview-image");
    if (imgEl) {
      imgEl.src = generatedUrl;
      imgEl.style.display = "block";
      imgEl.style.maxWidth = "20rem";

      // ✅ 래퍼가 없으면 자동으로 감싸기
      let wrapper = imgEl.closest(".preview-image");
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "preview-image";
        // IMG 앞뒤 위치 유지하며 감싸기
        imgEl.parentNode.insertBefore(wrapper, imgEl);
        wrapper.appendChild(imgEl);
      }

      // 래퍼 포지션이 static이면 absolute로 변경 (드래그 필요)
      const cs = getComputedStyle(wrapper);
      if (cs.position === "static") wrapper.style.position = "absolute";

      // ✅ 래퍼에 드래그 부착
      if (typeof window.makeDraggable === "function") {
        window.makeDraggable(wrapper);
      }
    }
    window.appliedAiImageUrl = generatedUrl;
    }
    closeModal();
  });
});

/////////////////////////////////////main-preview / preview-share*/

document.addEventListener("DOMContentLoaded", () => {
  const shareBtn = document.getElementById("share-btn");
  const previewCard = document.querySelector(".preview-card");

  shareBtn.addEventListener("click", async () => {
    try {
      // 1) 초대장 이미지 
      const canvas = await html2canvas(previewCard, {
        backgroundColor: null,
        useCORS: true,
        scale: 2
      });
      const imageDataUrl = canvas.toDataURL("image/png"); 

      // 2) RSVP
      const rsvpEnabled = document.getElementById("rsvp-check")?.checked || false;

      const surveys = Array.from(document.querySelectorAll(".surveys .survey-box")).map(box => {
        const question = box.querySelector(".survey-question")?.value?.trim() || "";
        const options = Array.from(box.querySelectorAll(".survey-option"))
          .map(inp => inp.value.trim())
          .filter(v => v.length > 0);
        return { question, options };
      }).filter(s => s.question.length > 0); 

      // 3) 초대장 데이터 
      const invitationData = {
        name: document.getElementById("name").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        information: document.getElementById("information").value,
        addinformation: document.getElementById("addinformation").value,
        telephone: document.getElementById("telephone").value.trim(),
        email: document.getElementById("email").value.trim(),

        imageDataUrl,

        rsvp: {
          enabled: rsvpEnabled,
          surveys
        }
      };

  
      // 서버 전송
      const API_BASE = "http://127.0.0.1:3000";
      const res = await fetch(`${API_BASE}/api/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invitationData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText}\n${text.slice(0, 200)}`);
      }

      const result = await res.json();

      if (result.success) {
        const { id, imageUrl } = result;
        alert(`✔️ 초대장이 저장되었습니다! ✔️ \nID: ${id}`);
      
        localStorage.setItem("lastInvitationId", id);
        localStorage.setItem("lastInvitationImage", imageUrl || "");
        //view.html?id={}이동
        window.location.href = `/Nview/Nview.html?id=${encodeURIComponent(id)}`;
      } else {
        alert("❌ 저장 실패 ❌");
      }
    } catch (err) {
      console.error("❌ 초대장 저장 실패:", err);
      alert("❌ 초대장 저장 중 오류 발생 ❌\n     잠시 후 다시 시도해 주세요");
    }
  });
});


/////////////////////////////////////draggable Logic*/
document.addEventListener("DOMContentLoaded", () =>{
  const previewCard = document.querySelector(".preview-card");
  if (!previewCard) return; 
  
  function makeDraggable(el){
    if(el.dataset.draggable === "1")return;
    el.dataset.draggable = "1";

    let startX, startY;
    let startLeft, startTop;

    const onPointerDown = (e) =>{
      e.preventDefault();                                

      const cardRect = previewCard.getBoundingClientRect();
      const elRect = el.getBoundingClientRect(); 

      if(getComputedStyle(el).position !=="absolute"){
      el.style.position = "absolute";
      el.style.left = `${elRect.left - cardRect.left + previewCard.scrollLeft}px`;
      el.style.top = `${elRect.top - cardRect.top + previewCard.scrollTop}px`;
      }

      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(el.style.left) || 0;
      startTop = parseFloat(el.style.top) || 0;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }

    const cardInside = true;

    const onPointerMove = (e) =>{
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      let left = startLeft + dx;
      let top = startTop + dy;

      if(cardInside){
        const cardW = previewCard.clientWidth;
        const cardH = previewCard.clientHeight;
        const elW = el.offsetWidth;
        const elH = el.offsetHeight;
        const SAFE = 15;

        if (left < SAFE) left = SAFE;
        if (top < SAFE) top = SAFE;
        if (left > cardW - elW - SAFE) left = cardW - elW - SAFE;
        if (top > cardH - elH - SAFE) top = cardH - elH - SAFE;
      }

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    }

    const onPointerUp = (e) =>{
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown);
  }
  window.makeDraggable = makeDraggable;

  const atachAll = () =>{
    previewCard.querySelectorAll("p, .preview-custom-text,.preview-image,#image-file").forEach(makeDraggable);
  };

  atachAll();
  new MutationObserver(atachAll).observe(previewCard, {childList : true, subtree : true});
});