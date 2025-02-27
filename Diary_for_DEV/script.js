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
const dropdownMenu = document.getElementById("dropdownMenu"); // 누락된 요소 추가 가정

let calendarInstance = null;

const currentUser = {
    user_id: null,
    username: null,
    email: null,
    password: null,
    lv: 1,
    xp: 0,
    img: 'default_profile.png',
    highscore: 0,
    xpUp: function (xp) {
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
            saveUserToLocalStorage();
            updateLevelAndExp();
            calendarInstance?.render();
            console.log("✅ 데이터베이스에 경험치 및 레벨 업데이트 완료!");
        } catch (error) {
            console.error('XP 업데이트 실패:', error);
        }
    }
};

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
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
    }
}

function loadDatabaseFromLocalStorage() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData?.length > 0) {
            userData[0].values.forEach(user => {
                db.run("INSERT OR IGNORE INTO user (user_id, username, email, password, lv, xp, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [user[0], user[1], user[2], user[3], user[4], user[5], user[6]]);
            });
            console.log("✅ user 테이블 데이터 로드 완료!");
        }
        const diaryEventData = JSON.parse(localStorage.getItem('diary_event'));
        if (diaryEventData?.length > 0) {
            diaryEventData[0].values.forEach(event => {
                db.run("INSERT OR IGNORE INTO diary_event (event_id, user_id, title, com_lang, memo, date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [event[0], event[1], event[2], event[3], event[4], event[5], event[6]]);
            });
            console.log("✅ diary_event 테이블 데이터 로드 완료!");
        }
        const achievementData = JSON.parse(localStorage.getItem('achievement'));
        if (achievementData?.length > 0) {
            achievementData[0].values.forEach(achievement => {
                db.run("INSERT OR IGNORE INTO achievement (ach_id, title, flavor, trigger, img) VALUES (?, ?, ?, ?, ?)",
                    [achievement[0], achievement[1], achievement[2], achievement[3], achievement[4]]);
            });
            console.log("✅ achievement 테이블 데이터 로드 완료!");
        }
        const userAchievementData = JSON.parse(localStorage.getItem('user_achievement'));
        if (userAchievementData?.length > 0) {
            userAchievementData[0].values.forEach(userAchievement => {
                db.run("INSERT OR IGNORE INTO user_achievement (user_id, ach_id) VALUES (?, ?)",
                    [userAchievement[0], userAchievement[1]]);
            });
            console.log("✅ user_achievement 테이블 데이터 로드 완료!");
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

function saveUserToLocalStorage() {
    try {
        const user = db.exec("SELECT * FROM user");
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('current_user', JSON.stringify(user));
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

document.addEventListener("DOMContentLoaded", async function () {
    await initDatabase();

    // 초기 UI 설정
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

    const categoryColors = {
        Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
        JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
        Holiday: '#FF0000'
    };

    const categorySelect = document.getElementById("eventCategory");
    if (categorySelect) {
        Object.keys(categoryColors).forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    const achievementCategoryMap = {
        "Java 첫걸음": { category: "Java", requiredCount: 1, title: "", condition: "Java 일정 1개 완료" },
        "Java 고수": { category: "Java", requiredCount: 2, title: "", condition: "Java 일정 2개 완료" },
        "Java의 신": { category: "Java", requiredCount: 3, title: "☕ Java의 신", condition: "Java 일정 3개 완료" },
        "Python 첫걸음": { category: "Python", requiredCount: 1, title: "", condition: "Python 일정 1개 완료" },
        "Python 마스터": { category: "Python", requiredCount: 2, title: "", condition: "Python 일정 2개 완료" },
        "Python의 신": { category: "Python", requiredCount: 3, title: "🐍 Python의 신", condition: "Python 일정 3개 완료" },
        "JS 첫걸음": { category: "JavaScript", requiredCount: 1, title: "", condition: "JavaScript 일정 1개 완료" },
        "JS DOM의 달인": { category: "JavaScript", requiredCount: 2, title: "", condition: "JavaScript 일정 2개 완료" },
        "JS 마스터": { category: "JavaScript", requiredCount: 3, title: "🧩 JS 코드 마스터", condition: "JavaScript 일정 3개 완료" },
        "초보 프론트엔드": { category: "HTML", requiredCount: 1, title: "", condition: "HTML 일정 1개 완료" },
        "HTML 고수": { category: "HTML", requiredCount: 2, title: "", condition: "HTML 일정 2개 완료" },
        "HTML의 신": { category: "HTML", requiredCount: 3, title: "📜 HTML의 신, 🎨 CSS의 신", condition: "HTML 일정 3개 완료" },
        "SQL 첫걸음": { category: "SQL", requiredCount: 1, title: "", condition: "SQL 일정 1개 완료" },
        "SQL 고수": { category: "SQL", requiredCount: 2, title: "", condition: "SQL 일정 2개 완료" },
        "SQL의 신": { category: "SQL", requiredCount: 3, title: "🗄️ SQL의 신", condition: "SQL 일정 3개 완료" },
        "C 첫걸음": { category: "C", requiredCount: 1, title: "", condition: "C 일정 1개 완료" },
        "C 고수": { category: "C", requiredCount: 2, title: "", condition: "C 일정 2개 완료" },
        "C의 신": { category: "C", requiredCount: 3, title: "🔧 C의 신", condition: "C 일정 3개 완료" },
        "C++ 첫걸음": { category: "Cpp", requiredCount: 1, title: "", condition: "C++ 일정 1개 완료" },
        "C++ 고수": { category: "Cpp", requiredCount: 2, title: "", condition: "C++ 일정 2개 완료" },
        "C++의 신": { category: "Cpp", requiredCount: 3, title: "⚙️ C++의 신", condition: "C++ 일정 3개 완료" },
        "C# 첫걸음": { category: "Csharp", requiredCount: 1, title: "", condition: "C# 일정 1개 완료" },
        "C# 고수": { category: "Csharp", requiredCount: 2, title: "", condition: "C# 일정 2개 완료" },
        "C#의 신": { category: "Csharp", requiredCount: 3, title: "🎹 C#의 신", condition: "C# 일정 3개 완료" },
        "R 첫걸음": { category: "R", requiredCount: 1, title: "", condition: "R 일정 1개 완료" },
        "R 고수": { category: "R", requiredCount: 2, title: "", condition: "R 일정 2개 완료" },
        "R의 신": { category: "R", requiredCount: 3, title: "📊 R의 신", condition: "R 일정 3개 완료" },
        "Kotlin 첫걸음": { category: "Kotlin", requiredCount: 1, title: "", condition: "Kotlin 일정 1개 완료" },
        "Kotlin 고수": { category: "Kotlin", requiredCount: 2, title: "", condition: "Kotlin 일정 2개 완료" },
        "Kotlin의 신": { category: "Kotlin", requiredCount: 3, title: "🤖 Kotlin의 신", condition: "Kotlin 일정 3개 완료" },
        "정원 관리사": { category: "General", requiredCount: 1, title: "🏡 정원 관리사", condition: "어떤 일정 1개 완료" },
        "지옥에서 온": { category: "General", requiredCount: 2, title: "🔥 지옥에서 온", condition: "어떤 일정 2개 완료" },
        "코린이": { category: "General", requiredCount: 1, title: "🐣 코린이", condition: "어떤 일정 1개 완료" },
        "프로갓생러": { category: "General", requiredCount: 2, title: "🚀 프로 갓생러", condition: "어떤 일정 2개 완료" },
        "파워J": { category: "General", requiredCount: 3, title: "⚡ 파워 J", condition: "어떤 일정 3개 완료" },
        "자기계발왕": { category: "General", requiredCount: 4, title: "📚 자기계발 끝판왕", condition: "어떤 일정 4개 완료" },
        "닥터 스트레인지": { category: "General", requiredCount: 5, title: "⏳ 닥터 스트레인지", condition: "어떤 일정 5개 완료" },
    };

    content_title.forEach(title => {
        title.style.fontSize = "1.3em";
        title.style.marginLeft = "0.2em";
        title.style.width = "300px";
    });

    // 로그인한 유저 정보 불러오기
    const tmp = JSON.parse(localStorage.getItem('current_user'));
    if (tmp?.length > 0) {
        const user = tmp[0].values[0];
        currentUser.user_id = user[0];
        currentUser.username = user[1];
        currentUser.email = user[2];
        currentUser.password = user[3];
        currentUser.lv = user[4];
        currentUser.xp = user[5];
        currentUser.img = user[6];
        document.querySelector(".id").textContent = currentUser.username;
        updateLevelAndExp();
    } else {
        console.warn("⚠️ 로그인된 유저 정보가 없습니다.");
    }

    // 캘린더 초기화
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
        calendarInstance.render();
        window.calendar = calendarInstance;
    }

    async function fetchHolidays() {
        try {
            const response = await fetch('https://date.nager.at/api/v3/publicholidays/2025/KR');
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

    window.addEventToCalendar = function(date, title, category) {
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (!events[date]) events[date] = [];
            const exists = events[date].some(event => event.title === title && event.category === category);
            if (!exists) {
                events[date].push({ title, category, memo: '', completed: false });
                localStorage.setItem('events', JSON.stringify(events));
                calendarInstance.addEvent({
                    title: `${title} (${category})`,
                    start: date,
                    allDay: true,
                    backgroundColor: categoryColors[category],
                    borderColor: categoryColors[category],
                    extendedProps: { memo: '', completed: false }
                });
                if (currentUser.user_id) {
                    db.run("INSERT INTO diary_event (user_id, title, com_lang, date) VALUES (?, ?, ?, ?)",
                        [currentUser.user_id, title, category, date]);
                    saveDiaryEventToLocalStorage();
                }
                console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
            }
        } catch (error) {
            console.error('일정 추가 실패:', error);
        }
    };

    window.completeEvent = function(date, index) {
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (events[date] && events[date][index]) {
                if (!events[date][index].completed) {
                    events[date][index].completed = true;
                    localStorage.setItem('events', JSON.stringify(events));
                    currentUser.xpUp(1);

                    const calendarEvents = calendarInstance.getEvents();
                    const targetEvent = calendarEvents.find(event =>
                        event.startStr === date && event.title === `${events[date][index].title} (${events[date][index].category})`
                    );
                    if (targetEvent) {
                        targetEvent.setExtendedProp('completed', true);
                        const titleElement = targetEvent.el?.querySelector('.fc-event-title');
                        if (titleElement) titleElement.style.textDecoration = 'line-through';
                    }

                    const eventIdResult = db.exec("SELECT event_id FROM diary_event WHERE user_id=? AND date=? AND title=? AND com_lang=?",
                        [currentUser.user_id, date, events[date][index].title, events[date][index].category]);
                    if (eventIdResult.length > 0 && eventIdResult[0].values.length > 0) {
                        const eventId = eventIdResult[0].values[0][0];
                        db.run("UPDATE diary_event SET completed=TRUE WHERE event_id=?", [eventId]);
                        saveDiaryEventToLocalStorage();
                    }
                    updateMedals();
                    console.log(`✅ 일정 완료: ${events[date][index].title}`);
                }
            }
        } catch (error) {
            console.error('일정 완료 처리 실패:', error);
            calendarInstance.render();
        }
    };

    function updateMedals() {
        try {
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
                    medal.classList.toggle('unlocked', count >= 1);
                }
            });
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

    // 콘솔용 디버깅 함수
    window.addUser = function(name, email, password) {
        try {
            db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [name, email, password]);
            saveUserToLocalStorage();
            displayUsers();
        } catch (error) {
            console.error('회원 추가 실패:', error);
        }
    };

    window.displayUsers = function() {
        try {
            const result = db.exec("SELECT * FROM user");
            console.log("✅ user 테이블:", result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
        } catch (error) {
            console.error('user 확인 실패:', error);
        }
    };

    window.checkDatabase = function() {
        try {
            console.log("✅ 데이터베이스 상태 확인:");
            const tables = ['user', 'diary_event', 'achievement', 'user_achievement'];
            tables.forEach(table => {
                const result = db.exec(`SELECT * FROM ${table}`);
                console.log(`- ${table} 테이블:`, result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
            });
        } catch (error) {
            console.error('데이터베이스 상태 확인 실패:', error);
        }
    };

    initializeTitles();
    updateMedals();
});

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