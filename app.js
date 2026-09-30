// Travel Diary — 여행/일정 관리
// 기존 localStorage 키(travelPlannerTrips)를 유지합니다.

let trips = [];
try {
  trips = JSON.parse(localStorage.getItem("travelPlannerTrips") || "[]");
  if (!Array.isArray(trips)) trips = [];
} catch (error) {
  trips = [];
}
let selectedTripId = null;
const main = document.querySelector("main");

function saveTrips() {
  localStorage.setItem("travelPlannerTrips", JSON.stringify(trips));
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function formatDate(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
}
function getDayCount(start, end) {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}
function getDayDate(start, dayNumber) {
  const date = new Date(`${start}T00:00:00`);
  date.setDate(date.getDate() + dayNumber - 1);
  return formatDate(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`);
}
function getCountryFlag(country = "") {
  const flags = [["일본","🇯🇵"],["한국","🇰🇷"],["미국","🇺🇸"],["영국","🇬🇧"],["프랑스","🇫🇷"],["이탈리아","🇮🇹"],["태국","🇹🇭"],["베트남","🇻🇳"],["대만","🇹🇼"],["스위스","🇨🇭"],["중국","🇨🇳"],["스페인","🇪🇸"]];
  return flags.find(([name]) => country.includes(name))?.[1] || "✈️";
}
function getScheduleCount(trip) {
  return (trip.days || []).reduce((sum, day) => sum + (day.items || []).length, 0);
}
function ensureDays(trip) {
  const count = getDayCount(trip.startDate, trip.endDate);
  const old = trip.days || [];
  trip.days = Array.from({length: count}, (_, i) => {
    const existing = old.find(day => day.day === i + 1);
    return { day: i + 1, items: existing?.items || [] };
  });
}
function renderTripList() {
  main.innerHTML = `
    <section class="welcome">
      <p class="eyebrow">YOUR TRAVEL COLLECTION</p>
      <h1>어디로 떠나볼까요<span>?</span></h1>
      <p class="welcome-copy">여행의 순간들을 차곡차곡 기록해 보세요.</p>
    </section>
    <section class="trip-section">
      <div class="section-title"><div><p class="eyebrow">MY JOURNAL</p><h2>내 여행</h2></div><button class="primary-btn new-trip-btn">＋ 새 여행 만들기</button></div>
      <div id="trip-list" class="trip-grid"></div>
    </section>`;
  const list = document.querySelector("#trip-list");
  if (!trips.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">✈</div><h3>첫 번째 여행을 기록해 볼까요?</h3><p>여행을 만들고 나만의 작은 다이어리를 시작해 보세요.</p></div>`;
  } else {
    trips.forEach(trip => {
      const card = document.createElement("article");
      card.className = "trip-card";
      const cover = trip.image
        ? `style="background-image:linear-gradient(180deg, transparent 35%, rgba(28,28,24,.55)),url('${escapeHtml(trip.image)}')"`
        : "";
      card.innerHTML = `
        <button class="trip-open" type="button" aria-label="${escapeHtml(trip.name)} 여행 열기">
          <div class="trip-cover ${trip.image ? "has-image" : ""}" ${cover}>
            <span class="cover-flag">${getCountryFlag(trip.country)}</span>
            <span class="cover-caption">${escapeHtml(trip.country || "MY JOURNEY")}</span>
          </div>
          <div class="trip-info"><div class="trip-meta">${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}</div>
          <h3>${escapeHtml(trip.name)}</h3><div class="trip-bottom"><span>✦ 일정 ${getScheduleCount(trip)}개</span><span class="arrow">↗</span></div></div>
        </button>
        <button class="trip-delete" type="button" title="여행 삭제" aria-label="여행 삭제">···</button>`;
      card.querySelector(".trip-open").addEventListener("click", () => {
        selectedTripId = trip.id;
        renderTripDetail();
      });
      card.querySelector(".trip-delete").addEventListener("click", event => {
        event.stopPropagation();
        if (confirm(`'${trip.name}' 여행을 삭제할까요? 일정도 함께 삭제됩니다.`)) {
          trips = trips.filter(item => item.id !== trip.id);
          saveTrips();
          renderTripList();
        }
      });
      list.appendChild(card);
    });
  }
  document.querySelector(".new-trip-btn").addEventListener("click", openTripModal);
}
function openTripModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `<form class="modal">
    <div class="modal-header"><div><p class="eyebrow">NEW MEMORY</p><h2>새 여행 만들기</h2></div><button class="close-modal" type="button" aria-label="닫기">×</button></div>
    <label class="form-group"><span>여행 이름</span><input id="trip-name" required maxlength="80" placeholder="예: 도쿄의 가을, 3박 4일"></label>
    <label class="form-group"><span>국가 / 도시</span><input id="trip-country" required maxlength="60" placeholder="예: 일본 · 도쿄"></label>
    <label class="form-group"><span>커버 이미지 주소 (선택)</span><input id="trip-image" type="url" placeholder="https://..."><small>온라인 이미지 주소를 넣으면 여행 카드 표지로 사용돼요.</small></label>
    <div class="form-row">
      <label class="form-group"><span>시작일</span><input type="date" id="trip-start" required></label>
      <label class="form-group"><span>종료일</span><input type="date" id="trip-end" required></label>
    </div>
    <div class="modal-buttons"><button class="secondary-btn cancel-button" type="button">취소</button><button class="primary-btn" type="submit">여행 만들기 <span>↗</span></button></div>
  </form>`;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector(".close-modal").addEventListener("click", close);
  modal.querySelector(".cancel-button").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  modal.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();
    const name = modal.querySelector("#trip-name").value.trim();
    const country = modal.querySelector("#trip-country").value.trim();
    const startDate = modal.querySelector("#trip-start").value;
    const endDate = modal.querySelector("#trip-end").value;
    const image = modal.querySelector("#trip-image").value.trim();
    if (!name || !country || !startDate || !endDate) return alert("여행 이름, 국가, 날짜를 모두 입력해주세요.");
    if (startDate > endDate) return alert("종료일은 시작일보다 빠를 수 없어요.");
    const trip = { id: Date.now(), name, country, image, startDate, endDate, days: [] };
    ensureDays(trip);
    trips.push(trip);
    saveTrips();
    close();
    renderTripList();
  });
}
function renderTripDetail() {
  const trip = trips.find(t => t.id === selectedTripId);
  if (!trip) return renderTripList();
  ensureDays(trip);
  saveTrips();
  let activeDay = 1;
  main.innerHTML = `
    <section class="trip-detail">
      <button class="back-button" id="back-to-trips">← 내 여행으로</button>
      <div class="diary-cover" ${trip.image ? `style="background-image:linear-gradient(90deg,rgba(25,25,20,.62),rgba(25,25,20,.08)),url('${escapeHtml(trip.image)}')"` : ""}>
        <div class="diary-cover-content"><p class="eyebrow">A JOURNEY TO REMEMBER</p><div class="trip-country">${getCountryFlag(trip.country)} ${escapeHtml(trip.country)}</div><h1>${escapeHtml(trip.name)}</h1><p class="cover-date">${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}</p><span class="cover-days">${getDayCount(trip.startDate, trip.endDate)} DAYS OF MEMORIES</span></div>
      </div>
      <div class="detail-heading"><div><p class="eyebrow">THE ITINERARY</p><h2>여행 일정</h2></div><span class="schedule-total">총 ${getScheduleCount(trip)}개의 기록</span></div>
      <div class="day-tabs" id="day-tabs"></div><div id="day-content"></div>
    </section>`;
  document.querySelector("#back-to-trips").addEventListener("click", renderTripList);
  const tabs = document.querySelector("#day-tabs");
  trip.days.forEach(day => {
    const button = document.createElement("button");
    button.className = `day-tab ${day.day === activeDay ? "active" : ""}`;
    button.textContent = `DAY ${day.day}`;
    button.addEventListener("click", () => {
      activeDay = day.day;
      document.querySelectorAll(".day-tab").forEach(b => b.classList.toggle("active", b === button));
      renderDayContent(trip, activeDay);
    });
    tabs.appendChild(button);
  });
  renderDayContent(trip, activeDay);
}
function renderDayContent(trip, dayNumber) {
  const day = trip.days.find(d => d.day === dayNumber);
  const content = document.querySelector("#day-content");
  if (!day || !content) return;
  content.innerHTML = `<div class="day-header"><div><h3>DAY ${dayNumber}<span class="day-date">${getDayDate(trip.startDate, dayNumber)}</span></h3><p>오늘의 작은 순간들을 기록해요.</p></div><button class="primary-btn add-schedule-button">＋ 일정 추가</button></div>
    <div class="timeline">${day.items.length ? day.items.map((item, index) => renderScheduleItem(item, index)).join("") : `<div class="empty-day"><div class="empty-icon">☼</div><h3>아직 기록이 비어 있어요</h3><p>오늘 가고 싶은 장소와 하고 싶은 일을 추가해 보세요.</p><button class="primary-btn add-schedule-button">＋ 첫 일정 추가</button></div>`}</div>`;
  content.querySelectorAll(".add-schedule-button").forEach(button => button.addEventListener("click", () => openScheduleModal(trip, day)));
  content.querySelectorAll(".edit-schedule-button").forEach(button => button.addEventListener("click", () => editSchedule(day, Number(button.dataset.index), trip)));
  content.querySelectorAll(".delete-schedule").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    if (confirm("이 일정을 삭제할까요?")) {
      day.items.splice(index, 1); saveTrips(); renderDayContent(trip, dayNumber);
      document.querySelector(".schedule-total").textContent = `총 ${getScheduleCount(trip)}개의 기록`;
    }
  }));
}
const scheduleIcons = {"관광":"📍","식사":"🍜","카페":"☕","숙소":"🏨","쇼핑":"🛍️","공항":"✈️","기타":"⭐"};
function renderScheduleItem(item, index) {
  return `<article class="timeline-item"><div class="timeline-time">${escapeHtml(item.time || "")}</div><div class="timeline-line"><span class="timeline-dot"></span></div><div class="schedule-card">
    <div class="schedule-top"><span class="schedule-type">${scheduleIcons[item.type] || item.icon || "✦"} ${escapeHtml(item.type || "기타")}</span><div class="schedule-actions"><button class="edit-schedule-button" data-index="${index}" type="button">수정</button><button class="delete-schedule" data-index="${index}" type="button">삭제</button></div></div>
    <h3>${escapeHtml(item.title)}</h3>${item.transport ? `<div class="transport-info">↳ ${escapeHtml(item.transport)}${item.duration ? ` · 약 ${escapeHtml(item.duration)}분` : ""}</div>` : ""}${item.memo ? `<p class="schedule-memo">${escapeHtml(item.memo)}</p>` : ""}</div></article>`;
}
function openScheduleModal(trip, day) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `<form class="modal"><div class="modal-header"><div><p class="eyebrow">DAY ${day.day}</p><h2>새 일정 기록</h2></div><button class="close-modal" type="button">×</button></div>
    <label class="form-group"><span>시간</span><input type="time" id="schedule-time" value="09:00" required></label>
    <label class="form-group"><span>일정 종류</span><select id="schedule-type">${Object.keys(scheduleIcons).map(type => `<option value="${type}">${scheduleIcons[type]} ${type}</option>`).join("")}</select></label>
    <label class="form-group"><span>장소 / 일정</span><input id="schedule-title" required maxlength="120" placeholder="예: 아사쿠사 센소지"></label>
    <div class="form-row"><label class="form-group"><span>이동수단</span><select id="schedule-transport"><option value="">선택 안 함</option>${["도보","전철","버스","택시","자동차","비행기"].map(x=>`<option>${x}</option>`).join("")}</select></label><label class="form-group"><span>이동시간 (분)</span><input type="number" id="schedule-duration" min="0" placeholder="30"></label></div>
    <label class="form-group"><span>메모</span><textarea id="schedule-memo" rows="3" placeholder="예약 정보, 맛집 메모, 기억하고 싶은 순간..."></textarea></label>
    <div class="modal-buttons"><button class="secondary-btn cancel-button" type="button">취소</button><button class="primary-btn" type="submit">일정 저장 ↗</button></div></form>`;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector(".close-modal").addEventListener("click", close);
  modal.querySelector(".cancel-button").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  modal.querySelector("form").addEventListener("submit", e => {
    e.preventDefault();
    const title = modal.querySelector("#schedule-title").value.trim();
    if (!title) return alert("장소 또는 일정을 입력해주세요.");
    day.items.push({time:modal.querySelector("#schedule-time").value,type:modal.querySelector("#schedule-type").value,title,transport:modal.querySelector("#schedule-transport").value,duration:modal.querySelector("#schedule-duration").value || 0,memo:modal.querySelector("#schedule-memo").value.trim()});
    day.items.sort((a,b)=>(a.time || "").localeCompare(b.time || ""));
    saveTrips(); close(); renderDayContent(trip, day.day);
    document.querySelector(".schedule-total").textContent = `총 ${getScheduleCount(trip)}개의 기록`;
  });
}
function editSchedule(day, index, trip) {
  const item = day.items[index];
  if (!item) return;
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `<form class="modal"><div class="modal-header"><div><p class="eyebrow">EDIT MEMORY</p><h2>일정 수정</h2></div><button class="close-modal" type="button">×</button></div>
    <label class="form-group"><span>시간</span><input type="time" id="edit-time" required value="${escapeHtml(item.time)}"></label>
    <label class="form-group"><span>일정 종류</span><select id="edit-type">${Object.keys(scheduleIcons).map(type=>`<option value="${type}" ${item.type===type?"selected":""}>${scheduleIcons[type]} ${type}</option>`).join("")}</select></label>
    <label class="form-group"><span>장소 / 일정</span><input id="edit-title" required value="${escapeHtml(item.title)}"></label>
    <div class="form-row"><label class="form-group"><span>이동수단</span><select id="edit-transport"><option value="">선택 안 함</option>${["도보","전철","버스","택시","자동차","비행기"].map(x=>`<option ${item.transport===x?"selected":""}>${x}</option>`).join("")}</select></label><label class="form-group"><span>이동시간 (분)</span><input type="number" id="edit-duration" min="0" value="${escapeHtml(item.duration || 0)}"></label></div>
    <label class="form-group"><span>메모</span><textarea id="edit-memo" rows="3">${escapeHtml(item.memo || "")}</textarea></label>
    <div class="modal-buttons"><button class="secondary-btn cancel-button" type="button">취소</button><button class="primary-btn" type="submit">변경 저장 ↗</button></div></form>`;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector(".close-modal").addEventListener("click", close);
  modal.querySelector(".cancel-button").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  modal.querySelector("form").addEventListener("submit", e => {
    e.preventDefault();
    item.time=modal.querySelector("#edit-time").value;
    item.type=modal.querySelector("#edit-type").value;
    item.title=modal.querySelector("#edit-title").value.trim();
    item.transport=modal.querySelector("#edit-transport").value;
    item.duration=modal.querySelector("#edit-duration").value || 0;
    item.memo=modal.querySelector("#edit-memo").value.trim();
    day.items.sort((a,b)=>(a.time || "").localeCompare(b.time || ""));
    saveTrips(); close(); renderDayContent(trip, day.day);
  });
}
renderTripList();
