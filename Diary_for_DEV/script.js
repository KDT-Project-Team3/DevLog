let db; // 데이터베이스 객체
// const DB_NAME = 'sqliteDB'; // IndexedDB 데이터베이스 이름

const currentUser = { // 현재 로그인한 유저 정보
    user_id: null,
    username: null,
    email: null,
    password: null,
    lv: 1,
    xp: 0,
    img: 'default_profile.png',
    xpUp: function (xp) { // 경험치 증가
        this.xp += xp;
        console.log(`✅ 경험치 ${xp} 획득! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        if (this.xp >= this.lv + 1) {
            this.xp -= this.lv + 1;
            this.lv++;
            console.log(`✨ 레벨 업! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        }
        db.exec("UPDATE user SET xp=?, lv=? WHERE user_id=?", [this.xp, this.lv,this.user_id]);
        console.log("✅ 데이터베이스에 경험치 및 레벨 업데이트 완료!");
    }
};

// IndexedDB는 이슈 해결 전까지 사용하지 않음
// async function initDatabase() {
//     const SQL = await initSqlJs({
//         locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
//     });
//
//     // 1) 브라우저 IndexedDB 를 통한 초기화
//     const savedDb = await loadDBFromIdxDB();
//     if (savedDb) {
//         db = new SQL.Database(new Uint8Array(savedDb));
//         console.log("✅ 브라우저 IndexedDB 에서 데이터 초기화 완료!");
//         displayUsers();
//         return;
//     }
//
//     // 2) 새로운 데이터베이스 생성
//     db = new SQL.Database();
//     db.run(`
//         CREATE TABLE IF NOT EXISTS user (
//             user_id     INTEGER PRIMARY KEY AUTOINCREMENT,      -- 사용자 ID
//             username    TEXT UNIQUE NOT NULL COLLATE NOCASE,    -- 사용자 이름
//             email       TEXT UNIQUE NOT NULL,                   -- 이메일
//             password    TEXT NOT NULL,                          -- 비밀번호
//             lv          INTEGER DEFAULT 1,                      -- 레벨
//             xp          INTEGER DEFAULT 0,                      -- 경험치
//             img         TEXT DEFAULT 'default_profile.png'      -- 프로필 이미지
//         );
//     `);
//     db.run(`
//         CREATE TABLE IF NOT EXISTS diary_event (
//             event_id    INTEGER PRIMARY KEY AUTOINCREMENT,  -- 이벤트 ID
//             user_id     INTEGER NOT NULL,                   -- 사용자 ID
//             title       TEXT NOT NULL,                      -- 제목
//             com_lang    TEXT NOT NULL,                      -- 관련 언어
//             memo        TEXT,                               -- 메모
//             date        TEXT NOT NULL,                      -- 날짜
//             completed   BOOLEAN DEFAULT FALSE,              -- 완료 여부
//
//             FOREIGN KEY (user_id) REFERENCES user(user_id)
//         );
//     `);
//     db.run(`
//         CREATE TABLE IF NOT EXISTS achievement (
//             ach_id  INTEGER PRIMARY KEY AUTOINCREMENT,-- 업적 ID
//             title   TEXT NOT NULL,  -- 업적명
//             flavor  TEXT NOT NULL,  -- 업적 설명
//             trigger TEXT NOT NULL,  -- 업적 달성 조건
//             img     TEXT NOT NULL   -- 업적 이미지
//         );
//     `);
//     db.run(`
//         CREATE TABLE IF NOT EXISTS user_achievement (
//             user_id INTEGER NOT NULL,   -- 사용자 ID
//             ach_id  INTEGER NOT NULL,   -- 업적 ID
//
//             FOREIGN KEY (user_id) REFERENCES user(user_id),
//             FOREIGN KEY (ach_id) REFERENCES achievement(ach_id),
//             PRIMARY KEY (user_id, ach_id)
//         );
//     `);
//     console.warn("⚠️ 새로 브라우저 DB 생성 (빈 스키마 초기화)");
// }
//
// // 데이터베이스 IndexedDB에 저장
// function saveDBToIdxDB() {
//     const dbData = db.export();
//     const buffer = dbData.buffer; // ArrayBuffer 추출
//     const request = indexedDB.open(DB_NAME, 1);
//     request.onsuccess = (event) => {
//         const db = event.target.result;
//         // 오브젝트 스토어 존재 여부 확인
//         if (!db.objectStoreNames.contains("sqliteDB")) {
//             console.log("❌ 'sqliteDB' 오브젝트 스토어가 생성되지 않아 종료합니다.");
//         }
//         const transaction = db.transaction("sqliteDB", "readwrite");
//         const store = transaction.objectStore("sqliteDB");
//         const putRequest = store.put(buffer, "db");
//         putRequest.onsuccess = () => {
//             console.log("💾 데이터베이스가 IndexedDB에 안전하게 저장되었습니다.");
//         };
//         putRequest.onerror = (err) => {
//             console.error("❌ IndexedDB 저장 실패:", err);
//         };
//         // 트랜잭션 완료 시점까지 기다리기
//         transaction.oncomplete = () => {
//             console.log("✅ (DB 저장) IndexedDB 트랜잭션 완료");
//         }
//     };
//     request.onerror = (err) => {
//         console.error("❌ IndexedDB 열기 실패:", err);
//     };
//     request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         db.createObjectStore("sqliteDB");
//     };
// }
//
// // IndexedDB 에서 데이터베이스 불러오기
// async function loadDBFromIdxDB() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open(DB_NAME, 1);
//         request.onsuccess = (event) => {
//             const db = event.target.result;
//             // 오브젝트 스토어 존재 여부 확인
//             if (!db.objectStoreNames.contains("sqliteDB")) {
//                 console.warn("⚠️ 'sqliteDB' 오브젝트 스토어가 존재하지 않습니다.");
//                 resolve(null);
//                 return;
//             }
//             const transaction = db.transaction("sqliteDB", "readonly");
//             const store = transaction.objectStore("sqliteDB");
//             const getRequest = store.get("db");
//             getRequest.onsuccess = () => {
//                 resolve(getRequest.result ? getRequest.result.arrayBuffer() : null);
//             };
//             getRequest.onerror = () => reject("❌ 데이터베이스 로딩 실패");
//             // 트랜잭션 완료 시점 명확히 처리
//             transaction.oncomplete = () => {
//                 console.log("✅ IndexedDB 트랜잭션 완료");
//             };
//         };
//         request.onerror = () => reject("❌ IndexedDB 열기 실패");
//     });
// }

