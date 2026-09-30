// ========================================
// Travel Planner
// 여행 목록 + 여행 상세 + 일정 관리
// ========================================


// ----------------------------------------
// 데이터
// ----------------------------------------

let trips = JSON.parse(
    localStorage.getItem("travelPlannerTrips")
) || [];

let selectedTripId = null;

// 브라우저에 저장된 일정이 없으면 GitHub의 trips.json 불러오기
async function initializeTrips() {
    if (localStorage.getItem("travelPlannerTrips") === null) {
        try {
            const response = await fetch("./trips.json");

            if (!response.ok) {
                throw new Error("여행 데이터를 불러오지 못했어요.");
            }

            const publishedTrips = await response.json();

            trips = Array.isArray(publishedTrips)
                ? publishedTrips
                : [];

        } catch (error) {
            console.error(error);
            trips = [];
        }
    }

    renderTripList();
}


// ----------------------------------------
// 기본 요소
// ----------------------------------------

const main = document.querySelector("main");


// ----------------------------------------
// 데이터 저장
// ----------------------------------------

function saveTrips() {
    localStorage.setItem(
        "travelPlannerTrips",
        JSON.stringify(trips)
    );
}

// 여행 일정 JSON 파일로 내보내기
function exportTrips() {
    const json = JSON.stringify(trips, null, 2);

    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "trips.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    alert("여행 데이터가 다운로드됐어요!");
}

// ----------------------------------------
// 날짜 표시
// ----------------------------------------

