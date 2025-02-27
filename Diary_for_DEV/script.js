let db; // 데이터베이스 객체 (auth.js에서 정의됨)
let unlockedTitles = JSON.parse(localStorage.getItem('unlockedTitles')) || [];

const banner = document.querySelector(".banner");
const messages = ["🚀 코드 한 줄이 세상을 바꾼다!", "🐞 버그 없는 코드? 신화일 뿐!"];
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
const levelDisplay = document.querySelector(".level-display");
const dropdownMenu = document.querySelector(".dropdown-menu"); // 두 번째 코드에서 추가된 요소

// 전역으로 캘린더 객체 접근 가능하도록 설정
let calendarInstance = null;

const currentUser = { // 현재 로그인한 유저 정보
    user_id: null,
    username: null,
    email: null,
    password: null,
    lv: 1,
    xp: 0,
    img: 'default_profile.png',
    highscore: 0,
    xpUp: function (xp) { // 경험치 증가
        this.xp += xp;
        console.log(`✅ 경험치 ${xp} 획득! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        const requiredXp = this.lv + 1;
        while (this.xp >= requiredXp) {
            this.xp -= requiredXp;
            this.lv++;
            console.log(`✨ 레벨 업! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        }
        try {
            db.exec("UPDATE user SET xp=?, lv=? WHERE user_id=?", [this.xp, this.lv, this.user_id]);
            saveUserToLocalStorage(); // 데이터베이스 저장
            updateLevelAndExp(); // UI 즉시 갱신
            if (calendarInstance) calendarInstance.render();
            console.log("✅ 데이터베이스에 경험치 및 레벨 업데이트 완료!");
        } catch (error) {
            console.error('XP 업데이트 실패:', error);
        }
    }
};

// 데이터베이스 초기화
async function initDatabase() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
        });

        db = new SQL.Database();
        db.run(`
            CREATE TABLE IF NOT EXISTS user (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                lv INTEGER DEFAULT 1,
                xp INTEGER DEFAULT 0,
                img TEXT DEFAULT 'default_profile.png'
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS diary_event (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                com_lang TEXT NOT NULL,
                memo TEXT,
                date TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES user(user_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS achievement (
                ach_id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                flavor TEXT NOT NULL,
                trigger TEXT NOT NULL,
                img TEXT NOT NULL
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS user_achievement (
                user_id INTEGER NOT NULL,
                ach_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(user_id),
                FOREIGN KEY (ach_id) REFERENCES achievement(ach_id),
                PRIMARY KEY (user_id, ach_id)
            );
        `);
        console.log("✅ 데이터베이스 초기화 완료!");
        loadDatabaseFromLocalStorage();
        console.log("✅ script.js에서 데이터베이스 사용 준비 완료!");
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
    }
}

