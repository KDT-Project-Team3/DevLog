// DB 관련
let db; // 데이터베이스 객체
const DB_NAME = 'sqliteDB'; // IndexedDB 데이터베이스 이름

// SQLite 환경 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // 1) 브라우저 IndexedDB 를 통한 초기화
    const savedDb = await loadDBFromIdxDB();
    if (savedDb) {
        db = new SQL.Database(new Uint8Array(savedDb));
        console.log("✅ 브라우저 IndexedDB 에서 데이터 초기화 완료!");
        displayUsers();
        return;
    }

    // 2) 새로운 데이터베이스 생성
    db = new SQL.Database();
    db.run(`
        CREATE TABLE IF NOT EXISTS user (
            user_id     INTEGER PRIMARY KEY AUTOINCREMENT,      -- 사용자 ID
            username    TEXT UNIQUE NOT NULL COLLATE NOCASE,    -- 사용자 이름
            email       TEXT UNIQUE NOT NULL,                   -- 이메일
            password    TEXT NOT NULL,                          -- 비밀번호
            lv          INTEGER DEFAULT 1,                      -- 레벨
            xp          INTEGER DEFAULT 0,                      -- 경험치
            img         TEXT DEFAULT 'default_profile.png'      -- 프로필 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS diary_event (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT,  -- 이벤트 ID
            user_id     INTEGER NOT NULL,                   -- 사용자 ID
            title       TEXT NOT NULL,                      -- 제목
            com_lang    TEXT NOT NULL,                      -- 관련 언어
            memo        TEXT,                               -- 메모
            date        TEXT NOT NULL,                      -- 날짜
            completed   BOOLEAN DEFAULT FALSE,              -- 완료 여부
            
            FOREIGN KEY (user_id) REFERENCES user(user_id)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS achievement (
            ach_id  INTEGER PRIMARY KEY AUTOINCREMENT,-- 업적 ID
            title   TEXT NOT NULL,  -- 업적명
            flavor  TEXT NOT NULL,  -- 업적 설명
            trigger TEXT NOT NULL,  -- 업적 달성 조건
            img     TEXT NOT NULL   -- 업적 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_achievement (
            user_id INTEGER NOT NULL,   -- 사용자 ID
            ach_id  INTEGER NOT NULL,   -- 업적 ID
            
            FOREIGN KEY (user_id) REFERENCES user(user_id),
            FOREIGN KEY (ach_id) REFERENCES achievement(ach_id),
            PRIMARY KEY (user_id, ach_id)
        );
    `);
    console.warn("⚠️ 새로 브라우저 DB 생성 (빈 스키마 초기화)");
}

// 데이터베이스 IndexedDB에 저장
function saveDBToIdxDB() {
    const dbData = db.export();
    const buffer = dbData.buffer; // ArrayBuffer 추출
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (event) => {
        const db = event.target.result;
        // 오브젝트 스토어 존재 여부 확인
        if (!db.objectStoreNames.contains("sqliteDB")) {
            console.log("❌ 'sqliteDB' 오브젝트 스토어가 생성되지 않아 종료합니다.");
        }
        const transaction = db.transaction("sqliteDB", "readwrite");
        const store = transaction.objectStore("sqliteDB");
        const putRequest = store.put(buffer, "db");
        putRequest.onsuccess = () => {
            console.log("💾 데이터베이스가 IndexedDB에 안전하게 저장되었습니다.");
        };
        putRequest.onerror = (err) => {
            console.error("❌ IndexedDB 저장 실패:", err);
        };
        // 트랜잭션 완료 시점까지 기다리기
        transaction.oncomplete = () => {
            console.log("✅ (DB 저장) IndexedDB 트랜잭션 완료");
        }
    };
    request.onerror = (err) => {
        console.error("❌ IndexedDB 열기 실패:", err);
    };
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("sqliteDB");
    };
}

