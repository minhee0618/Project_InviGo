
//slider util
function initHorizontalSlider({ wrapper, track, item, prevBtn, nextBtn }) {
  const $wrap = document.querySelector(wrapper);
  const $track = document.querySelector(track);
   if (!$wrap || !$track) return;

  const $items = Array.from($track.querySelectorAll(item));
   if (!$items.length) return;

  const $prev = document.querySelector(prevBtn);
  const $next = document.querySelector(nextBtn);

  const getStep = () => {
    const el = $items[0];
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const margin = parseFloat(cs.marginLeft || "0") + parseFloat(cs.marginRight || "0");
    return rect.width + margin; 
  };

  let index = 0;

  const visibleCount = () =>  Math.max(1, Math.floor($wrap.clientWidth / getStep()));
  const maxStart = () => Math.max(0, $items.length - visibleCount());

  const apply = () => {
    const step = getStep();
    index = Math.max(0, Math.min(index, maxStart()));
    $track.style.transform = `translateX(${-index * step}px)`;
    if ($prev) $prev.disabled = index <= 0;
    if ($next) $next.disabled = index >= maxStart();
  };

  $prev && $prev.addEventListener("click", () => { index -= 1; apply(); });
  $next && $next.addEventListener("click", () => { index += 1; apply(); });
  
  window.addEventListener("resize", apply);

  apply();
}


/****text setting *****/
export function getTextSettingsHTML() {
  return `
    <div class="elements-title">Text Settings</div>
  
    <div class="setting-block">
      <label for="font" class="setting-label">Text Font</label>
      <div class="font-slider-container">
        <button class="font-arrow-left"> &#10094; </button>
        <div class="font-slider-wrapper">
        <div class="font-slider">
          <div class="font-box" data-font="Noto-Sans">Noto Sans</div>
          <div class="font-box" data-font="Noto-Serif">Noto Serif</div>
          <div class="font-box" data-font="Nanum-Gothic">Nanum Gothic</div>
          <div class="font-box" data-font="Nanum-Myeongjo">Nanum Myeongjo</div>
          <div class="font-box" data-font="Nanum-Pen-Script">Nanum Pen Script</div>
          <div class="font-box" data-font="Black-Han-Sans">Black Han Sans</div>
          <div class="font-box" data-font="Dongle">Dongle</div>
          <div class="font-box" data-font="Black-ANd-White-Picture">Black And White Picture</div>
          <div class="font-box" data-font="Hi-Melody">Hi Melody</div>
          <div class="font-box" data-font="Dokdo">Dokdo</div>
          <div class="font-box" data-font="Bagel-Fat-One">Bagel Fat One</div>
          <div class="font-box" data-font="Moirai-One">Moirai One</div>
        </div>
        </div>
        <button class="font-arrow-right"> &#10095;</button>
      </div>
    </div>

    <div class="setting-block">
      <label for="font-color" class="setting-label">Text Color</label>
      <input type="color" id="font-color" />
    </div>

    <div class="setting-block">
      <label for="font-size" class="setting-label">Text Size</label>
      <input type="range" id="font-size" min="10" max="50" value="20" />
    </div>

    <div class="setting-block">
      <label for="font-weight" class="setting-label">Text Weight</label>
      <input type="range" id="font-weight" min="100" max="900" step="100" value="400" />
    </div>
  `;
}