// localStorage 에서 데이터베이스 불러오기
function loadDatabaseFromLocalStorage() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.length > 0) {
            userData[0].values.forEach(user => {
                db.run("INSERT OR IGNORE INTO user (user_id, username, email, password, lv, xp, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [user[0], user[1], user[2], user[3], user[4], user[5], user[6]]);
            });
            console.log("✅ user 테이블 데이터 로드 완료!");
        } else {
            console.warn("⚠️ 로컬 스토리지에 저장된 user 데이터가 없습니다.");
        }
        const diaryEventData = JSON.parse(localStorage.getItem('diary_event'));
        if (diaryEventData && diaryEventData.length > 0) {
            diaryEventData[0].values.forEach(event => {
                db.run("INSERT OR IGNORE INTO diary_event (event_id, user_id, title, com_lang, memo, date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [event[0], event[1], event[2], event[3], event[4], event[5], event[6]]);
            });
            console.log("✅ diary_event 테이블 데이터 로드 완료!");
        } else {
            console.warn("⚠️ 로컬 스토리지에 저장된 diary_event 데이터가 없습니다.");
        }
        const achievementData = JSON.parse(localStorage.getItem('achievement'));
        if (achievementData && achievementData.length > 0) {
            achievementData[0].values.forEach(achievement => {
                db.run("INSERT OR IGNORE INTO achievement (ach_id, title, flavor, trigger, img) VALUES (?, ?, ?, ?, ?)",
                    [achievement[0], achievement[1], achievement[2], achievement[3], achievement[4]]);
            });
            console.log("✅ achievement 테이블 데이터 로드 완료!");
        } else {
            console.warn("⚠️ 로컬 스토리지에 저장된 achievement 데이터가 없습니다.");
        }
        const userAchievementData = JSON.parse(localStorage.getItem('user_achievement'));
        if (userAchievementData && userAchievementData.length > 0) {
            userAchievementData[0].values.forEach(userAchievement => {
                db.run("INSERT OR IGNORE INTO user_achievement (user_id, ach_id) VALUES (?, ?)",
                    [userAchievement[0], userAchievement[1]]);
            });
            console.log("✅ user_achievement 테이블 데이터 로드 완료!");
        } else {
            console.warn("⚠️ 로컬 스토리지에 저장된 user_achievement 데이터가 없습니다.");
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

// 데이터베이스 저장 함수들
function saveUserToLocalStorage() {
    try {
        const user = db.exec("SELECT * FROM user");
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('current_user', JSON.stringify(user)); // 두 코드에서 사용
        console.log("✅ user 테이블 데이터 저장 완료!");
    } catch (error) {
        console.error('user 저장 실패:', error);
    }
}

function saveDiaryEventToLocalStorage() {
    try {
        const diary_event = db.exec("SELECT * FROM diary_event");
        localStorage.setItem('diary_event', JSON.stringify(diary_event));
        console.log("✅ diary_event 테이블 데이터 저장 완료!");
    } catch (error) {
        console.error('diary_event 저장 실패:', error);
    }
}

function saveAchievementToLocalStorage() {
    try {
        const achievement = db.exec("SELECT * FROM achievement");
        localStorage.setItem('achievement', JSON.stringify(achievement));
        console.log("✅ achievement 테이블 데이터 저장 완료!");
    } catch (error) {
        console.error('achievement 저장 실패:', error);
    }
}

function saveUserAchievementToLocalStorage() {
    try {
        const user_achievement = db.exec("SELECT * FROM user_achievement");
        localStorage.setItem('user_achievement', JSON.stringify(user_achievement));
        console.log("✅ user_achievement 테이블 데이터 저장 완료!");
    } catch (error) {
        console.error('user_achievement 저장 실패:', error);
    }
}

function updateLevelAndExp() {
    try {
        const requiredXp = currentUser.lv + 1;
        if (levelDisplay) levelDisplay.textContent = `LV: ${currentUser.lv}`;
        if (expBar) {
            expBar.textContent = `${currentUser.xp}/${requiredXp}`;
            const expPercentage = (currentUser.xp / requiredXp) * 100;
            expBar.style.width = `${expPercentage}%`;
        }
        console.log(`✅ 레벨 및 경험치 UI 업데이트: LV ${currentUser.lv}, XP ${currentUser.xp}/${requiredXp}`);
    } catch (error) {
        console.error('레벨 및 경험치 업데이트 실패:', error);
    }
}

// 회원 추가(콘솔용)
window.addUser = function(name, email, password) {
    try {
        db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [name, email, password]);
        saveUserToLocalStorage();
        displayUsers();
    } catch (error) {
        console.error('회원 추가 실패:', error);
    }
};

// 회원 목록 표시(콘솔용)
window.displayUsers = function() {
    try {
        const result = db.exec("SELECT * FROM user");
        console.log("✅ user 테이블:");
        console.log(result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('user 확인 실패:', error);
    }
};

// 회원 정보 수정(콘솔용)
window.updateUser = function(name, email, password, lv, xp, img, id) {
    try {
        db.run("UPDATE user SET username=?, email=?, password=?, lv=?, xp=?, img=? WHERE user_id=?", [name, email, password, lv, xp, img, id]);
        saveUserToLocalStorage();
        displayUsers();
    } catch (error) {
        console.error('회원 정보 수정 실패:', error);
    }
};

// 회원 삭제(콘솔용)
window.deleteUser = function(id) {
    try {
        db.run("DELETE FROM user WHERE user_id=?", [id]);
        saveUserToLocalStorage();
        displayUsers();
    } catch (error) {
        console.error('회원 삭제 실패:', error);
    }
};

// 로그인한 유저 확인(콘솔용)
window.checkCurrentUser = function() {
    console.log(currentUser);
};

// 데이터베이스 전체 상태 확인 함수 (전역 노출)
window.checkDatabase = function() {
    try {
        console.log("✅ 데이터베이스 상태 확인:");
        const users = db.exec("SELECT * FROM user");
        console.log("- user 테이블:");
        console.log(users.length > 0 ? users[0].values.map(row => Object.fromEntries(row.map((val, idx) => [users[0].columns[idx], val]))) : []);

        const diaryEvents = db.exec("SELECT * FROM diary_event");
        console.log("- diary_event 테이블:");
        console.log(diaryEvents.length > 0 ? diaryEvents[0].values.map(row => Object.fromEntries(row.map((val, idx) => [diaryEvents[0].columns[idx], val]))) : []);

        const achievements = db.exec("SELECT * FROM achievement");
        console.log("- achievement 테이블:");
        console.log(achievements.length > 0 ? achievements[0].values.map(row => Object.fromEntries(row.map((val, idx) => [achievements[0].columns[idx], val]))) : []);

        const userAchievements = db.exec("SELECT * FROM user_achievement");
        console.log("- user_achievement 테이블:");
        console.log(userAchievements.length > 0 ? userAchievements[0].values.map(row => Object.fromEntries(row.map((val, idx) => [userAchievements[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('데이터베이스 상태 확인 실패:', error);
    }
};

// 개별 테이블 확인 함수 (전역 노출)
window.displayDiaryEvents = function() {
    try {
        const result = db.exec("SELECT * FROM diary_event");
        console.log("✅ diary_event 테이블:");
        console.log(result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('diary_event 확인 실패:', error);
    }
};

window.displayAchievements = function() {
    try {
        const result = db.exec("SELECT * FROM achievement");
        console.log("✅ achievement 테이블:");
        console.log(result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('achievement 확인 실패:', error);
    }
};

window.displayUserAchievements = function() {
    try {
        const result = db.exec("SELECT * FROM user_achievement");
        console.log("✅ user_achievement 테이블:");
        console.log(result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('user_achievement 확인 실패:', error);
    }
};

// 이벤트 로드 함수 통합
function loadEventsFromLocalStorage() {
    try {
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
    } catch (error) {
        console.error('이벤트 로드 실패:', error);
        return [];
    }
}

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

// 업적 - 카테고리 매핑 객체 정의 { 카테고리, 완료 수, 칭호, 이미지 } // 테스트를 위해 조건을 낮게 수정!!
const achievementCategoryMap = {
    // Java
    "Java 첫걸음": { category: "Java", requiredCount: 1, title: "", condition: "Java 일정 1개 완료" },
    "Java 고수": { category: "Java", requiredCount: 2, title: "", condition: "Java 일정 2개 완료" },
    "Java의 신": { category: "Java", requiredCount: 3, title: "☕ Java의 신", condition: "Java 일정 3개 완료" },

    // Python
    "Python 첫걸음": { category: "Python", requiredCount: 1, title: "", condition: "Python 일정 1개 완료" },
    "Python 마스터": { category: "Python", requiredCount: 2, title: "", condition: "Python 일정 2개 완료" },
    "Python의 신": { category: "Python", requiredCount: 3, title: "🐍 Python의 신", condition: "Python 일정 3개 완료" },

    // JavaScript
    "JS 첫걸음": { category: "JavaScript", requiredCount: 1, title: "", condition: "JavaScript 일정 1개 완료" },
    "JS DOM의 달인": { category: "JavaScript", requiredCount: 2, title: "", condition: "JavaScript 일정 2개 완료" },
    "JS 마스터": { category: "JavaScript", requiredCount: 3, title: "🧩 JS 코드 마스터", condition: "JavaScript 일정 3개 완료" },

    // HTML
    "초보 프론트엔드": { category: "HTML", requiredCount: 1, title: "", condition: "HTML 일정 1개 완료" },
    "HTML 고수": { category: "HTML", requiredCount: 2, title: "", condition: "HTML 일정 2개 완료" },
    "HTML의 신": { category: "HTML", requiredCount: 3, title: "📜 HTML의 신, 🎨 CSS의 신", condition: "HTML 일정 3개 완료" },

    // SQL
    "SQL 첫걸음": { category: "SQL", requiredCount: 1, title: "", condition: "SQL 일정 1개 완료" },
    "SQL 고수": { category: "SQL", requiredCount: 2, title: "", condition: "SQL 일정 2개 완료" },
    "SQL의 신": { category: "SQL", requiredCount: 3, title: "🗄️ SQL의 신", condition: "SQL 일정 3개 완료" },

    // C
    "C 첫걸음": { category: "C", requiredCount: 1, title: "", condition: "C 일정 1개 완료" },
    "C 고수": { category: "C", requiredCount: 2, title: "", condition: "C 일정 2개 완료" },
    "C의 신": { category: "C", requiredCount: 3, title: "🔧 C의 신", condition: "C 일정 3개 완료" },

    // Cpp (C++)
    "C++ 첫걸음": { category: "Cpp", requiredCount: 1, title: "", condition: "C++ 일정 1개 완료" },
    "C++ 고수": { category: "Cpp", requiredCount: 2, title: "", condition: "C++ 일정 2개 완료" },
    "C++의 신": { category: "Cpp", requiredCount: 3, title: "⚙️ C++의 신", condition: "C++ 일정 3개 완료" },

    // Csharp (C#)
    "C# 첫걸음": { category: "Csharp", requiredCount: 1, title: "", condition: "C# 일정 1개 완료" },
    "C# 고수": { category: "Csharp", requiredCount: 2, title: "", condition: "C# 일정 2개 완료" },
    "C#의 신": { category: "Csharp", requiredCount: 3, title: "🎹 C#의 신", condition: "C# 일정 3개 완료" },

    // R
    "R 첫걸음": { category: "R", requiredCount: 1, title: "", condition: "R 일정 1개 완료" },
    "R 고수": { category: "R", requiredCount: 2, title: "", condition: "R 일정 2개 완료" },
    "R의 신": { category: "R", requiredCount: 3, title: "📊 R의 신", condition: "R 일정 3개 완료" },

    // Kotlin
    "Kotlin 첫걸음": { category: "Kotlin", requiredCount: 1, title: "", condition: "Kotlin 일정 1개 완료" },
    "Kotlin 고수": { category: "Kotlin", requiredCount: 2, title: "", condition: "Kotlin 일정 2개 완료" },
    "Kotlin의 신": { category: "Kotlin", requiredCount: 3, title: "🤖 Kotlin의 신", condition: "Kotlin 일정 3개 완료" },

    // General
    "정원 관리사": { category: "General", requiredCount: 1, title: "🏡 정원 관리사", condition: "어떤 일정 1개 완료" },
    "지옥에서 온": { category: "General", requiredCount: 2, title: "🔥 지옥에서 온", condition: "어떤 일정 2개 완료" },
    "코린이": { category: "General", requiredCount: 1, title: "🐣 코린이", condition: "어떤 일정 1개 완료" },
    "프로갓생러": { category: "General", requiredCount: 2, title: "🚀 프로 갓생러", condition: "어떤 일정 2개 완료" },
    "파워J": { category: "General", requiredCount: 3, title: "⚡ 파워 J", condition: "어떤 일정 3개 완료" },
    "자기계발왕": { category: "General", requiredCount: 4, title: "📚 자기계발 끝판왕", condition: "어떤 일정 4개 완료" },
    "닥터 스트레인지": { category: "General", requiredCount: 5, title: "⏳ 닥터 스트레인지", condition: "어떤 일정 5개 완료" },
};

const categoryColors = {
    Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
    JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
    Holiday: '#FF0000'
};

// 페이지 로드 시 실행 (두 코드의 DOMContentLoaded 통합)
document.addEventListener("DOMContentLoaded", async function () {
    await initDatabase();

    // 초기 상태 설정
    if (!calendarInstance) {
        const calendarEl = document.getElementById('calendar');
        if (calendarEl) {
            calendarInstance = new FullCalendar.Calendar(calendarEl, {
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
            calendarInstance.render();
            window.calendar = calendarInstance;
        } else {
            console.error("Calendar element not found!");
        }
    }

    if (profileInner) profileInner.classList.add("profileInvisible");
    if (expBarContainer) expBarContainer.classList.add("profileInvisible");
    if (medalBox) medalBox.classList.add("profileInvisible");
    if (userInfoLayout) userInfoLayout.classList.remove("profileInvisible");

    function changeBannerText() {
        if (banner) {
            const randomIndex = Math.floor(Math.random() * messages.length);
            banner.textContent = messages[randomIndex];
        }
    }
    changeBannerText();
    setInterval(changeBannerText, 3000);

    if (sidebar) {
        sidebar.addEventListener("mouseenter", function () {
            if (profileInner) profileInner.classList.remove("profileInvisible");
            if (expBarContainer) expBarContainer.classList.remove("profileInvisible");
            if (medalBox) {
                medalBox.classList.remove("profileInvisible");
                medalBox.style.height = "30%";
            }
            if (userInfoLayout) userInfoLayout.classList.add("profileInvisible");
            if (profileLayout) {
                profileLayout.style.marginTop = "0";
                profileLayout.style.marginBottom = "0";
            }
            if (profileImg) {
                profileImg.style.width = "140px";
                profileImg.style.height = "140px";
            }
            if (profile) profile.style.left = "70%";
            if (userInfoLayout) userInfoLayout.style.marginTop = "0";
            achievement_p.forEach(p => p.style.opacity = "1");
        });

        sidebar.addEventListener("mouseleave", function () {
            if (profileInner) profileInner.classList.add("profileInvisible");
            if (expBarContainer) expBarContainer.classList.add("profileInvisible");
            if (medalBox) {
                medalBox.classList.add("profileInvisible");
                medalBox.style.height = "0";
            }
            if (userInfoLayout) userInfoLayout.classList.remove("profileInvisible");
            if (profileImg) {
                profileImg.style.width = "170px";
                profileImg.style.height = "170px";
            }
            if (userInfoLayout) userInfoLayout.style.marginTop = "20%";
            achievement_p.forEach(p => p.style.opacity = "0");
        });
    }

    const categorySelect = document.getElementById("eventCategory");
    if (categorySelect) {
        const categories = Object.keys(categoryColors);
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // 업적 제목 스타일 설정
    content_title.forEach(title => {
        title.style.fontSize = "1.6em"; // 첫 번째 코드에서 1.6em 사용
        title.style.marginLeft = "1em";
        title.style.width = "300px"; // 두 번째 코드에서 300px 사용
    });

    // 로그인한 유저 정보 불러오기 및 닉네임 표시
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
        const idElement = document.querySelector(".id");
        if (idElement) idElement.textContent = currentUser.username;
        updateLevelAndExp(); // 초기 UI 설정
    } else {
        console.warn("⚠️ 로그인된 유저 정보가 없습니다.");
    }

    window.addEventToCalendar = function(date, title, category) {
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (!events[date]) events[date] = [];
            const exists = events[date].some(event => event.title === title && event.category === category);
            if (!exists) {
                events[date].push({ title, category, memo: '', completed: false });
                localStorage.setItem('events', JSON.stringify(events));

                // 기존 이벤트 제거 후 추가하여 중복 방지
                if (calendarInstance) {
                    calendarInstance.getEvents().forEach(event => {
                        if (event.startStr === date && event.title === `${title} (${category})`) {
                            event.remove();
                        }
                    });
                    calendarInstance.addEvent({
                        title: `${title} (${category})`,
                        start: date,
                        allDay: true,
                        backgroundColor: categoryColors[category],
                        borderColor: categoryColors[category],
                        extendedProps: { memo: '', completed: false }
                    });
                }

                // 로그인 확인 후 diary_event 에 삽입
                if (!currentUser.user_id) {
                    console.error("⚠️ 로그인이 필요합니다. user_id가 없습니다.");
                    alert("일정을 추가하려면 로그인이 필요합니다.");
                    return;
                }
                const existingEvents = db.exec("SELECT * FROM diary_event WHERE date = ? AND title = ? AND com_lang = ?", [date, title, category]);
                if (existingEvents.length === 0) {
                    db.run("INSERT INTO diary_event (user_id, title, com_lang, date, completed) VALUES (?, ?, ?, ?, ?)",
                        [currentUser.user_id, title, category, date, false]);
                    saveDiaryEventToLocalStorage();
                }
                console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
            } else {
                console.log(`이미 존재하는 일정: ${title} (${category})`);
            }
        } catch (error) {
            console.error('일정 추가 실패:', error);
        }
    };

    window.completeEvent = function(date, index) {
        // console.log("====completeEvent 호출됨====")
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (events[date] && events[date][index]) {
                const wasCompleted = events[date][index].completed;
                if (!wasCompleted) { // 첫 번째 코드의 조건 수정
                    events[date][index].completed = true;
                    localStorage.setItem('events', JSON.stringify(events));
                    currentUser.xpUp(1); // XP 증가 및 UI 갱신

                    // 캘린더 이벤트 실시간 업데이트
                    if (calendarInstance) {
                        const calendarEvents = calendarInstance.getEvents();
                        const targetEvent = calendarEvents.find(event =>
                            event.startStr === date && event.title === `${events[date][index].title} (${events[date][index].category})`
                        );
                        if (targetEvent) {
                            targetEvent.setExtendedProp('completed', true);
                            const titleElement = targetEvent.el ? targetEvent.el.querySelector('.fc-event-title') : null;
                            if (titleElement) {
                                titleElement.style.textDecoration = 'line-through';
                                console.log(`✅ 라인스루 적용: ${events[date][index].title}`);
                            } else {
                                console.warn('타이틀 요소를 찾을 수 없습니다.');
                                calendarInstance.render(); // 강제 렌더링
                            }
                        } else {
                            console.warn('캘린더에서 이벤트를 찾을 수 없습니다.');
                            calendarInstance.render(); // 강제 렌더링
                        }
                    }

                    const eventIdResult = db.exec("SELECT event_id FROM diary_event WHERE user_id=? AND date=? AND title=? AND com_lang=?",
                        [currentUser.user_id, date, events[date][index].title, events[date][index].category]);
                    if (eventIdResult.length > 0 && eventIdResult[0].values.length > 0) {
                        const eventId = eventIdResult[0].values[0][0];
                        db.run("UPDATE diary_event SET completed=TRUE WHERE event_id=?", [eventId]);
                        saveDiaryEventToLocalStorage();
                    } else {
                        console.warn('이벤트 ID를 찾을 수 없습니다.');
                    }
                    updateMedals();
                    console.log(`✅ 일정 완료: ${events[date][index].title}`);
                    if (calendarInstance) calendarInstance.render(); // 캘린더 전체 강제 렌더링
                    checkDatabase(); // 완료 후 데이터베이스 상태 확인
                }
            }
        } catch (error) {
            console.error('일정 완료 처리 실패:', error);
            if (calendarInstance) calendarInstance.render(); // 오류 발생 시에도 렌더링 시도
        }
    };

    function updateMedals() {
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            const completedCounts = {};
            let totalCompleted = 0;

            // 완료된 일정 수 계산
            for (const date in events) {
                events[date].forEach(event => {
                    if (event.completed) {
                        completedCounts[event.category] = (completedCounts[event.category] || 0) + 1;
                        totalCompleted++;
                    }
                });
            }

            // 디버깅 로그
            console.log("Completed Counts:", completedCounts);
            console.log("Total Completed:", totalCompleted);

            Object.keys(categoryColors).forEach(category => {
                const medal = document.getElementById(category.toLowerCase());
                if (medal) {
                    const count = completedCounts[category] || 0;
                    if (count >= 1) medal.classList.add('unlocked');
                    else medal.classList.remove('unlocked');
                }
            });

            const achievementItems = document.querySelectorAll('.achievementInner');
            const achievementContainer = document.querySelector('.achievement');
            if (achievementItems.length && achievementContainer) {
                const achievementStatus = {};

                achievementItems.forEach(item => {
                    const title = item.querySelector('h2').textContent.trim();
                    const mapping = achievementCategoryMap[title] || { category: "General", requiredCount: 1 };
                    const category = mapping.category;
                    const requiredCount = mapping.requiredCount;
                    const completedCount = completedCounts[category] || 0;
                    const isUnlocked = category === "General" ? totalCompleted >= requiredCount : completedCount >= requiredCount;

                    achievementStatus[title] = { item, isUnlocked, mapping };

                    const descriptionP = item.querySelector('.content p');

                    if (isUnlocked) {
                        item.classList.add('unlocked');
                        item.style.opacity = '1';
                        descriptionP.textContent = descriptionP.dataset.originalText || descriptionP.textContent;

                        // 업적 해금 시 칭호 추가
                        if (mapping.title && !item.dataset.titleAdded) {
                            const titles = mapping.title.split(',').map(t => t.trim());
                            titles.forEach(title => {
                                if (title && !unlockedTitles.includes(title)) {
                                    addTitleToDropdown(title);
                                }
                            });
                            item.dataset.titleAdded = 'true'; // 중복 추가 방지
                        }
                    } else {
                        item.classList.remove('unlocked');
                        item.style.opacity = '0.7';
                        if (!descriptionP.dataset.originalText) {
                            descriptionP.dataset.originalText = descriptionP.textContent;
                        }
                        descriptionP.textContent = mapping.condition || "해금 조건 미정";
                    }
                });

                // achievementCategoryMap의 순서대로 재정렬
                const unlockedItems = [];
                const lockedItems = [];

                Object.keys(achievementCategoryMap).forEach(title => {
                    const status = achievementStatus[title];
                    if (status) {
                        if (status.isUnlocked) unlockedItems.push(status.item);
                        else lockedItems.push(status.item);
                    }
                });

                // 컨테이너 비우고 순서대로 다시 추가
                achievementContainer.innerHTML = '';
                unlockedItems.forEach(item => achievementContainer.appendChild(item));
                lockedItems.forEach(item => achievementContainer.appendChild(item));
            }
            console.log("✅ 메달 상태 업데이트 완료");
        } catch (error) {
            console.error('메달 업데이트 실패:', error);
        }
    }

    function initializeTitles() {
        if (dropdownMenu) {
            dropdownMenu.innerHTML = '';
            const defaultItem = document.createElement('div');
            defaultItem.className = 'dropdown-item';
            defaultItem.textContent = ' ';
            defaultItem.addEventListener('click', () => {
                if (selectedTitle) {
                    selectedTitle.textContent = '  ';
                    selectedTitle.className = 'userTitle text-white fw-bold';
                }
            });
            dropdownMenu.appendChild(defaultItem);

            unlockedTitles.forEach(title => addTitleToDropdown(title));
        }
    }

    function addTitleToDropdown(title) {
        if (dropdownMenu && selectedTitle) {
            if (!unlockedTitles.includes(title)) {
                unlockedTitles.push(title);
                localStorage.setItem('unlockedTitles', JSON.stringify(unlockedTitles));
            }
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = title;
            item.addEventListener('click', () => {
                selectedTitle.textContent = title;
                selectedTitle.className = 'userTitle text-white fw-bold';
                if (title === "🔥 지옥에서 온") {
                    selectedTitle.classList.add('title-hell');
                    selectedTitle.style.fontSize = '0.8em';
                }
            });
            dropdownMenu.appendChild(item);
            console.log(`칭호 추가됨: ${title}`);
        }
    }

    let selectedEvent = null;
    function openModal(date, event) {
        const modal = document.getElementById('eventModal');
        const titleInput = document.getElementById('eventTitle');
        const categorySelect = document.getElementById('eventCategory');
        const memoInput = document.getElementById('eventMemo');
        const deleteBtn = document.getElementById('deleteEvent');
        window.selectedDate = date;

        if (modal && titleInput && categorySelect && memoInput && deleteBtn) {
            if (event) {
                selectedEvent = event;
                titleInput.value = event.title.split(' (')[0];
                categorySelect.value = event.title.match(/\(([^)]+)\)/)?.[1] || 'Java';
                memoInput.value = event.extendedProps.memo || '';
                deleteBtn.style.display = event.extendedProps.isHoliday ? 'none' : 'inline';
            } else {
                selectedEvent = null;
                titleInput.value = '';
                categorySelect.value = 'Java';
                memoInput.value = '';
                deleteBtn.style.display = 'none';
            }
            modal.style.display = 'block';
        }
    }

    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            const modal = document.getElementById('eventModal');
            if (modal) modal.style.display = 'none';
        };
    }

    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.onsubmit = function(e) {
            e.preventDefault();
            const title = document.getElementById('eventTitle').value.trim();
            const category = document.getElementById('eventCategory').value;
            const memo = document.getElementById('eventMemo').value.trim();
            const date = window.selectedDate;

            if (!title) {
                alert('일정을 입력하시오');
                return;
            }

            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (selectedEvent) {
                selectedEvent.remove();
                if (!events[date]) events[date] = [];
                events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
                alert('일정이 수정되었습니다!');
            } else {
                alert('일정이 등록되었습니다!');
            }

            if (!events[date]) events[date] = [];
            events[date].push({ title, category, memo, completed: false });
            localStorage.setItem('events', JSON.stringify(events));
            if (calendarInstance) {
                calendarInstance.addEvent({
                    title: `${title} (${category})`,
                    start: date,
                    allDay: true,
                    backgroundColor: categoryColors[category],
                    borderColor: categoryColors[category],
                    extendedProps: { memo, completed: false }
                });
            }

            const modal = document.getElementById('eventModal');
            if (modal) modal.style.display = 'none';
            eventForm.reset();
        };
    }

    const deleteEventBtn = document.getElementById('deleteEvent');
    if (deleteEventBtn) {
        deleteEventBtn.onclick = function() {
            if (selectedEvent && !selectedEvent.extendedProps.isHoliday && confirm('일정을 정말 삭제하시겠습니까?')) {
                const date = window.selectedDate;
                const events = JSON.parse(localStorage.getItem('events') || '{}');
                events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
                if (events[date].length === 0) delete events[date];
                localStorage.setItem('events', JSON.stringify(events));
                selectedEvent.remove();
                const modal = document.getElementById('eventModal');
                if (modal) modal.style.display = 'none';
                alert('일정이 삭제되었습니다!');
            }
        };
    }

    window.getQueryParam = function(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    };

    window.renderEvents = function(selectedDate, events) {
        const eventList = document.getElementById('event-list');
        const doneList = document.getElementById('done-list');
        if (!eventList || !doneList) return;

        eventList.innerHTML = '';
        doneList.innerHTML = '';

        if (selectedDate && events[selectedDate] && Array.isArray(events[selectedDate])) {
            events[selectedDate].forEach((event, index) => {
                const li = document.createElement('li');
                li.className = 'event-item';
                if (event.completed) {
                    li.innerHTML = `
                        <span>${event.title} (${event.category})</span>
                        <button class="edit-btn" data-index="${index}">수정</button>
                        <button class="delete-btn" data-index="${index}">삭제</button>
                    `;
                    doneList.appendChild(li);
                } else {
                    li.innerHTML = `
                        <input type="checkbox" data-index="${index}" ${event.completed ? 'checked' : ''}>
                        <span>${event.title} (${event.category})</span>
                        <button class="edit-btn" data-index="${index}">수정</button>
                        <button class="delete-btn" data-index="${index}">삭제</button>
                    `;
                    eventList.appendChild(li);
                }
            });
        }

        if (eventList.children.length === 0) {
            const li = document.createElement('li');
            li.className = 'no-events';
            li.textContent = '일정을 추가하세요!';
            eventList.appendChild(li);
        }
        if (doneList.children.length === 0) {
            const li = document.createElement('li');
            li.className = 'no-events';
            li.textContent = '완료된 항목이 없습니다.';
            doneList.appendChild(li);
        }
    };

    window.saveAndClose = function() {
        const selectedDate = window.getQueryParam('date');
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (window.opener && window.opener.calendar) {
            window.opener.calendar.refetchEvents();
        }
        window.close();
    };

    if (document.querySelector('.event')) {
        const selectedDate = window.getQueryParam('date');
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const eventDateElement = document.getElementById('event-date');
        if (eventDateElement) eventDateElement.textContent = selectedDate ? `📅 ${selectedDate}` : '날짜를 선택하세요';
        window.renderEvents(selectedDate, events);

        const addBtn = document.getElementById('add-btn');
        function addEventHandler() {
            const title = document.getElementById('new-title')?.value.trim();
            const category = document.getElementById('new-category')?.value;

            if (title && selectedDate) {
                if (!events[selectedDate]) events[selectedDate] = [];
                events[selectedDate].push({ title, category, completed: false });
                localStorage.setItem('events', JSON.stringify(events));

                if (window.opener && window.opener.addEventToCalendar) {
                    window.opener.addEventToCalendar(selectedDate, title, category);
                }

                window.renderEvents(selectedDate, events);
                document.getElementById('new-title').value = '';
            }
        }
        if (addBtn) {
            addBtn.addEventListener('click', addEventHandler);
        }

        const eventContainer = document.querySelector('.event');
        if (eventContainer) {
            eventContainer.addEventListener('click', function(e) {
                const target = e.target;
                const index = target.dataset.index;
                if (index === undefined) return;

                if (target.type === 'checkbox') {
                    const wasCompleted = events[selectedDate][index].completed;
                    events[selectedDate][index].completed = target.checked;
                    localStorage.setItem('events', JSON.stringify(events));
                    window.renderEvents(selectedDate, events);

                    if (!wasCompleted && target.checked && window.opener && window.opener.completeEvent) {
                        console.log(`체크박스 완료: ${selectedDate}, ${index}`);
                        window.opener.completeEvent(selectedDate, index);
                    }
                    if (window.opener && window.opener.calendar) {
                        window.opener.calendar.refetchEvents();
                    }
                } else if (target.classList.contains('edit-btn')) {
                    const event = events[selectedDate][index];
                    const titleInput = document.getElementById('new-title');
                    const categorySelect = document.getElementById('new-category');
                    const addBtn = document.getElementById('add-btn');

                    titleInput.value = event.title;
                    categorySelect.value = event.category;
                    addBtn.textContent = '수정 저장';
                    addBtn.dataset.editIndex = index;

                    addBtn.removeEventListener('click', addEventHandler);
                    addBtn.addEventListener('click', function editHandler() {
                        const newTitle = titleInput.value.trim();
                        const newCategory = categorySelect.value;

                        if (newTitle) {
                            events[selectedDate][index].title = newTitle;
                            events[selectedDate][index].category = newCategory;
                            localStorage.setItem('events', JSON.stringify(events));

                            if (window.opener && window.opener.calendar) {
                                window.opener.calendar.refetchEvents();
                            }

                            window.renderEvents(selectedDate, events);
                            titleInput.value = '';
                            addBtn.textContent = '+';
                            delete addBtn.dataset.editIndex;

                            addBtn.removeEventListener('click', editHandler);
                            addBtn.addEventListener('click', addEventHandler);
                        }
                    }, { once: true });
                } else if (target.classList.contains('delete-btn')) {
                    if (confirm('정말 삭제하시겠습니까?')) {
                        events[selectedDate].splice(index, 1);
                        if (events[selectedDate].length === 0) delete events[selectedDate];
                        localStorage.setItem('events', JSON.stringify(events));
                        window.renderEvents(selectedDate, events);

                        if (window.opener && window.opener.calendar) {
                            window.opener.calendar.refetchEvents();
                        }
                    }
                }
            });
        }
    }

    // 칭호 드랍다운
    if (dropdownItems) {
        dropdownItems.forEach(item => {
            item.addEventListener("click", function () {
                if (selectedTitle) selectedTitle.textContent = this.textContent;
            });
        });
    }

    // 버그헌터 게임종료시, game.js에서 메세지 받아 모달창 닫음
    window.addEventListener("message", function(event) {
        if (event.data.action === "closeModal") {
            var modalElement = document.getElementById('exampleModal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);

            if (modalInstance) {
                modalInstance.hide();
                console.log("game페이지로부터 메세지를 받아 모달 닫힘");
            }
        }
    });

    initializeTitles();
    updateMedals();
    updateLevelAndExp();
    console.log("addEventListener 실행 완료");
});