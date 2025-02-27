let db; // 데이터베이스 객체

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
        if (this.xp >= this.lv + 1) {
            this.xp -= this.lv + 1;
            this.lv++;
            console.log(`✨ 레벨 업! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        }
        db.exec("UPDATE user SET xp=?, lv=? WHERE user_id=?", [this.xp, this.lv,this.user_id]);
        console.log("✅ 데이터베이스에 경험치 및 레벨 업데이트 완료!");
    }
};

// 데이터베이스 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // sqliteDB 데이터베이스 생성
    db = new SQL.Database();
    db.run(`
        CREATE TABLE IF NOT EXISTS user ( -- 사용자 테이블
            user_id     INTEGER PRIMARY KEY AUTOINCREMENT,      -- 사용자 ID
            username    TEXT UNIQUE NOT NULL COLLATE NOCASE,    -- 사용자 이름
            email       TEXT UNIQUE NOT NULL,                   -- 이메일
            password    TEXT NOT NULL,                          -- 비밀번호
            lv          INTEGER DEFAULT 1,                      -- 레벨
            xp          INTEGER DEFAULT 0,                      -- 경험치
            img         TEXT DEFAULT 'default_profile.png',     -- 프로필 이미지
            highscore   INTEGER DEFAULT 0                       -- 게임 최고기록
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS diary_event ( -- 일정 테이블
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT,  -- 이벤트 ID
            user_id     INTEGER NOT NULL,                   -- 사용자 ID
            title       TEXT NOT NULL,                      -- 제목
            category    TEXT NOT NULL,                      -- 분류
            memo        TEXT,                               -- 메모
            date        TEXT NOT NULL,                      -- 날짜
            completed   BOOLEAN DEFAULT FALSE,              -- 완료 여부
            
            FOREIGN KEY (user_id) REFERENCES user(user_id)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS achievement ( -- 칭호 테이블
            ach_id  INTEGER PRIMARY KEY AUTOINCREMENT,-- 칭호 ID
            title   TEXT NOT NULL,  -- 칭호명
            flavor  TEXT NOT NULL,  -- 칭호 설명
            trigger TEXT NOT NULL,  -- 칭호 획득 조건
            img     TEXT NOT NULL   -- 칭호 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_achievement ( -- 사용자가 보유한 칭호 테이블
            user_id INTEGER NOT NULL,   -- 사용자 ID
            ach_id  INTEGER NOT NULL,   -- 칭호 ID

            FOREIGN KEY (user_id) REFERENCES user(user_id),
            FOREIGN KEY (ach_id) REFERENCES achievement(ach_id),
            PRIMARY KEY (user_id, ach_id)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS emblem ( -- 엠블럼 테이블
            emblem_id INTEGER PRIMARY KEY AUTOINCREMENT,-- 엠블럼 ID
            title     TEXT NOT NULL,                    -- 엠블럼명
            trigger   TEXT NOT NULL,                    -- 엠블럼 획득 조건
            img       TEXT NOT NULL                     -- 엠블럼 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_emblem ( -- 사용자가 보유한 엠블럼 테이블
            user_id   INTEGER NOT NULL, -- 사용자 ID
            emblem_id INTEGER NOT NULL, -- 엠블럼 ID
        
            FOREIGN KEY (user_id) REFERENCES user(user_id),
            FOREIGN KEY (emblem_id) REFERENCES emblem(emblem_id),
            PRIMARY KEY (user_id, emblem_id)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS title ( -- 칭호 테이블
            title_id INTEGER PRIMARY KEY AUTOINCREMENT,-- 칭호 ID
            title    TEXT NOT NULL,                    -- 칭호명
            trigger  TEXT NOT NULL                     -- 칭호 획득 조건
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_title ( -- 사용자가 보유한 칭호 테이블
            user_id  INTEGER NOT NULL, -- 사용자 ID
            title_id INTEGER NOT NULL, -- 칭호 ID
            
            FOREIGN KEY (user_id) REFERENCES user(user_id),
            FOREIGN KEY (title_id) REFERENCES title(title_id),
            PRIMARY KEY (user_id, title_id)
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
            db.run("INSERT INTO user (user_id, username, email, password, lv, xp, img, highscore) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [user[0], user[1], user[2], user[3], user[4], user[5], user[6], user[7]]);
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
    // emblem 테이블
    const emblemData = JSON.parse(localStorage.getItem('emblem'));
    if (emblemData && emblemData.length > 0) {
        emblemData[0].values.forEach(emblem => {
            db.run("INSERT INTO emblem (emblem_id, title, trigger, img) VALUES (?, ?, ?, ?)",
                [emblem[0], emblem[1], emblem[2], emblem[3]]);
        });
        console.log("✅ emblem 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 emblem 데이터가 없습니다.");
    }
    // user_emblem 테이블
    const userEmblemData = JSON.parse(localStorage.getItem('user_emblem'));
    if (userEmblemData && userEmblemData.length > 0) {
        userEmblemData[0].values.forEach(userEmblem => {
            db.run("INSERT INTO user_emblem (user_id, emblem_id) VALUES (?, ?)",
                [userEmblem[0], userEmblem[1]]);
        });
        console.log("✅ user_emblem 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 user_emblem 데이터가 없습니다.");
    }
    // title 테이블
    const titleData = JSON.parse(localStorage.getItem('title'));
    if (titleData && titleData.length > 0) {
        titleData[0].values.forEach(title => {
            db.run("INSERT INTO title (title_id, title, trigger) VALUES (?, ?, ?)",
                [title[0], title[1], title[2]]);
        });
        console.log("✅ title 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 title 데이터가 없습니다.");
    }
    // user_title 테이블
    const userTitleData = JSON.parse(localStorage.getItem('user_title'));
    if (userTitleData && userTitleData.length > 0) {
        userTitleData[0].values.forEach(userTitle => {
            db.run("INSERT INTO user_title (user_id, title_id) VALUES (?, ?)",
                [userTitle[0], userTitle[1]]);
        });
        console.log("✅ user_title 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 user_title 데이터가 없습니다.");
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

// emblem 테이블의 데이터 저장
function saveEmblemToLocalStorage() {
    const emblem = db.exec("SELECT * FROM emblem");
    localStorage.setItem('emblem', JSON.stringify(emblem));
    console.log("✅ emblem 테이블 데이터 저장 완료!");
}

// user_emblem 테이블의 데이터 저장
function saveUserEmblemToLocalStorage() {
    const user_emblem = db.exec("SELECT * FROM user_emblem");
    localStorage.setItem('user_emblem', JSON.stringify(user_emblem));
    console.log("✅ user_emblem 테이블 데이터 저장 완료!");
}

// title 테이블의 데이터 저장
function saveTitleToLocalStorage() {
    const title = db.exec("SELECT * FROM title");
    localStorage.setItem('title', JSON.stringify(title));
    console.log("✅ title 테이블 데이터 저장 완료!");
}

// user_title 테이블의 데이터 저장
function saveUserTitleToLocalStorage() {
    const user_title = db.exec("SELECT * FROM user_title");
    localStorage.setItem('user_title', JSON.stringify(user_title));
    console.log("✅ user_title 테이블 데이터 저장 완료!");
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

// 유저 경험치 증가(콘솔용)
function increaseUserXP(xp) {
    currentUser.xpUp(xp);
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
        // Check if the event already exists in the database
        const existingEvents = db.exec("SELECT * FROM diary_event WHERE date = ? AND title = ? AND category = ?", [date, title, category]);
        if (existingEvents.length === 0) {
            // Insert the new event into the diary_event table
            db.run("INSERT INTO diary_event (user_id, title, category, date, completed) VALUES (?, ?, ?, ?, ?)", [currentUser.user_id, title, category, date, false]);
            console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);

            // Add the event to the calendar
            calendar.addEvent({
                title: `${title} (${category})`,
                start: date,
                allDay: true,
                backgroundColor: categoryColors[category],
                borderColor: categoryColors[category],
                extendedProps: { memo: '', completed: false }
            });
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

    // function checkLevelUp() {
    //     const requiredXp = window.userData.level * 5;
    //     while (window.userData.xp >= requiredXp) {
    //         window.userData.level += 1;
    //         window.userData.xp -= requiredXp;
    //         console.log(`🎉 레벨업! 현재 레벨: ${window.userData.level}, 남은 XP: ${window.userData.xp}`);
    //     }
    //     localStorage.setItem('userData', JSON.stringify(window.userData));
    // }

    function updateLevelAndExp() {
        const requiredXp = currentUser.lv + 1;
        levelDisplay.textContent = `LV: ${currentUser.lv}`;
        const expPercentage = (currentUser.xp / requiredXp) * 100;
        expBar.style.width = `${expPercentage}%`;
        expBar.textContent = `${currentUser.xp}/${requiredXp}`;
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

// function loadEventsFromLocalStorage() {
//     const events = JSON.parse(localStorage.getItem('events') || '{}');
//     const eventList = [];
//     const categoryColors = {
//         Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
//         JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
//         Holiday: '#FF0000'
//     };
//     for (const date in events) {
//         events[date].forEach(event => {
//             eventList.push({
//                 title: `${event.title} (${event.category})`,
//                 start: date,
//                 allDay: true,
//                 backgroundColor: categoryColors[event.category],
//                 borderColor: categoryColors[event.category],
//                 extendedProps: { memo: event.memo || '', completed: event.completed || false }
//             });
//         });
//     }
//     return eventList;
// }