// IndexedDB 에서 데이터베이스 불러오기
async function loadDBFromIdxDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            // 오브젝트 스토어 존재 여부 확인
            if (!db.objectStoreNames.contains("sqliteDB")) {
                console.warn("⚠️ 'sqliteDB' 오브젝트 스토어가 존재하지 않습니다.");
                resolve(null);
                return;
            }
            const transaction = db.transaction("sqliteDB", "readonly");
            const store = transaction.objectStore("sqliteDB");
            const getRequest = store.get("db");
            getRequest.onsuccess = () => {
                resolve(getRequest.result ? getRequest.result.arrayBuffer() : null);
            };
            getRequest.onerror = () => reject("❌ 데이터베이스 로딩 실패");
            // 트랜잭션 완료 시점 명확히 처리
            transaction.oncomplete = () => {
                console.log("✅ IndexedDB 트랜잭션 완료");
            };
        };
        request.onerror = () => reject("❌ IndexedDB 열기 실패");
    });
}

// IndexedDB의 DB 삭제 (초기화)
// 텍스트 목적으로 콘솔에서만 사용할 것!
async function clearIdxDB() {
    console.log("🗑 IndexedDB 삭제 시작...");
    // 현재 IndexedDB 목록 가져오기
    const databases = await indexedDB.databases();
    const dbExists = databases.some(db => db.name === DB_NAME);
    if (!dbExists) {
        console.log("📂 IndexedDB가 존재하지 않음. 삭제 작업을 중단합니다.");
        return;  // ❌ DB가 없으면 함수 종료
    }

    console.log("🔒 열린 IndexedDB 닫기...");
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = (event) => {
        const db = event.target.result;
        db.close();  // DB 닫기
        console.log("✅ IndexedDB 연결 닫음. 삭제 시작...");
        deleteDatabase();
    };
    request.onerror = (err) => {
        console.error("❌ DB 열기 실패:", err);
    };
}

// 회원 추가(콘솔용)
function addUser(name, email, password) {
    db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [name, email, password]);
    displayUsers();
}

// 회원 목록 표시(콘솔용)
function displayUsers() {
    const result = db.exec("SELECT * FROM user");
    console.log(result);
}

// 회원 정보 수정(현재는 콘솔용)
function updateUser(name, email, password, lv, xp, img, id) {
    db.run("UPDATE user SET username=?, email=?, password=?, lv=?, xp=?, img=? WHERE user_id=?", [name, email, password, lv, xp, img, id]);
    displayUsers();
}

// 회원 삭제(현재는 콘솔용)
function deleteUser(id) {
    db.run("DELETE FROM user WHERE user_id=?", [id]);
    displayUsers();
}