export function attachTextSettingEvents(){
  const previewCard = document.querySelector(".preview-card");
    if (!previewCard) return;
  
    const targets = previewCard.querySelectorAll("#preview-name, #preview-date, #preview-time, #preview-information, #preview-addinformation, #preview-telephone, #preview-email, .preview-custom-texts .preview-custom-text");

  //font
  initHorizontalSlider({
    wrapper: ".font-slider-wrapper",
    track: ".font-slider",
    item: ".font-box",
    prevBtn: ".font-arrow-left",
    nextBtn: ".font-arrow-right",
  });

  const sliderTrack = document.querySelector(".font-slider");
   if (!sliderTrack) return;

  sliderTrack.addEventListener("click", (e) => {
    const box = e.target.closest(".font-box");
     if (!box) return;

    const key = box.dataset.font;
     if (!key) return;

    const fontVar = `var(--font-${key})`;
    targets.forEach((el) => (el.style.fontFamily = fontVar));

    sliderTrack.querySelectorAll(".font-box").forEach((b) => b.classList.remove("active"));
    box.classList.add("active");
  });

  //font-color
  const colorInput = document.getElementById("font-color");
    colorInput?.addEventListener("input", (e) => {
    const v = e.target.value;
    targets.forEach((el) => (el.style.color = v));
  });

  //font-size
  const sizeInput = document.getElementById("font-size");
  sizeInput?.addEventListener("input", (e) => {
    const v = Number(e.target.value) || 0;
    targets.forEach((el) => (el.style.fontSize = `${v}px`)); 
  });

  //font-weight
  const weightInput = document.getElementById("font-weight");
  weightInput?.addEventListener("input", (e) => {
    const v = String(e.target.value);
    targets.forEach((el) => (el.style.fontWeight = v));
  });
}

/****background setting ****/
export function getBackgroundSettingsHTML() {
  return `
    <div class="elements-title">Background Settings</div>

    <div class="setting-block">
      <label for="background-color" class="setting-label">Background Color</label>
      <input type="color" id="background-color" />
    </div>
  
    <div class="setting-block">
      <label for="background-image" class="setting-label">Background Image</label>
      <input type="file" id="background-image-upload" accept="image/*" />
    </div>     
      <div class="background-image-preview-container">
        <div id="background-image-preview-message"> 권장 이미지크기 800 * 600 </div>
        <img id="background-image-preview"  style="display:none;" />
      </div>
  

    <div class="setting-block">
      <label for="Generate-AI-background" class="setting-label">Generate AI background</label>
      <button id="generate-ai-background-btn" class="generate-ai-background-btn">Generate</button>
    </div>
      <div class="ai-background-image-preview-container">
        <div id="ai-background-image-preview-message"> AI Image를 생성할수 있습니다 </div>
        <img id="ai-background-image-preview"  style="display:none;" />
      </div>
`;
}

export function attachBackgroundSettingEvents(){
  const previewCard = document.querySelector(".preview-card");
    if (!previewCard) return;

  const prevImg = document.getElementById("background-image-preview");
  const prevMsg = document.getElementById("background-image-preview-message");

  //background-color
  const backgroundColorInput = document.getElementById("background-color");
  backgroundColorInput?.addEventListener("input", (e) =>{
    const v = e.target.value;
  
    previewCard.style.backgroundImage = "none";
    previewCard.style.backgroundColor = v;

    if (prevImg && prevMsg) {
      prevImg.src = "";                 
      prevImg.style.display = "none";  
      prevMsg.style.display = "block"; 
    }
    if (backgroundImageInput) backgroundImageInput.value = "";
  });  

  //bakcground-image
  const backgroundImageInput = document.getElementById("background-image-upload");
  backgroundImageInput.addEventListener("change", (e) =>{
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>{
      const url = reader.result;

      previewCard.style.backgroundColor    = "";           
      previewCard.style.backgroundImage    = `url(${url})`;
      previewCard.style.backgroundSize     = "cover";     
      previewCard.style.backgroundPosition = "center";
      previewCard.style.backgroundRepeat   = "no-repeat";

      if (prevImg && prevMsg) {
        prevImg.src = url;
        prevImg.style.display = "block";
        prevMsg.style.display = "none";
      }
    };
    reader.readAsDataURL(file);
  });
}