function formatDate(dateString) {

    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}.${month}.${day}`;
}


// ----------------------------------------
// 여행 기간 계산
// ----------------------------------------

function getDayCount(startDate, endDate) {

    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference =
        end.getTime() - start.getTime();

    return Math.floor(
        difference / (1000 * 60 * 60 * 24)
    ) + 1;
}


// ----------------------------------------
// 국가 아이콘
// ----------------------------------------

function getCountryFlag(country) {

    if (country.includes("일본")) return "🇯🇵";
    if (country.includes("한국")) return "🇰🇷";
    if (country.includes("미국")) return "🇺🇸";
    if (country.includes("영국")) return "🇬🇧";
    if (country.includes("프랑스")) return "🇫🇷";
    if (country.includes("이탈리아")) return "🇮🇹";
    if (country.includes("태국")) return "🇹🇭";
    if (country.includes("베트남")) return "🇻🇳";
    if (country.includes("대만")) return "🇹🇼";

    return "✈️";
}


// ----------------------------------------
// HTML 안전 처리
// ----------------------------------------

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ========================================
// 여행 목록 화면
// ========================================

function renderTripList() {

    main.innerHTML = `
        <section class="trip-section">

            <div class="section-title">

                <h2>내 여행</h2>

                <button class="new-trip-btn">
                    + 새 여행
                </button>

                <button class="export-trips-btn">
                    ↓ 여행 데이터 내보내기
                </button>

            </div>

            <div id="trip-list"></div>

        </section>
    `;


    const tripList =
        document.querySelector("#trip-list");


    if (trips.length === 0) {

        tripList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✈️</div>

                <h3>아직 여행이 없어요</h3>

                <p>
                    새로운 여행을 만들어보세요.
                </p>
            </div>
        `;

    } else {

        trips.forEach(function (trip) {

            const card =
                document.createElement("div");

            card.className = "trip-card";

            card.innerHTML = `

                <div class="trip-icon">
                    ${getCountryFlag(trip.country)}
                </div>

                <div class="trip-info">

                    <h3>
                        ${escapeHtml(trip.name)}
                    </h3>

                    <p>
                        ${formatDate(trip.startDate)}
                        ~
                        ${formatDate(trip.endDate)}
                    </p>

                    <span>
                        일정 ${getScheduleCount(trip)}개
                    </span>

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    selectedTripId = trip.id;

                    renderTripDetail();

                }
            );


            tripList.appendChild(card);

        });

    }


    // 새 여행 버튼
    document
        .querySelector(".new-trip-btn")
        .addEventListener(
            "click",
            openTripModal
        );

    document
    .querySelector(".export-trips-btn")
    .addEventListener("click", exportTrips);
}


// ----------------------------------------
// 일정 개수
// ----------------------------------------

function getScheduleCount(trip) {

    if (!trip.days) {
        return 0;
    }

    return trip.days.reduce(
        (total, day) => total + day.items.length,
        0
    );
}


// ========================================
// 여행 생성 모달
// ========================================

function openTripModal() {

    const modal =
        document.createElement("div");

    modal.className = "modal-overlay";

    modal.innerHTML = `

        <div class="modal">

            <div class="modal-header">

                <h2>새 여행 만들기</h2>

                <button class="close-modal">
                    ×
                </button>

            </div>


            <div class="form-group">

                <label>여행 이름</label>

                <input
                    type="text"
                    id="trip-name"
                    placeholder="예: 도쿄 3박 4일"
                >

            </div>


            <div class="form-group">

                <label>국가</label>

                <input
                    type="text"
                    id="trip-country"
                    placeholder="예: 일본"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>시작일</label>

                    <input
                        type="date"
                        id="trip-start"
                    >

                </div>


                <div class="form-group">

                    <label>종료일</label>

                    <input
                        type="date"
                        id="trip-end"
                    >

                </div>

            </div>


            <div class="modal-buttons">

                <button class="cancel-button">
                    취소
                </button>

                <button class="save-trip-button">
                    여행 만들기
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    // 닫기
    modal
        .querySelector(".close-modal")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    // 취소
    modal
        .querySelector(".cancel-button")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    // 저장
    modal
        .querySelector(".save-trip-button")
        .addEventListener(
            "click",
            function () {

                const name =
                    document.querySelector("#trip-name")
                        .value.trim();

                const country =
                    document.querySelector("#trip-country")
                        .value.trim();

                const start =
                    document.querySelector("#trip-start")
                        .value;

                const end =
                    document.querySelector("#trip-end")
                        .value;


                if (!name) {
                    alert("여행 이름을 입력해주세요.");
                    return;
                }

                if (!country) {
                    alert("국가를 입력해주세요.");
                    return;
                }

                if (!start || !end) {
                    alert("여행 날짜를 입력해주세요.");
                    return;
                }

                if (start > end) {
                    alert(
                        "종료일은 시작일보다 빠를 수 없습니다."
                    );
                    return;
                }


                const dayCount =
                    getDayCount(start, end);


                // 여행 생성
                const newTrip = {

                    id: Date.now(),

                    name: name,

                    country: country,

                    startDate: start,

                    endDate: end,

                    days: []

                };


                // 날짜별 DAY 생성
                for (
                    let i = 1;
                    i <= dayCount;
                    i++
                ) {

                    newTrip.days.push({

                        day: i,

                        items: []

                    });

                }


                trips.push(newTrip);

                saveTrips();

                modal.remove();

                renderTripList();

            }
        );
}


// ========================================
// 여행 상세 화면
// ========================================

function renderTripDetail() {

    const trip =
        trips.find(
            t => t.id === selectedTripId
        );


    if (!trip) {
        renderTripList();
        return;
    }


// 여행 날짜에 맞춰 DAY 생성
const dayCount = getDayCount(
    trip.startDate,
    trip.endDate
);

// 기존 days가 없거나,
// 기존 DAY 개수가 여행 기간과 다르면 다시 생성
if (!trip.days || trip.days.length !== dayCount) {

    // 기존 일정이 있다면 최대한 유지
    const existingDays = trip.days || [];

    trip.days = [];

    for (
        let i = 1;
        i <= dayCount;
        i++
    ) {

        const existingDay =
            existingDays.find(
                d => d.day === i
            );

        trip.days.push({

            day: i,

            items:
                existingDay
                    ? existingDay.items
                    : []

        });

    }

    saveTrips();
}


    // 현재 선택 DAY
    let activeDay = 1;


    main.innerHTML = `

        <section class="trip-detail">

            <button
                class="back-button"
                id="back-to-trips"
            >
                ← 내 여행
            </button>


            <div class="trip-detail-header">

                <div>

                    <div class="trip-country">
                        ${getCountryFlag(trip.country)}
                        ${escapeHtml(trip.country)}
                    </div>

                    <h2>
                        ${escapeHtml(trip.name)}
                    </h2>

                    <p>
                        ${formatDate(trip.startDate)}
                        ~
                        ${formatDate(trip.endDate)}
                    </p>

                </div>

            </div>


            <div
                class="day-tabs"
                id="day-tabs"
            ></div>


            <div
                id="day-content"
            ></div>

        </section>

    `;


    // DAY 버튼 만들기
    const dayTabs =
        document.querySelector("#day-tabs");


    trip.days.forEach(function (day) {

        const button =
            document.createElement("button");

        button.className =
            "day-tab";


        if (day.day === activeDay) {
            button.classList.add("active");
        }


        button.textContent =
            `DAY ${day.day}`;


        button.addEventListener(
            "click",
            function () {

                activeDay = day.day;

                document
                    .querySelectorAll(".day-tab")
                    .forEach(
                        b => b.classList.remove("active")
                    );

                button.classList.add("active");

                renderDayContent(
                    trip,
                    activeDay
                );

            }
        );


        dayTabs.appendChild(button);

    });


    // 뒤로가기
    document
        .querySelector("#back-to-trips")
        .addEventListener(
            "click",
            function () {

                renderTripList();

            }
        );


    renderDayContent(
        trip,
        activeDay
    );
}


// ========================================
// DAY 화면
// ========================================

function renderDayContent(
    trip,
    dayNumber
) {

    const day =
        trip.days.find(
            d => d.day === dayNumber
        );


    const content =
        document.querySelector("#day-content");


    content.innerHTML = `

        <div class="day-header">

            <div>

                <h3>
                    DAY ${dayNumber}
                </h3>

                <p>
                    ${getDayDate(
                        trip.startDate,
                        dayNumber
                    )}
                </p>

            </div>


            <button
                class="add-schedule-button"
                id="add-schedule"
            >
                + 일정 추가
            </button>

        </div>


        <div class="timeline">

            ${
                day.items.length === 0

                ?

                `
                    <div class="empty-day">

                        <div>
                            🗓️
                        </div>

                        <h3>
                            아직 일정이 없어요
                        </h3>

                        <p>
                            아래 버튼을 눌러 첫 일정을 추가해보세요.
                        </p>

                        <button
                            class="add-schedule-button"
                            id="add-schedule-empty"
                        >
                            + 첫 일정 추가
                        </button>

                    </div>
                `

                :

                day.items.map(
                    renderScheduleItem
                ).join("")

            }

        </div>

    `;


    // 일정 추가 버튼
    document
        .querySelector("#add-schedule")
        .addEventListener(
            "click",
            function () {

                openScheduleModal(
                    trip,
                    day
                );

            }
        );


    const emptyButton =
        document.querySelector(
            "#add-schedule-empty"
        );


    if (emptyButton) {

        emptyButton.addEventListener(
            "click",
            function () {

                openScheduleModal(
                    trip,
                    day
                );

            }
        );

    }
}


// ----------------------------------------
// 날짜 계산
// ----------------------------------------

function getDayDate(
    startDate,
    dayNumber
) {

    const date =
        new Date(startDate);

    date.setDate(
        date.getDate() + dayNumber - 1
    );

    return formatDate(
        date.toISOString().split("T")[0]
    );
}


// ----------------------------------------
// 일정 HTML
// ----------------------------------------

function renderScheduleItem(
    item,
    index
) {

    return `

        <div class="timeline-item">

            <div class="timeline-time">

                ${escapeHtml(item.time)}

            </div>


            <div class="timeline-line">

                <div class="timeline-dot"></div>

            </div>


            <div class="schedule-card">

                <div class="schedule-top">

                    <span class="schedule-type">
                        ${item.icon}
                        ${escapeHtml(item.type)}
                    </span>

                    <button
    type="button"
    class="edit-schedule-button"
    onclick="editSchedule(${index})"
>
    ✏️ 수정
</button>
<button
                        class="delete-schedule"
                        onclick="deleteSchedule(${index})"
                    >
                        삭제
                    </button>

                </div>


                <h3>
                    ${escapeHtml(item.title)}
                </h3>


                ${
                    item.transport
                    ?

                    `
                        <div class="transport-info">

                            <span>
                                ↓
                            </span>

                            <strong>
                                ${escapeHtml(item.transport)}
                            </strong>

                            <span>
                                ${item.duration}분
                            </span>

                        </div>
                    `

                    :

                    ""
                }


                ${
                    item.memo
                    ?

                    `
                        <p class="schedule-memo">
                            ${escapeHtml(item.memo)}
                        </p>
                    `

                    :

                    ""
                }

            </div>

        </div>

    `;
}


// ========================================
// 일정 추가 모달
// ========================================

function openScheduleModal(
    trip,
    day
) {

    const modal =
        document.createElement("div");

    modal.className =
        "modal-overlay";


    modal.innerHTML = `

        <div class="modal">

            <div class="modal-header">

                <h2>
                    DAY ${day.day} 일정 추가
                </h2>

                <button class="close-modal">
                    ×
                </button>

            </div>


            <div class="form-group">

                <label>
                    시간
                </label>

                <input
                    type="time"
                    id="schedule-time"
                    value="09:00"
                >

            </div>


            <div class="form-group">

                <label>
                    일정 종류
                </label>

                <select id="schedule-type">

                    <option value="관광">📍 관광</option>

                    <option value="식사">🍜 식사</option>

                    <option value="카페">☕ 카페</option>

                    <option value="숙소">🏨 숙소</option>

                    <option value="쇼핑">🛍️ 쇼핑</option>

                    <option value="공항">✈️ 공항</option>

                    <option value="기타">⭐ 기타</option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    장소 / 일정
                </label>

                <input
                    type="text"
                    id="schedule-title"
                    placeholder="예: 아사쿠사 센소지"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>
                        이동수단
                    </label>

                    <select id="schedule-transport">

                        <option value="">
                            없음
                        </option>

                        <option value="도보">
                            🚶 도보
                        </option>

                        <option value="전철">
                            🚃 전철
                        </option>

                        <option value="버스">
                            🚌 버스
                        </option>

                        <option value="택시">
                            🚕 택시
                        </option>

                        <option value="자동차">
                            🚗 자동차
                        </option>

                        <option value="비행기">
                            ✈️ 비행기
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        이동시간
                    </label>

                    <input
                        type="number"
                        id="schedule-duration"
                        placeholder="30"
                        min="0"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>
                    메모
                </label>

                <textarea
                    id="schedule-memo"
                    placeholder="센소지 구경 / 예약 필요 / 맛집 웨이팅 등"
                ></textarea>

            </div>


            <div class="modal-buttons">

                <button
                    class="cancel-button"
                >
                    취소
                </button>

                <button
                    class="save-trip-button"
                    id="save-schedule"
                >
                    일정 추가
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    // 닫기
    modal
        .querySelector(".close-modal")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    // 취소
    modal
        .querySelector(".cancel-button")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    // 저장
    modal
        .querySelector("#save-schedule")
        .addEventListener(
            "click",
            function () {

                const time =
                    document.querySelector(
                        "#schedule-time"
                    ).value;

                const type =
                    document.querySelector(
                        "#schedule-type"
                    ).value;

                const title =
                    document.querySelector(
                        "#schedule-title"
                    ).value.trim();

                const transport =
                    document.querySelector(
                        "#schedule-transport"
                    ).value;

                const duration =
                    document.querySelector(
                        "#schedule-duration"
                    ).value;

                const memo =
                    document.querySelector(
                        "#schedule-memo"
                    ).value.trim();


                if (!time) {

                    alert(
                        "시간을 입력해주세요."
                    );

                    return;
                }


                if (!title) {

                    alert(
                        "장소 또는 일정을 입력해주세요."
                    );

                    return;
                }


                const icons = {

                    "관광": "📍",

                    "식사": "🍜",

                    "카페": "☕",

                    "숙소": "🏨",

                    "쇼핑": "🛍️",

                    "공항": "✈️",

                    "기타": "⭐"

                };


                day.items.push({

                    time: time,

                    type: type,

                    icon: icons[type],

                    title: title,

                    transport: transport,

                    duration: duration || 0,

                    memo: memo

                });


                // 시간순 정렬
                day.items.sort(
                    (a, b) =>
                        a.time.localeCompare(b.time)
                );


                saveTrips();

                modal.remove();

                renderDayContent(
                    trip,
                    day.day
                );

            }
        );
}


// ========================================
/* =========================================================
   일정 수정 기능
   ========================================================= */

function editSchedule(index) {

    const trip = trips.find(t => t.id === selectedTripId);

    if (!trip) return;

    const activeDayButton = document.querySelector(".day-tab.active");

    if (!activeDayButton) return;

    const dayNumber = Number(
        activeDayButton.textContent
            .replace("DAY", "")
            .trim()
    );

    const day = trip.days.find(d => d.day === dayNumber);

    if (!day) return;

    const item = day.items[index];

    if (!item) return;


    const modal = document.createElement("div");

    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal">

            <div class="modal-header">

                <h2>일정 수정</h2>

                <button
                    class="close-modal"
                    type="button"
                >
                    ×
                </button>

            </div>


            <div class="form-group">

                <label>시간</label>

                <input
                    type="time"
                    id="edit-schedule-time"
                    value="${item.time || ""}"
                >

            </div>


            <div class="form-group">

                <label>일정 종류</label>

                <select id="edit-schedule-type">

                    <option value="관광">📍 관광</option>
                    <option value="식사">🍜 식사</option>
                    <option value="카페">☕ 카페</option>
                    <option value="숙소">🏨 숙소</option>
                    <option value="쇼핑">🛍️ 쇼핑</option>
                    <option value="공항">✈️ 공항</option>
                    <option value="기타">⭐ 기타</option>

                </select>

            </div>


            <div class="form-group">

                <label>장소 / 일정</label>

                <input
                    type="text"
                    id="edit-schedule-title"
                    value="${escapeHtml(item.title || "")}"
                    placeholder="예: 센소지"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>이동수단</label>

                    <select id="edit-schedule-transport">

                        <option value="">선택 안 함</option>
                        <option value="도보">🚶 도보</option>
                        <option value="전철">🚃 전철</option>
                        <option value="버스">🚌 버스</option>
                        <option value="택시">🚕 택시</option>
                        <option value="자동차">🚗 자동차</option>
                        <option value="비행기">✈️ 비행기</option>

                    </select>

                </div>


                <div class="form-group">

                    <label>이동시간</label>

                    <input
                        type="number"
                        id="edit-schedule-duration"
                        value="${item.duration || 0}"
                        min="0"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>메모</label>

                <textarea
                    id="edit-schedule-memo"
                    placeholder="메모를 입력하세요"
                >${escapeHtml(item.memo || "")}</textarea>

            </div>


            <div class="modal-buttons">

                <button
                    class="cancel-button"
                    type="button"
                >
                    취소
                </button>

                <button
                    class="save-trip-button"
                    id="update-schedule"
                    type="button"
                >
                    일정 수정
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    document.querySelector("#edit-schedule-type").value =
        item.type || "기타";

    document.querySelector("#edit-schedule-transport").value =
        item.transport || "";


    modal.querySelector(".close-modal").addEventListener(
        "click",
        () => modal.remove()
    );


    modal.querySelector(".cancel-button").addEventListener(
        "click",
        () => modal.remove()
    );


    modal.querySelector("#update-schedule").addEventListener(
        "click",
        function () {

            const time =
                document.querySelector("#edit-schedule-time").value;

            const type =
                document.querySelector("#edit-schedule-type").value;

            const title =
                document.querySelector("#edit-schedule-title").value.trim();

            const transport =
                document.querySelector("#edit-schedule-transport").value;

            const duration =
                document.querySelector("#edit-schedule-duration").value;

            const memo =
                document.querySelector("#edit-schedule-memo").value.trim();


            if (!time) {

                alert("시간을 입력해주세요.");

                return;

            }


            if (!title) {

                alert("장소 또는 일정을 입력해주세요.");

                return;

            }


            const icons = {

                "관광": "📍",
                "식사": "🍜",
                "카페": "☕",
                "숙소": "🏨",
                "쇼핑": "🛍️",
                "공항": "✈️",
                "기타": "⭐"

            };


            day.items[index] = {

                ...day.items[index],

                time: time,

                type: type,

                icon: icons[type],

                title: title,

                transport: transport,

                duration: duration || 0,

                memo: memo

            };


            day.items.sort(
                (a, b) =>
                    a.time.localeCompare(b.time)
            );


            saveTrips();

            modal.remove();

            renderDayContent(
                trip,
                day.day
            );

        }
    );

}


/* =========================================================
   HTML 특수문자 처리
   ========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

// 일정 삭제
// ========================================

function deleteSchedule(index) {

    const trip =
        trips.find(
            t => t.id === selectedTripId
        );


    if (!trip) return;


    // 현재 화면의 DAY 찾기
    const activeDayButton =
        document.querySelector(
            ".day-tab.active"
        );


    const dayNumber =
        Number(
            activeDayButton.textContent
                .replace("DAY", "")
                .trim()
        );


    const day =
        trip.days.find(
            d => d.day === dayNumber
        );


    if (!day) return;


    if (
        !confirm(
            "이 일정을 삭제할까요?"
        )
    ) {
        return;
    }


    day.items.splice(index, 1);


    saveTrips();


    renderDayContent(
        trip,
        dayNumber
    );
}


// ========================================
// 시작
// ========================================

initializeTrips();