// 페이지가 로드될 때 실행되는 이벤트 리스너
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.querySelector(".banner");
    const messages = [
        "🚀 코드 한 줄이 세상을 바꾼다!",
        "🐞 버그 없는 코드? 신화일 뿐!",
        "💡 주석이 없는 코드는 마법이다. 이해할 수 없으니까!",
        "🔨 '작동하면 건들지 마라' - 개발자의 철학",
        "⚡ console.log('디버깅 중...')",
        "🌎 Java는 커피, JavaScript는 스크립트!",
        "⏳ 99% 완료? 남은 1%가 99%의 시간!",
        "🔥 Git은 기억하지 않는다. 하지만 로그는 기억한다.",
        "🚧 내 코드는 잘 돌아가, 하지만 이유는 몰라!",
        "📌 Stack Overflow가 없으면 개발이 안 돼!",
        "🎯 '이건 임시 코드야' - 10년 지난 코드",
        "🖥️ '이상하네, 내 컴퓨터에서는 되는데?'",
        "💾 'Ctrl + S'는 내 생명줄",
        "📜 TODO: 나중에 리팩토링하기 (절대 안 함)",
        "🎭 CSS는 마법이다. 예상대로 동작할 때가 없다。",
        "🌐 HTML은 프로그래밍 언어가 아니다! 하지만 없으면 웹도 없다!",
        "💀 'undefined'는 개발자의 최악의 악몽",
        "📌 null과 undefined의 차이를 안다면 이미 고수다.",
        "🔁 while(true) { work(); sleep(0); } // 개발자의 현실",
        "🔧 '이건 쉬운 수정이야'라고 말하면 안 돼...",
        "🤯 개발자는 코드를 짜는 게 아니라 버그를 고치는 직업이다。",
        "🚀 컴파일은 성공했지만 실행은 안 된다? 축하합니다, 진정한 개발자입니다!",
        "🤖 AI가 코드를 짜는 날이 와도, 버그는 우리가 고쳐야 한다!",
        "💡 '일단 작동하게 만들고, 나중에 깔끔하게 정리하자' - 영원히 정리되지 않음",
        "🔥 '이거 왜 안 돼?' 보다 더 무서운 말: '이거 왜 돼?'",
        "🕵️ '네트워크 문제일 수도 있어' - 모든 문제의 만능 변명",
        "🐛 '이거 분명히 어제는 잘 됐는데…'",
        "🔄 '새벽 2시에 급하게 수정한 코드가 제일 오래 살아남는다'",
        "🛠️ '한 줄만 바꿨는데, 다 망가졌다'",
        "🎭 '리팩토링'이란 코드를 고치는 게 아니라 다시 짜는 것",
        "🚀 '이거 프로덕션에 올려도 괜찮겠지?' - 가장 위험한 말",
        "💾 '우리 서비스는 안전해! 매일 AWS에 5달러를 쓰고 있거든!'",
        "🤯 '이 코드를 작성한 사람 누구야?' (Git blame 했더니 나옴)",
        "🕶️ '이거 대충 짜고 나중에 고치자' = 절대 고치지 않음",
        "💀 '설마 이거 한 줄 바꾼다고 터지겠어?' -> 터짐",
        "🕹️ '야, 이거 왜 안 돼?' '캐시 지웠어?' '어…'",
        "🧩 '배포 전에 테스트 해봤어?' '아니, 근데 내 로컬에서는 잘 됐어!'",
        "🔎 '네가 짠 코드인데 이해 못 하는 건 정상임'",
        "👾 '이거 버그야?' '아냐, 기능이야'",
        "💡 '개발자는 코드를 작성하는 게 아니라 Stack Overflow에서 카피 & 페이스트하는 직업이다'",
        "🚀 '마지막 수정이에요!' - 무조건 한 번 더 수정하게 됨",
        "🔄 'npm install' 했다가 프로젝트 터지는 중…",
        "🔑 '비밀번호는 1234로 해두자, 나중에 바꾸면 돼' -> 절대 안 바꿈",
        "💥 '이 코드 지워도 돼?' -> (지운 후) -> '어… 다시 살려야 할 것 같은데?'",
        "📊 '이거 왜 빨라?' -> 원인 모름",
        "📉 '이거 왜 느려?' -> 원인 모름",
        "🔥 '이 코드 완벽해!' -> 배포 후 에러 로그 폭발",
        "👨‍💻 '개발자는 기획서를 보고 개발하는 게 아니라, 기획자와 싸우면서 개발한다'",
        "🧐 '이 코드 누가 짰어?' (Git blame) -> '아… 나네'",
        "🔍 '이게 왜 안 돼?' (5시간 후) -> '아, 세미콜론 하나 빠졌네'",
        "🎮 '게임 한 판만 하고 일해야지' -> 새벽 3시",
        "🛠️ '다시 실행해보세요' -> 만능 해결책",
        "🔄 '야, 이거 다시 시작해봤어?' -> 개발자 기술지원 1단계",
        "🚀 '아무도 안 건드렸는데 갑자기 안 돼요!' -> 자동으로 고장 난 서버는 없다"
    ];
    const sidebar = document.querySelector(".sidebar");
    const profileLayout = document.querySelector(".profileLayout");
    const profileInner = document.querySelector(".profileInner");
    const profileImg = document.querySelector(".profileImg");
    const expBar = document.querySelector(".exp");
    const medalBox = document.querySelector(".medalBox");
    const userInfoLayout = document.querySelector(".userInfoLayout");
    const profile = document.querySelector(".profile");
    const achievement_p = document.querySelectorAll(".achievement .content p");
    const content_title = document.querySelectorAll(".achievement .content h2");
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    const selectedTitle = document.getElementById("selectedTitle");

    // 초기 상태 설정
    profileInner.classList.add("profileInvisible");
    expBar.classList.add("profileInvisible");
    medalBox.classList.add("profileInvisible");
    userInfoLayout.classList.remove("profileInvisible");

    // 배너 문구를 랜덤으로 표시하는 함수
    function changeBannerText() {
        const randomIndex = Math.floor(Math.random() * messages.length);
        banner.textContent = messages[randomIndex];
    }
    changeBannerText();
    setInterval(changeBannerText, 3000);

    // 사이드바 호버 이벤트
    sidebar.addEventListener("mouseenter", function () {
        profileInner.classList.remove("profileInvisible");
        expBar.classList.remove("profileInvisible");
        medalBox.classList.remove("profileInvisible");
        medalBox.style.height = "30%";
        userInfoLayout.classList.add("profileInvisible");

        profileLayout.style.marginTop = "0";
        profileLayout.style.marginBottom = "0";
        profileImg.style.width = "140px";
        profileImg.style.height = "140px";
        profile.style.left = "70%";
        userInfoLayout.style.marginTop = "0";

        achievement_p.forEach(p => p.style.opacity = "1");
    });

    sidebar.addEventListener("mouseleave", function () {
        profileInner.classList.add("profileInvisible");
        expBar.classList.add("profileInvisible");
        medalBox.classList.add("profileInvisible");
        medalBox.style.height = "0";
        userInfoLayout.classList.remove("profileInvisible");

        profileImg.style.width = "170px";
        profileImg.style.height = "170px";
        userInfoLayout.style.marginTop = "20%";

        achievement_p.forEach(p => p.style.opacity = "0");
    });

    // 카테고리별 색상 정의
    const categoryColors = {
        Java: '#ff7a33',
        C: '#0000FF',
        JavaScript: '#ffae00',
        HTML: '#008000',
        Holiday: '#FF0000'
    };

    content_title.forEach(title => {
        title.style.fontSize = "1.6em";
        title.style.marginLeft = "1em";
        title.style.width = "150px";
    });

    // 캘린더 초기화
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        height: '700px',
        locale: 'ko',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        initialDate: '2025-02-26',
        selectable: true,
        dateClick: function(info) {
            window.open('check_event.html?date=' + info.dateStr, 'eventPopup',
                'width=500,height=500,top=100,left=100,scrollbars=no,resizable=no');
        },
        eventClick: function(info) {
            window.open('check_event.html?date=' + info.event.startStr, 'eventPopup',
                'width=500,height=500,top=100,left=100,scrollbars=no,resizable=no');
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            const localEvents = loadEventsFromLocalStorage();
            const holidayEvents = await fetchHolidays();
            successCallback([...localEvents, ...holidayEvents]);
        },
        eventDidMount: function(info) {
            if (info.event.extendedProps.completed) {
                info.el.querySelector('.fc-event-title').style.textDecoration = 'line-through';
            }
        }
    });
    calendar.render();

    // 공휴일 데이터 가져오기
    async function fetchHolidays() {
        const url = 'https://date.nager.at/api/v3/publicholidays/2025/KR';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
            const holidays = await response.json();
            return holidays.map(holiday => ({
                title: holiday.localName,
                start: holiday.date,
                allDay: true,
                backgroundColor: categoryColors['Holiday'],
                borderColor: categoryColors['Holiday'],
                extendedProps: {
                    memo: holiday.name || '',
                    category: 'Holiday',
                    isHoliday: true,
                    completed: false
                }
            }));
        } catch (error) {
            console.error('공휴일 가져오기 오류:', error);
            return [];
        }
    }

    // 캘린더에 이벤트 추가
    window.addEventToCalendar = function(date, title, category) {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (!events[date]) events[date] = [];
        events[date].push({ title, category, memo: '', completed: false });
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent({
            title: `${title} (${category})`,
            start: date,
            allDay: true,
            backgroundColor: categoryColors[category],
            borderColor: categoryColors[category],
            extendedProps: { memo: '', completed: false }
        });
        content_title.forEach(title => {
            title.style.fontSize = "2em";
            title.style.marginLeft = "1em";
            title.style.width = "200px";
        });
        console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
    };

    // 칭호 드랍다운
    dropdownItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedTitle.textContent = this.textContent;
        });
    });

    console.log("addEventListener 실행 완료");
});

// 로컬 스토리지에서 이벤트 불러오기
function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem('events') || '{}');
    const eventList = [];
    const categoryColors = {
        Java: '#ff7a33',
        C: '#0000FF',
        JavaScript: '#ffae00',
        HTML: '#008000',
        Holiday: '#FF0000'
    };
    for (const date in events) {
        events[date].forEach(event => {
            eventList.push({
                title: `${event.title} (${event.category})`,
                start: date,
                allDay: true,
                backgroundColor: categoryColors[event.category],
                borderColor: categoryColors[event.category],
                extendedProps: {
                    memo: event.memo,
                    completed: event.completed || false
                }
            });
        });
    }
    return eventList;
}