/****template setting*/
export function getTemplateSettingsHTML() {
  return `
    <div class="elements-title">Template Settings</div>

      <div class="setting-block">
        <label for="template" class="setting-label">Template</label>
        <div class="template-slider-container">
          <button class="tem-arrow-left" > &#10094; </button>
          <div class="template-slider-wrapper">
          <div class="template-slider">
            <div class="template-box" data-tem="sample0"> Sample 0</div>
            <div class="template-box" data-tem="sample1"> Sample 1</div>
            <div class="template-box" data-tem="sample2"> Sample 2</div>
            <div class="template-box" data-tem="sample3"> Sample 3</div>          
            <div class="template-box" data-tem="sample4"> Sample 4</div>
            <div class="template-box" data-tem="sample5"> Sample 5</div>
            <div class="template-box" data-tem="sample6"> Sample 6</div>
            <div class="template-box" data-tem="sample7"> Sample 7</div>
            <div class="template-box" data-tem="sample8"> Sample 8</div>
            <div class="template-box" data-tem="sample9"> Sample 9</div>
            <div class="template-box" data-tem="sample10"> Sample 10</div>
            <div class="template-box" data-tem="sample11"> Sample 11</div>
            <div class="template-box" data-tem="sample12"> Sample 12</div>
          </div>
          </div>
          <button class="tem-arrow-right"> &#10095; </button>
        </div>  
      </div>
  `;
}

import { applyTemplate } from "./Ncreate_element_templates.js";

export function attachTemplateSettingEvents() {
  const previewCard = document.querySelector(".preview-card");
   if (!previewCard) return;

  const textTargets = previewCard.querySelectorAll("#preview-name, #preview-date, #preview-time, #preview-information, #preview-addinformation, #preview-telephone, #preview-email, .preview-custom-texts .preview-custom-text");
 
  initHorizontalSlider({
    wrapper: ".template-slider-wrapper",
    track:   ".template-slider",
    item:    ".template-box",
    prevBtn: ".tem-arrow-left",
    nextBtn: ".tem-arrow-right",
  });

  const sliderTrack = document.querySelector(".template-slider");
   if (!sliderTrack) return;

  sliderTrack.addEventListener("click", (e) => {
    const box = e.target.closest(".template-box");
    if (!box) return;

    const key = box.dataset.tem;          
    if (!key) return;

    sliderTrack.querySelectorAll(".template-box").forEach((b) => b.classList.remove("active"));
    box.classList.add("active");

    applyTemplate(key);

    if (typeof window.makeDraggable === "function") {
      const draggables = previewCard.querySelectorAll(
        "#preview-name, #preview-date, #preview-time, #preview-information, #preview-addinformation, #preview-telephone, #preview-email, .preview-custom-texts .preview-custom-text"
      );
      draggables.forEach((el) => window.makeDraggable(el, previewCard));
    }

    const activeFont = document.querySelector(".font-box.active")?.dataset.font;
    if (activeFont) {
      const fontVar = `var(--font-${activeFont})`;
      textTargets.forEach((el) => (el.style.fontFamily = fontVar));
    }
  });
}

/****Image setting */
export function getImageSettingsHTML() {
  return `
    <div class="setting-block">
      <label for="image" class="setting-label">Image</label>
      <input type="file" id="image-upload" accept="image/*" />
    </div>
      <div class="image-preview-container">
        <div id="image-preview-message"> 권장 이미지크기 800 * 600 </div>
        <img id="image-preview"  style="display:none;" />
      </div>
      <div class="setting-block" id="image-size-block" style="display:none;">
        <label for="image-size-range" class="setting-label">Image Size</label>
        <input type="range" id="image-size-range" min="10" max="120" value="50" />
      </div>


    <div class="setting-block">
      <label for="generate-ai-image" class="setting-label">Generate AI image</label>
      <button id="generate-ai-image-btn" class="generate-ai-image-btn">Generate</button>
    </div>
      <div class="ai-image-preview-container">
        <div id="ai-image-preview-message">AI Image를 생성할수 있습니다</div>
        <img id="ai-image-preview"  style="display:none;" />
      </div>
  `;
}

