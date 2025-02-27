let db; // 데이터베이스 객체

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


function updateLevelAndExp() {
    try {
        const requiredXp = currentUser.lv + 1;
        levelDisplay.textContent = `LV: ${currentUser.lv}`;
        expBar.textContent = `${currentUser.xp}/${requiredXp}`;
        const expPercentage = (currentUser.xp / requiredXp) * 100;
        expBar.style.width = `${expPercentage}%`;
        console.log(`✅ 레벨 및 경험치 UI 업데이트: LV ${currentUser.lv}, XP ${currentUser.xp}/${requiredXp}`);
    } catch (error) {
        console.error('레벨 및 경험치 업데이트 실패:', error);
    }
}

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
            this.xp = 0;
            this.lv++;
            console.log(`✨ 레벨 업! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        }
        try {
            db.exec("UPDATE user SET xp=?, lv=? WHERE user_id=?", [this.xp, this.lv, this.user_id]);
            saveUserToLocalStorage(); // 데이터베이스 저장
            updateLevelAndExp(); // UI 즉시 갱신
            console.log("✅ 데이터베이스에 경험치 및 레벨 업데이트 완료!");
        } catch (error) {
            console.error('XP 업데이트 실패:', error);
        }
    }
};

// 전역으로 캘린더 객체 접근 가능하도록 설정
let calendarInstance = null;

// 데이터베이스 초기화
async function initDatabase() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
        });

        db = new SQL.Database();
        db.run(`
            CREATE TABLE IF NOT EXISTS user (
                                                user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
                                                username    TEXT UNIQUE NOT NULL COLLATE NOCASE,
                                                email       TEXT UNIQUE NOT NULL,
                                                password    TEXT NOT NULL,
                                                lv          INTEGER DEFAULT 1,
                                                xp          INTEGER DEFAULT 0,
                                                img         TEXT DEFAULT 'default_profile.png'
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS diary_event (
                                                       event_id    INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       user_id     INTEGER NOT NULL,
                                                       title       TEXT NOT NULL,
                                                       com_lang    TEXT NOT NULL,
                                                       memo        TEXT,
                                                       date        TEXT NOT NULL,
                                                       completed   BOOLEAN DEFAULT FALSE,
                                                       FOREIGN KEY (user_id) REFERENCES user(user_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS achievement (
                                                       ach_id  INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       title   TEXT NOT NULL,
                                                       flavor  TEXT NOT NULL,
                                                       trigger TEXT NOT NULL,
                                                       img     TEXT NOT NULL
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS user_achievement (
                                                            user_id INTEGER NOT NULL,
                                                            ach_id  INTEGER NOT NULL,
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

// 회원 추가(콘솔용)
window.addUser = function(name, email, password) {
    try {
        db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [name, email, password]);
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
        displayUsers();
    } catch (error) {
        console.error('회원 정보 수정 실패:', error);
    }
};

// 회원 삭제(콘솔용)
window.deleteUser = function(id) {
    try {
        db.run("DELETE FROM user WHERE user_id=?", [id]);
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

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {

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
        document.querySelector(".id").textContent = currentUser.username;
        updateLevelAndExp(); // 초기 UI 설정
    } else {
        console.warn("⚠️ 로그인된 유저 정보가 없습니다.");
    }

    // 캘린더 초기화
    const calendarEl = document.getElementById('calendar');
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

    async function fetchHolidays() {
        try {
            const url = 'https://date.nager.at/api/v3/publicholidays/2025/KR';
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

    window.addEventToCalendar = function(date, title, category) {
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (!events[date]) events[date] = [];
            const exists = events[date].some(event => event.title === title && event.category === category);
            if (!exists) {
                events[date].push({ title, category, memo: '', completed: false });
                localStorage.setItem('events', JSON.stringify(events));

                // 기존 이벤트 제거 후 추가하여 중복 방지
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

                // 로그인 확인 후 diary_event 에 삽입
                if (!currentUser.user_id) {
                    console.error("⚠️ 로그인이 필요합니다. user_id가 없습니다.");
                    alert("일정을 추가하려면 로그인이 필요합니다.");
                    return;
                }
                db.run("INSERT INTO diary_event (user_id, title, com_lang, date) VALUES (?, ?, ?, ?)",
                    [currentUser.user_id, title, category, date]);
                saveDiaryEventToLocalStorage();
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
                if (wasCompleted) {
                    console.log(`✅ 완료 시작: ${events[date][index].title}`);
                    events[date][index].completed = true;
                    localStorage.setItem('events', JSON.stringify(events));
                    currentUser.xpUp(1); // XP 증가 및 UI 갱신
                    console.log(currentUser.xp, currentUser.lv, currentUser)

                    // 캘린더 이벤트 실시간 업데이트
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
                    calendarInstance.render(); // 캘린더 전체 강제 렌더링
                    checkDatabase(); // 완료 후 데이터베이스 상태 확인
                }
            }
        } catch (error) {
            console.error('일정 완료 처리 실패:', error);
            calendarInstance.render(); // 오류 발생 시에도 렌더링 시도
        }
    };

    // function updateLevelAndExp() {
    //     try {
    //         const requiredXp = currentUser.lv * 5;
    //         levelDisplay.textContent = `LV: ${currentUser.lv}`;
    //         expBar.textContent = `${currentUser.xp}/${requiredXp}`;
    //         const expPercentage = (currentUser.xp / requiredXp) * 100;
    //         expBar.style.width = `${expPercentage}%`;
    //         console.log(`✅ 레벨 및 경험치 UI 업데이트: LV ${currentUser.lv}, XP ${currentUser.xp}/${requiredXp}`);
    //     } catch (error) {
    //         console.error('레벨 및 경험치 업데이트 실패:', error);
    //     }
    // }

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
                    if (count >= 1) medal.classList.add('unlocked');
                    else medal.classList.remove('unlocked');
                }
            });
            console.log("✅ 메달 상태 업데이트 완료");
        } catch (error) {
            console.error('메달 업데이트 실패:', error);
        }
    }
    updateMedals();
    updateLevelAndExp();

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