// 데이터베이스 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // sqliteDB 데이터베이스 생성
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
                                                   ach_id  INTEGER PRIMARY KEY AUTOINCREMENT,-- 칭호 ID
                                                   title   TEXT NOT NULL,  -- 칭호명
                                                   flavor  TEXT NOT NULL,  -- 칭호 설명
                                                   trigger TEXT NOT NULL,  -- 칭호 획득 조건
                                                   img     TEXT NOT NULL   -- 칭호 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_achievement (
                                                        user_id INTEGER NOT NULL,   -- 사용자 ID
                                                        ach_id  INTEGER NOT NULL,   -- 칭호 ID

                                                        FOREIGN KEY (user_id) REFERENCES user(user_id),
                                                        FOREIGN KEY (ach_id) REFERENCES achievement(ach_id),
                                                        PRIMARY KEY (user_id, ach_id)
        );
    `);
    console.log("✅ 데이터베이스 초기화 완료!");

    loadDatabaseFromLocalStorage();
}

// localStorage에 저장된 데이터베이스 불러오기
function loadDatabaseFromLocalStorage() {
    // user 테이블
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.length > 0) {
        userData[0].values.forEach(user => {
            db.run("INSERT INTO user (user_id, username, email, password, lv, xp, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [user[0], user[1], user[2], user[3], user[4], user[5], user[6]]);
        });
        console.log("✅ user 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 user 데이터가 없습니다.");
    }
    // diary_event 테이블
    const diaryEventData = JSON.parse(localStorage.getItem('diary_event'));
    if (diaryEventData && diaryEventData.length > 0) {
        diaryEventData[0].values.forEach(event => {
            db.run("INSERT INTO diary_event (event_id, user_id, title, com_lang, memo, date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [event[0], event[1], event[2], event[3], event[4], event[5], event[6]]);
        });
        console.log("✅ diary_event 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 diary_event 데이터가 없습니다.");
    }
    // achievement 테이블
    const achievementData = JSON.parse(localStorage.getItem('achievement'));
    if (achievementData && achievementData.length > 0) {
        achievementData[0].values.forEach(achievement => {
            db.run("INSERT INTO achievement (ach_id, title, flavor, trigger, img) VALUES (?, ?, ?, ?, ?)",
                [achievement[0], achievement[1], achievement[2], achievement[3], achievement[4]]);
        });
        console.log("✅ achievement 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 achievement 데이터가 없습니다.");
    }
    // user_achievement 테이블
    const userAchievementData = JSON.parse(localStorage.getItem('user_achievement'));
    if (userAchievementData && userAchievementData.length > 0) {
        userAchievementData[0].values.forEach(userAchievement => {
            db.run("INSERT INTO user_achievement (user_id, ach_id) VALUES (?, ?)",
                [userAchievement[0], userAchievement[1]]);
        });
        console.log("✅ user_achievement 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 user_achievement 데이터가 없습니다.");
    }
}

// user 테이블의 데이터 저장
function saveUserToLocalStorage() {
    const user = db.exec("SELECT * FROM user");
    localStorage.setItem('user', JSON.stringify(user));
    console.log("✅ user 테이블 데이터 저장 완료!");
}

// diary_event 테이블의 데이터 저장
function saveDiaryEventToLocalStorage() {
    const diary_event = db.exec("SELECT * FROM diary_event");
    localStorage.setItem('diary_event', JSON.stringify(diary_event));
    console.log("✅ diary_event 테이블 데이터 저장 완료!");
}

// achievement 테이블의 데이터 저장
function saveAchievementToLocalStorage() {
    const achievement = db.exec("SELECT * FROM achievement");
    localStorage.setItem('achievement', JSON.stringify(achievement));
    console.log("✅ achievement 테이블 데이터 저장 완료!");
}

// user_achievement 테이블의 데이터 저장
function saveUserAchievementToLocalStorage() {
    const user_achievement = db.exec("SELECT * FROM user_achievement");
    localStorage.setItem('user_achievement', JSON.stringify(user_achievement));
    console.log("✅ user_achievement 테이블 데이터 저장 완료!");
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

// 회원 정보 수정(콘솔용)
function updateUser(name, email, password, lv, xp, img, id) {
    db.run("UPDATE user SET username=?, email=?, password=?, lv=?, xp=?, img=? WHERE user_id=?", [name, email, password, lv, xp, img, id]);
    displayUsers();
}

// 회원 삭제(콘솔용)
function deleteUser(id) {
    db.run("DELETE FROM user WHERE user_id=?", [id]);
    displayUsers();
}

// 로그인한 유저 확인(콘솔용)
function checkCurrentUser() {
    console.log(currentUser);
}

// 페이지가 로드될 때 실행되는 이벤트 리스너
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.querySelector(".banner");
    const messages = ["🚀 코드 한 줄이 세상을 바꾼다!", "🐞 버그 없는 코드? 신화일 뿐!" /* 생략 */];
    const sidebar = document.querySelector(".sidebar");
    const profileLayout = document.querySelector(".profileLayout");
    const profileInner = document.querySelector(".profileInner");
    const profileImg = document.querySelector(".profileImg");
    const expBarContainer = document.querySelector(".exp-bar-container");
    const expBar = document.querySelector(".exp-bar");
    const medalBox = document.querySelector(".medalBox");
    const userInfoLayout = document.querySelector(".userInfoLayout");
    const profile = document.querySelector(".profile");
    const achievement_p = document.querySelectorAll(".achievement .content p");
    const content_title = document.querySelectorAll(".achievement .content h2");
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    const selectedTitle = document.getElementById("selectedTitle");
    const levelDisplay = document.querySelector(".LV h1");

    // 초기 상태 설정
    profileInner.classList.add("profileInvisible");
    expBarContainer.classList.add("profileInvisible");
    medalBox.classList.add("profileInvisible");
    userInfoLayout.classList.remove("profileInvisible");

    function changeBannerText() {
        const randomIndex = Math.floor(Math.random() * messages.length);
        banner.textContent = messages[randomIndex];
    }
    changeBannerText();
    setInterval(changeBannerText, 3000);

    sidebar.addEventListener("mouseenter", function () {
        profileInner.classList.remove("profileInvisible");
        expBarContainer.classList.remove("profileInvisible");
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
        expBarContainer.classList.add("profileInvisible");
        medalBox.classList.add("profileInvisible");
        medalBox.style.height = "0";
        userInfoLayout.classList.remove("profileInvisible");
        profileImg.style.width = "170px";
        profileImg.style.height = "170px";
        userInfoLayout.style.marginTop = "20%";
        achievement_p.forEach(p => p.style.opacity = "0");
    });

    const categoryColors = {
        Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
        JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
        Holiday: '#FF0000'
    };

    content_title.forEach(title => {
        title.style.fontSize = "1.6em";
        title.style.marginLeft = "1em";
        title.style.width = "150px";
    });

    // 로그인한 유저 정보 불러오기
    let tmp = JSON.parse(localStorage.getItem('current_user'));
    if (tmp && tmp.length > 0) {
        const user = tmp[0].values[0];
        currentUser.user_id = user[0];
        currentUser.username = user[1];
        currentUser.email = user[2];
        currentUser.password = user[3];
        currentUser.lv = user[4];
        currentUser.xp = user[5];
        currentUser.img = user[6];
    }

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
            window.open('check_event.html?date=' + info.dateStr, 'eventPopup', 'width=500,height=500');
        },
        eventClick: function(info) {
            window.open('check_event.html?date=' + info.event.startStr, 'eventPopup', 'width=500,height=500');
        },
        events: async function(fetchInfo, successCallback) {
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
    window.calendar = calendar;

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
                extendedProps: { memo: holiday.name || '', category: 'Holiday', isHoliday: true, completed: false }
            }));
        } catch (error) {
            console.error('공휴일 가져오기 오류:', error);
            return [];
        }
    }

    // 이벤트 추가 함수 (중복 체크 강화)
    window.addEventToCalendar = function(date, title, category) {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (!events[date]) events[date] = [];
        const exists = events[date].some(event => event.title === title && event.category === category);
        if (!exists) {
            events[date].push({ title, category, memo: '', completed: false });
            localStorage.setItem('events', JSON.stringify(events));
            // 캘린더에 이벤트 추가 후 중복 렌더링 방지를 위해 refetchEvents 호출 제거
            calendar.addEvent({
                title: `${title} (${category})`,
                start: date,
                allDay: true,
                backgroundColor: categoryColors[category],
                borderColor: categoryColors[category],
                extendedProps: { memo: '', completed: false }
            });
            console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
        } else {
            console.log(`이미 존재하는 일정: ${title} (${category})`);
        }
    };

    window.completeEvent = function(date, index) {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (events[date] && events[date][index]) {
            const wasCompleted = events[date][index].completed;
            if (!wasCompleted) {
                events[date][index].completed = true;
                localStorage.setItem('events', JSON.stringify(events));
                window.userData.xp += 1;
                console.log(`XP 증가: 현재 XP: ${window.userData.xp}`);
                checkLevelUp();
                updateLevelAndExp();
                updateMedals();
                window.calendar.refetchEvents();
            }
        }
    };

    function checkLevelUp() {
        const requiredXp = window.userData.level * 5;
        while (window.userData.xp >= requiredXp) {
            window.userData.level += 1;
            window.userData.xp -= requiredXp;
            console.log(`🎉 레벨업! 현재 레벨: ${window.userData.level}, 남은 XP: ${window.userData.xp}`);
        }
        localStorage.setItem('userData', JSON.stringify(window.userData));
    }

    function updateLevelAndExp() {
        const requiredXp = window.userData.level * 5;
        levelDisplay.textContent = `LV: ${window.userData.level}`;
        const expPercentage = (window.userData.xp / requiredXp) * 100;
        expBar.style.width = `${expPercentage}%`;
        expBar.textContent = `${window.userData.xp}/${requiredXp}`;
        localStorage.setItem('userData', JSON.stringify(window.userData));
    }

    function updateMedals() {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const completedCounts = {};
        for (const date in events) {
            events[date].forEach(event => {
                if (event.completed) {
                    completedCounts[event.category] = (completedCounts[event.category] || 0) + 1;
                }
            });
        }
        Object.keys(categoryColors).forEach(category => {
            const medal = document.getElementById(category.toLowerCase());
            if (medal) {
                const count = completedCounts[category] || 0;
                if (count >= 1) medal.classList.add('unlocked');
                else medal.classList.remove('unlocked');
            }
        });
    }
    updateMedals();

    dropdownItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedTitle.textContent = this.textContent;
        });
    });

    console.log("addEventListener 실행 완료");
});
document.addEventListener("DOMContentLoaded", async function() {
    await initDatabase();
});

function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem('events') || '{}');
    const eventList = [];
    const categoryColors = {
        Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
        JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
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
                extendedProps: { memo: event.memo || '', completed: event.completed || false }
            });
        });
    }
    return eventList;
}