export function attachImageSettingEvents(){
  const previewCard = document.querySelector(".preview-card");
  if (!previewCard) return;

  // image
  const imageInput = document.getElementById("image-upload");
  imageInput.addEventListener("change", (e) =>{
    const file = e.target.files?.[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = () =>{
      const url = reader.result;

      const prevImg  = document.getElementById("image-preview");
      const prevMsg  = document.getElementById("image-preview-message");
      if (prevImg && prevMsg) {
        prevImg.src = url;
        prevImg.style.display = "block";
        prevMsg.style.display = "none";
      }

      const imageFile = document.querySelector(".preview-card #image-file");
      if(imageFile){
        imageFile.src = url;
        imageFile.style.display = "block";

        const el = document.querySelector(".preview-card .preview-image");
        if (el) {
          const wasNotPositioned = getComputedStyle(el).position !== "absolute";
          if (wasNotPositioned) {
            el.style.position = "absolute";
            el.style.left = "10%";
            el.style.top  = "10%";
          }

          if (typeof window.makeDraggable === "function") {
            window.makeDraggable(el);
          }

          //image-size
          const sizeBlock  = document.getElementById("image-size-block");
          const sizeRange  = document.getElementById("image-size-range");

          const applyImageSize = (percent) => {
            const v = Math.max(5, Math.min(200, Number(percent))); // 5~200%
            el.style.width = `${v}%`;
            el.style.height = "auto";
          };

          imageFile.onload = () => {
            const cardW   = previewCard.clientWidth || 1;
            const imgNatW = imageFile.naturalWidth || 0;

            let defaultPercent = imgNatW ? (imgNatW / cardW) * 100 : 100;
            defaultPercent = Math.max(5, Math.min(200, defaultPercent)); 

            if (sizeRange) {
              const min = Number(sizeRange.min || 5);
              const max = Number(sizeRange.max || 200);
              if (defaultPercent < min) sizeRange.min = String(defaultPercent);
              if (defaultPercent > max) sizeRange.max = String(defaultPercent);
              sizeRange.value = String(defaultPercent);
            }

            applyImageSize(defaultPercent);
            if (sizeBlock) sizeBlock.style.display = "flex";
          };

          if (sizeRange && !sizeRange.dataset.bound) {
            sizeRange.addEventListener("input", (ev) => {
              applyImageSize(ev.target.value);
            });
          sizeRange.dataset.bound = "1";
          }
        }
      }
    };
    reader.readAsDataURL(file);
  });
}

/****music setting */
export function getMusicSettingsHTML() {
  return `
  <div class="elements-title">Music Settings</div>

  <div class="setting-block">
    <label for="music" class="setting-label">Music</label><br>
    <input type="file" id="music-upload" accept="audio/*" /><br>
    <audio id="music-preview" controls style="display: none; width: 100%; margin-top: 10px"></audio>
  </div>
`;
}

export function attachMusicSettingEvents() {
  const previewCard  = document.querySelector(".preview-card");
   if(!previewCard) return;

  const musicInput   = document.getElementById("music-upload");
  const musicPreview = document.getElementById("music-preview");
  const previewMusic = document.querySelector(".preview-music audio");
  const musicWrap     = document.querySelector(".preview-music"); 

  musicInput.addEventListener("change", (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      musicPreview.src = reader.result;
      musicPreview.style.display = "block";
      musicPreview.play()?.catch(() => {});

      previewMusic.src = reader.result;

      let nameLabel = previewCard.querySelector(".music-label");
      if (!nameLabel) {
        nameLabel = document.createElement("div");
        nameLabel.className = "music-label";
        nameLabel.textContent = `🎵 ${file.name}`;
        nameLabel.style.position = "absolute";
        nameLabel.style.left = "80%";
        nameLabel.style.top  = "5%";
        
        musicWrap.appendChild(nameLabel);

        if (typeof window.makeDraggable === "function") {
          window.makeDraggable(nameLabel, previewCard);
        }
      }
    };

    reader.readAsDataURL(file);
  });
}

/****map setting*/
export function getMapSettingsHTML() {
  return `
    <div class="elements-title">Map Settings</div>
    
    <div class="setting-block-map">
      <label for="map-address" class="setting-label">주소 입력</label>
      <input type="text" id="map-address" placeholder="서울특별시 강남구 테헤란로 123" />
      <button type="button" id="search-address-btn">주소 검색</button>  
    </div>

      <div class="map-insert-options">
        <div class="map-option-box" data-type="icon">
          <img src="/img/create-kakaomap-icon.png" />
          <p>아이콘</p>
        </div>
        <div class="map-option-box" data-type="mini">
          <img src="/img/create-kakaomap-mini.png" />
          <p>미니맵</p>
        </div>
      </div>
  `;
}

export function attachMapSettingEvents() {
  const previewCard = document.querySelector(".preview-card");
  if (!previewCard) return;

  const addrInput = document.getElementById("map-address");
  const searchBtn = document.getElementById("search-address-btn");

  searchBtn?.addEventListener("click", () => {
    if (!(window.daum && window.daum.Postcode)) {
      alert("주소 검색이 불가능합니다.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: function (data) {
        const full = data.roadAddress || data.jibunAddress || "";
        if (addrInput) addrInput.value = full;
      }
    }).open();
  });

  document.querySelectorAll(".map-option-box").forEach((box) => {
    box.addEventListener("click", () => {
      const type = box.dataset.type; 
      const address = addrInput?.value.trim();
      if (!address) {
        alert("주소를 입력해주세요");
        return;
      }

      if (previewCard.querySelector(`.preview-map-container[data-map-type="${type}"]`)) return;

      if (type === "icon") {
        const link = `https://map.kakao.com/?q=${encodeURIComponent(address)}`;
        const html = `
              <div class="preview-map-container" data-map-type="icon">
                <span class="map-icon" title="카카오맵에서 열기" onclick="window.open('${link}', '_blank', 'noopener,noreferrer')">
                  <img src="/img/create-kakaomap-icon.png" width="30" alt="KakaoMap"/>
                  <span class="map-address">${address}</span>
                </span>
              </div>
        `;
        previewCard.insertAdjacentHTML("beforeend", html);

        const el = previewCard.querySelector(`.preview-map-container[data-map-type="icon"]`);
        if (el && typeof window.makeDraggable === "function") window.makeDraggable(el);
        return;
      }

      if (type === "mini") {
        const mapId = `kakao-map-${Date.now()}`;
        const html = `
          <div class="preview-map-container" data-map-type="mini">
            <div class="map-info-row">
              <img src="/img/create-kakaomap-icon.png" width="30" alt="KakaoMap"/>
              <span class="map-address">${address}</span>
            </div>
            <div class="map-embed">
              <div id="${mapId}" class="kakao-map" ></div>
            </div>
          </div>
        `;
        previewCard.insertAdjacentHTML("beforeend", html);

        const el = previewCard.querySelector(`.preview-map-container[data-map-type="mini"]`);
        if (el && typeof window.makeDraggable === "function") window.makeDraggable(el);

        drawKakaoMap(mapId, address);
      }
    });
  });
}




export function drawKakaoMap(mapId, address) {
  // SDK 준비 체크
  if (!(window.kakao && window.kakao.maps && window.kakao.maps.services)) {
    setTimeout(() => drawKakaoMap(mapId, address), 300);
    return;
  }

  const mapContainer = document.getElementById(mapId);
  if (!mapContainer) {
    setTimeout(() => drawKakaoMap(mapId, address), 300);
    return;
  }

  const geocoder = new window.kakao.maps.services.Geocoder();
  geocoder.addressSearch(address, (result, status) => {
    if (status !== window.kakao.maps.services.Status.OK || !result[0]) return;

    const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
    const map = new window.kakao.maps.Map(mapContainer, {
      center: coords,
      level: 4,
      draggable: true,
      scrollwheel: true,
    });
    new window.kakao.maps.Marker({ map, position: coords });
  });
}

