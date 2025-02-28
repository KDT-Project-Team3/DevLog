let db;

const banner = document.querySelector(".banner");
const messages = [
    "🚀 코드 한 줄이 세상을 바꾼다!", "🐞 버그 없는 코드? 신화일 뿐!",
    "💡 주석이 없는 코드는 마법이다. 이해할 수 없으니까!", "🔨 '작동하면 건들지 마라' - 개발자의 철학"
];
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
const dropdownMenu = document.querySelector(".dropdown-menu");

let calendarInstance = null;

const currentUser = {
    user_id: null,
    username: null,
    email: null,
    password: null,
    lv: 1,
    xp: 0,
    img: 'default_profile.png',
    xpUp: function (xp) {
        this.xp += xp;
        console.log(`✅ 경험치 ${xp} 획득! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        const requiredXp = this.lv + 1;
        if (this.xp >= requiredXp) {
            this.xp = 0;
            this.lv++;
            console.log(`✨ 레벨 업! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        }
        try {
            db.exec("UPDATE user SET xp=?, lv=? WHERE user_id=?", [this.xp, this.lv, this.user_id]);
            saveUserToLocalStorage();
            updateLevelAndExp();
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
    } catch (error) {
        console.error('데이터베이스 초기화 실패:', error);
    }
}

function loadDatabaseFromLocalStorage() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.length > 0) {
            userData[0].values.forEach(user => {
                db.run("INSERT OR IGNORE INTO user (user_id, username, email, password, lv, xp, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [user[0], user[1], user[2], user[3], user[4], user[5], user[6]]);
            });
            console.log("✅ user 테이블 데이터 로드 완료!");
        }
        const diaryEventData = JSON.parse(localStorage.getItem('diary_event'));
        if (diaryEventData && diaryEventData.length > 0) {
            diaryEventData[0].values.forEach(event => {
                // 'com_lang' -> 'category'
                db.run("INSERT OR IGNORE INTO diary_event (event_id, user_id, title, category, memo, date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [event[0], event[1], event[2], event[3], event[4], event[5], event[6]]);
            });
            console.log("✅ diary_event 테이블 데이터 로드 완료!");
        }
        const achievementData = JSON.parse(localStorage.getItem('achievement'));
        if (achievementData && achievementData.length > 0) {
            achievementData[0].values.forEach(achievement => {
                db.run("INSERT OR IGNORE INTO achievement (ach_id, title, flavor, trigger, img) VALUES (?, ?, ?, ?, ?)",
                    [achievement[0], achievement[1], achievement[2], achievement[3], achievement[4]]);
            });
            console.log("✅ achievement 테이블 데이터 로드 완료!");
        }
        const userAchievementData = JSON.parse(localStorage.getItem('user_achievement'));
        if (userAchievementData && userAchievementData.length > 0) {
            userAchievementData[0].values.forEach(userAchievement => {
                db.run("INSERT OR IGNORE INTO user_achievement (user_id, ach_id) VALUES (?, ?)",
                    [userAchievement[0], userAchievement[1]]);
            });
            console.log("✅ user_achievement 테이블 데이터 로드 완료!");
        }
        // title 테이블 로드 추가
        const titleData = JSON.parse(localStorage.getItem('title'));
        if (titleData && titleData.length > 0) {
            titleData[0].values.forEach(title => {
                db.run("INSERT OR IGNORE INTO title (title_id, title, trigger) VALUES (?, ?, ?)",
                    [title[0], title[1], title[2]]);
            });
            console.log("✅ title 테이블 데이터 로드 완료!");
        }
        // user_title 테이블 로드 추가
        const userTitleData = JSON.parse(localStorage.getItem('user_title'));
        if (userTitleData && userTitleData.length > 0) {
            userTitleData[0].values.forEach(userTitle => {
                db.run("INSERT OR IGNORE INTO user_title (user_id, title_id) VALUES (?, ?)",
                    [userTitle[0], userTitle[1]]);
            });
            console.log("✅ user_title 테이블 데이터 로드 완료!");
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

// title 저장 함수 추가
function saveTitleToLocalStorage() {
    try {
        const title = db.exec("SELECT * FROM title");
        localStorage.setItem('title', JSON.stringify(title));
        console.log("✅ title 테이블 데이터 저장 완료!");
    } catch (error) {
        console.error('title 저장 실패:', error);
    }
}

// user_title 저장 함수 추가
function saveUserTitleToLocalStorage() {
    try {
        const user_title = db.exec("SELECT * FROM user_title");
        localStorage.setItem('user_title', JSON.stringify(user_title));
        console.log("✅ user_title 테이블 데이터 저장 완료!");
    } catch (error) {
        console.error('user_title 저장 실패:', error);
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

window.updateUser = function(name, email, password, lv, xp, img, id) {
    try {
        db.run("UPDATE user SET username=?, email=?, password=?, lv=?, xp=?, img=? WHERE user_id=?", [name, email, password, lv, xp, img, id]);
        saveUserToLocalStorage();
        displayUsers();
    } catch (error) {
        console.error('회원 정보 수정 실패:', error);
    }
};

window.deleteUser = function(id) {
    try {
        db.run("DELETE FROM user WHERE user_id=?", [id]);
        saveUserToLocalStorage();
        displayUsers();
    } catch (error) {
        console.error('회원 삭제 실패:', error);
    }
};

window.checkCurrentUser = function() {
    console.log(currentUser);
};

window.checkDatabase = function() {
    try {
        console.log("✅ 데이터베이스 상태 확인:");
        const users = db.exec("SELECT * FROM user");
        console.log("- user 테이블:", users.length > 0 ? users[0].values.map(row => Object.fromEntries(row.map((val, idx) => [users[0].columns[idx], val]))) : []);
        const diaryEvents = db.exec("SELECT * FROM diary_event");
        console.log("- diary_event 테이블:", diaryEvents.length > 0 ? diaryEvents[0].values.map(row => Object.fromEntries(row.map((val, idx) => [diaryEvents[0].columns[idx], val]))) : []);
        const achievements = db.exec("SELECT * FROM achievement");
        console.log("- achievement 테이블:", achievements.length > 0 ? achievements[0].values.map(row => Object.fromEntries(row.map((val, idx) => [achievements[0].columns[idx], val]))) : []);
        const userAchievements = db.exec("SELECT * FROM user_achievement");
        console.log("- user_achievement 테이블:", userAchievements.length > 0 ? userAchievements[0].values.map(row => Object.fromEntries(row.map((val, idx) => [userAchievements[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('데이터베이스 상태 확인 실패:', error);
    }
};

window.displayDiaryEvents = function() {
    try {
        const result = db.exec("SELECT * FROM diary_event");
        console.log("✅ diary_event 테이블:", result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('diary_event 확인 실패:', error);
    }
};

window.displayAchievements = function() {
    try {
        const result = db.exec("SELECT * FROM achievement");
        console.log("✅ achievement 테이블:", result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('achievement 확인 실패:', error);
    }
};

window.displayUserAchievements = function() {
    try {
        const result = db.exec("SELECT * FROM user_achievement");
        console.log("✅ user_achievement 테이블:", result.length > 0 ? result[0].values.map(row => Object.fromEntries(row.map((val, idx) => [result[0].columns[idx], val]))) : []);
    } catch (error) {
        console.error('user_achievement 확인 실패:', error);
    }
};

// todo: displayTitle

const categoryColors = {
    Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
    JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
    Holiday: '#FF0000'
};

const achievementCategoryMap = {
    "Java 첫걸음": { category: "Java", requiredCount: 1, title: "", condition: "Java 일정 1개 완료" },
    "Java 고수": { category: "Java", requiredCount: 2, title: "", condition: "Java 일정 2개 완료" },
    "Java의 신": { category: "Java", requiredCount: 3, title: "☕ Java의 신", condition: "Java 일정 3개 완료" },

    // Python (기존)
    "Python 첫걸음": { category: "Python", requiredCount: 1, title: "", condition: "Python 일정 1개 완료" },
    "Python 마스터": { category: "Python", requiredCount: 2, title: "", condition: "Python 일정 2개 완료" },
    "Python의 신": { category: "Python", requiredCount: 3, title: "🐍 Python의 신", condition: "Python 일정 3개 완료" },

    // JavaScript (기존)
    "JS 첫걸음": { category: "JavaScript", requiredCount: 1, title: "", condition: "JavaScript 일정 1개 완료" },
    "JS DOM의 달인": { category: "JavaScript", requiredCount: 2, title: "", condition: "JavaScript 일정 2개 완료" },
    "JS 마스터": { category: "JavaScript", requiredCount: 3, title: "🧩 JS 코드 마스터", condition: "JavaScript 일정 3개 완료" },

    // HTML (기존)
    "초보 프론트엔드": { category: "HTML", requiredCount: 1, title: "", condition: "HTML 일정 1개 완료" },
    "HTML 고수": { category: "HTML", requiredCount: 2, title: "", condition: "HTML 일정 2개 완료" },
    "HTML의 신": { category: "HTML", requiredCount: 3, title: "📜 HTML의 신, 🎨 CSS의 신", condition: "HTML 일정 3개 완료" },

    // SQL (기존)
    "SQL 첫걸음": { category: "SQL", requiredCount: 1, title: "", condition: "SQL 일정 1개 완료" },
    "SQL 고수": { category: "SQL", requiredCount: 2, title: "", condition: "SQL 일정 2개 완료" },
    "SQL의 신": { category: "SQL", requiredCount: 3, title: "🗄️ SQL의 신", condition: "SQL 일정 3개 완료" },

    // C (추가)
    "C 첫걸음": { category: "C", requiredCount: 1, title: "", condition: "C 일정 1개 완료" },
    "C 고수": { category: "C", requiredCount: 2, title: "", condition: "C 일정 2개 완료" },
    "C의 신": { category: "C", requiredCount: 3, title: "🔧 C의 신", condition: "C 일정 3개 완료" },

    // Cpp (C++) (추가)
    "C++ 첫걸음": { category: "Cpp", requiredCount: 1, title: "", condition: "C++ 일정 1개 완료" },
    "C++ 고수": { category: "Cpp", requiredCount: 2, title: "", condition: "C++ 일정 2개 완료" },
    "C++의 신": { category: "Cpp", requiredCount: 3, title: "⚙️ C++의 신", condition: "C++ 일정 3개 완료" },

    // Csharp (C#) (추가)
    "C# 첫걸음": { category: "Csharp", requiredCount: 1, title: "", condition: "C# 일정 1개 완료" },
    "C# 고수": { category: "Csharp", requiredCount: 2, title: "", condition: "C# 일정 2개 완료" },
    "C#의 신": { category: "Csharp", requiredCount: 3, title: "🎹 C#의 신", condition: "C# 일정 3개 완료" },

    // R (추가)
    "R 첫걸음": { category: "R", requiredCount: 1, title: "", condition: "R 일정 1개 완료" },
    "R 고수": { category: "R", requiredCount: 2, title: "", condition: "R 일정 2개 완료" },
    "R의 신": { category: "R", requiredCount: 3, title: "📊 R의 신", condition: "R 일정 3개 완료" },

    // Kotlin (추가)
    "Kotlin 첫걸음": { category: "Kotlin", requiredCount: 1, title: "", condition: "Kotlin 일정 1개 완료" },
    "Kotlin 고수": { category: "Kotlin", requiredCount: 2, title: "", condition: "Kotlin 일정 2개 완료" },
    "Kotlin의 신": { category: "Kotlin", requiredCount: 3, title: "🤖 Kotlin의 신", condition: "Kotlin 일정 3개 완료" },

    // General (기존)
    "정원 관리사": { category: "General", requiredCount: 1, title: "🏡 정원 관리사", condition: "어떤 일정 1개 완료" },
    "지옥에서 온": { category: "General", requiredCount: 2, title: "🔥 지옥에서 온", condition: "어떤 일정 2개 완료" },
    "코린이": { category: "General", requiredCount: 1, title: "🐣 코린이", condition: "어떤 일정 1개 완료" },
    "프로갓생러": { category: "General", requiredCount: 2, title: "🚀 프로 갓생러", condition: "어떤 일정 2개 완료" },
    "파워J": { category: "General", requiredCount: 3, title: "⚡ 파워 J", condition: "어떤 일정 3개 완료" },
    "자기계발왕": { category: "General", requiredCount: 4, title: "📚 자기계발 끝판왕", condition: "어떤 일정 4개 완료" },

    "닥터 스트레인지": { category: "General", requiredCount: 5, title: "⏳ 닥터 스트레인지", condition: "어떤 일정 5개 완료" },

    // 버그 헌터 관련 업적
    // "새싹 디버거": { category: "Debug", requiredCount: 1, title: "🌱 새싹 디버거" },
    // "버그 헌터": { category: "Debug", requiredCount: 2, title: "🔍 버그 헌터" },
    // "디버깅 마스터": { category: "Debug", requiredCount: 3, title: "🛠️ 디버깅 마스터" },
    // "버그 엑소시스트": { category: "Debug", requiredCount: 4, title: "👻 버그 엑소시스트" },
    // "와일드 멘탈": { category: "Debug", requiredCount: 1, title: "🐆 wild-mental" }

};


document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ DOMContentLoaded 실행됨");
    console.log("Bootstrap JS 로드 여부:", typeof bootstrap);
    await initDatabase();

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
        medalBox.style.height = "20%";
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
        medalBox.style.height = "0px";
        userInfoLayout.classList.remove("profileInvisible");
        profileImg.style.width = "170px";
        profileImg.style.height = "170px";
        userInfoLayout.style.marginTop = "20%";
        achievement_p.forEach(p => p.style.opacity = "0");
    });

    const categorySelect = document.getElementById("eventCategory");
    if (categorySelect) {
        Object.keys(categoryColors).forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    content_title.forEach(title => {
        title.style.fontSize = "1.3em";
        title.style.marginLeft = "0.2em";
        title.style.width = "300px";
    });

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
        updateLevelAndExp();

        // 업적 및 칭호 데이터 초기화
        try {
            const existingAchievements = db.exec("SELECT COUNT(*) as count FROM achievement")[0].values[0][0];
            if (existingAchievements === 0) {
                Object.entries(achievementCategoryMap).forEach(([achTitle, { condition, title: titlesStr }], index) => {
                    // 업적 삽입
                    db.run("INSERT OR IGNORE INTO achievement (title, flavor, trigger, img) VALUES (?, ?, ?, ?)",
                        [achTitle, titlesStr || "", condition, `achievement_${index + 1}.png`]);
                    const achIdResult = db.exec("SELECT ach_id FROM achievement WHERE title = ?", [achTitle]);
                    if (achIdResult.length > 0 && achIdResult[0].values.length > 0) {
                        const achId = achIdResult[0].values[0][0];
                        if (titlesStr) {
                            const titles = titlesStr.split(',').map(t => t.trim());
                            titles.forEach(title => {
                                // 칭호 삽입
                                db.run("INSERT OR IGNORE INTO title (title, trigger) VALUES (?, ?)",
                                    [title, condition]);
                                const titleIdResult = db.exec("SELECT title_id FROM title WHERE title = ?", [title]);
                                if (titleIdResult.length > 0 && titleIdResult[0].values.length > 0) {
                                    const titleId = titleIdResult[0].values[0][0];
                                    // 업적과 칭호 연결 (achievement_title 테이블이 없으므로 생략, 필요 시 추가)
                                }
                            });
                        }
                    }
                });
                saveAchievementToLocalStorage();
                saveTitleToLocalStorage();
                console.log("✅ achievement 및 title 초기 데이터 삽입 완료!");
            }
        } catch (error) {
            console.error('업적 및 칭호 데이터 초기화 실패:', error);
        }

        // 데이터베이스에서 해금된 칭호 초기화
        // 수정: unlockedTitles 제거, 즉시 initializeTitles 호출로 대체
        try {
            initializeTitles(); // 데이터베이스에서 칭호 초기화
        } catch (error) {
            console.error('칭호 초기화 실패:', error);
        }
    } else {
        console.warn("⚠️ 로그인된 유저 정보가 없습니다.");
    }

    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error("❌ 캘린더 요소를 찾을 수 없습니다.");
    } else {
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
                if (!currentUser.user_id) {
                    console.error("⚠️ 로그인이 필요합니다. user_id가 없습니다.");
                    alert("일정을 추가하려면 로그인이 필요합니다.");
                    return;
                }
                // com_lang -> category
                db.run("INSERT INTO diary_event (user_id, title, category, date) VALUES (?, ?, ?, ?)",
                    [currentUser.user_id, title, category, date]);
                saveDiaryEventToLocalStorage();
                console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);

                // 수정: 업적 상태 즉시 확인
                updateMedals();
            } else {
                console.log(`이미 존재하는 일정: ${title} (${category})`);
            }
        } catch (error) {
            console.error('일정 추가 실패:', error);
        }
    };

    window.completeEvent = function(date, index) {
        try {
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (events[date] && events[date][index]) {
                const wasCompleted = events[date][index].completed;
                if (!wasCompleted) {
                    events[date][index].completed = true;
                    localStorage.setItem('events', JSON.stringify(events));
                    currentUser.xpUp(1);
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
                        }
                    }
                    // com_lang -> category
                    const eventIdResult = db.exec("SELECT event_id FROM diary_event WHERE user_id=? AND date=? AND title=? AND category=?",
                        [currentUser.user_id, date, events[date][index].title, events[date][index].category]);
                    if (eventIdResult.length > 0 && eventIdResult[0].values.length > 0) {
                        const eventId = eventIdResult[0].values[0][0];
                        db.run("UPDATE diary_event SET completed=TRUE WHERE event_id=?", [eventId]);
                        saveDiaryEventToLocalStorage();
                    }
                    updateMedals();

                    // 수정: 드롭다운 실시간 갱신
                    initializeTitles();

                    console.log(`✅ 일정 완료: ${events[date][index].title}`);
                    calendarInstance.refetchEvents(); // 캘린더 실시간 갱신
                    checkDatabase();
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
            let totalCompleted = 0;
            for (const date in events) {
                // events[date].forEach(event => {
                //     if (event.completed) {
                //         completedCounts[event.category] = (completedCounts[event.category] || 0) + 1;
                //         totalCompleted++;
                //     }
                // 수정: events[date]가 배열인지 확인
                const dateEvents = Array.isArray(events[date]) ? events[date] : [];
                dateEvents.forEach(event => {
                    if (event.completed) {
                        completedCounts[event.category] = (completedCounts[event.category] || 0) + 1;
                        totalCompleted++;
                    }
                });
            }

            // 데이터베이스에서 현재 사용자의 업적 상태 가져오기
            let unlockedAchievements = {};
            const userAchievements = db.exec("SELECT a.title FROM user_achievement ua JOIN achievement a ON ua.ach_id = a.ach_id WHERE ua.user_id = ?", [currentUser.user_id]);
            if (userAchievements.length > 0) {
                userAchievements[0].values.forEach(([title]) => {
                    unlockedAchievements[title] = true;
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
            const achievementItems = document.querySelectorAll('.achievementInner');
            const achievementContainer = document.querySelector('.achievement');
            const unlockedItems = [];
            const lockedItems = [];

            achievementItems.forEach(item => {
                const title = item.querySelector('h2').textContent.trim();
                const mapping = achievementCategoryMap[title] || { category: "General", requiredCount: 1 };
                const category = mapping.category;
                const requiredCount = mapping.requiredCount;
                const completedCount = completedCounts[category] || 0;
                const isUnlocked = category === "General" ? totalCompleted >= requiredCount : completedCount >= requiredCount;
                const descriptionP = item.querySelector('.content p');

                // 업적 해금 시 데이터베이스에 기록
                if (isUnlocked && !unlockedAchievements[title]) {
                    const achIdResult = db.exec("SELECT ach_id FROM achievement WHERE title = ?", [title]);
                    if (achIdResult.length > 0 && achIdResult[0].values.length > 0) {
                        const achId = achIdResult[0].values[0][0];
                        db.run("INSERT OR IGNORE INTO user_achievement (user_id, ach_id) VALUES (?, ?)", [currentUser.user_id, achId]);
                        saveUserAchievementToLocalStorage();
                        unlockedAchievements[title] = true;
                        console.log(`✅ 업적 해금: ${title}`);

                        // 칭호 추가
                        if (mapping.title) {
                            const titles = mapping.title.split(',').map(t => t.trim());
                            titles.forEach(titleText => {
                                db.run("INSERT OR IGNORE INTO title (title, trigger) VALUES (?, ?)",
                                    [titleText, mapping.condition]);
                                const titleIdResult = db.exec("SELECT title_id FROM title WHERE title = ?", [titleText]);
                                if (titleIdResult.length > 0 && titleIdResult[0].values.length > 0) {
                                    const titleId = titleIdResult[0].values[0][0];
                                    db.run("INSERT OR IGNORE INTO user_title (user_id, title_id) VALUES (?, ?)",
                                        [currentUser.user_id, titleId]);
                                    saveUserTitleToLocalStorage();
                                    addTitleToDropdown(titleText);
                                }
                            });
                        }
                    }
                }

                if (isUnlocked) {
                    item.classList.add('unlocked');
                    descriptionP.textContent = descriptionP.dataset.originalText || descriptionP.textContent;
                    unlockedItems.push(item);
                } else {
                    item.classList.remove('unlocked');
                    item.style.opacity = '0.7';
                    if (!descriptionP.dataset.originalText) {
                        descriptionP.dataset.originalText = descriptionP.textContent;
                    }
                    descriptionP.textContent = mapping.condition || "해금 조건 미정";
                    lockedItems.push(item);
                }
            });

            achievementContainer.innerHTML = '';
            unlockedItems.forEach(item => achievementContainer.appendChild(item));
            lockedItems.forEach(item => achievementContainer.appendChild(item));
            console.log("✅ 메달 및 업적 상태 업데이트 완료");
        } catch (error) {
            console.error('메달 및 업적 업데이트 실패:', error);
        }
    }

    // let unlockedTitles = JSON.parse(localStorage.getItem('unlockedTitles')) || [];
    function initializeTitles() {
        if (dropdownMenu) {
            dropdownMenu.innerHTML = '';
            const defaultItem = document.createElement('div');
            defaultItem.className = 'dropdown-item';
            defaultItem.textContent = ' ';
            defaultItem.addEventListener('click', () => {
                selectedTitle.textContent = ' ';
                selectedTitle.className = 'userTitle text-white fw-bold';
            });
            dropdownMenu.appendChild(defaultItem);

            // user_title에서 칭호 가져오기
            const userTitles = db.exec(
                "SELECT t.title FROM user_title ut JOIN title t ON ut.title_id = t.title_id WHERE ut.user_id = ?",
                [currentUser.user_id]
            );
            if (userTitles.length > 0) {
                userTitles[0].values.forEach(([title]) => {
                    addTitleToDropdown(title);
                });
            }

            // 저장된 칭호 복원
            const savedTitle = localStorage.getItem('selectedTitle');
            if (savedTitle && savedTitle !== '') {
                selectedTitle.textContent = savedTitle;
                selectedTitle.className = 'userTitle text-white fw-bold';
                switch (savedTitle) {
                    case "☕ Java의 신": selectedTitle.classList.add('title-java'); break;
                    case "🐍 Python의 신": selectedTitle.classList.add('title-python'); break;
                    case "📜 HTML의 신": selectedTitle.classList.add('title-html'); break;
                    case "🎨 CSS의 신": selectedTitle.classList.add('title-css'); break;
                    case "🧩 JS 코드 마스터": selectedTitle.classList.add('title-js'); break;
                    case "🗄️ SQL의 신": selectedTitle.classList.add('title-sql'); break;
                    case "🏡 정원 관리사": selectedTitle.classList.add('title-gardener'); break;
                    case "🔥 지옥에서 온": selectedTitle.classList.add('title-hell'); break;
                    case "⏳ 닥터 스트레인지": selectedTitle.classList.add('title-strange'); break;
                    case "👻 버그 엑소시스트": selectedTitle.classList.add('title-exorcist'); break;
                    case "🐣 코린이": selectedTitle.classList.add('title-newbie'); break;
                    case "🚀 프로 갓생러": selectedTitle.classList.add('title-pro'); break;
                    case "⚡ 파워 J": selectedTitle.classList.add('title-power'); break;
                    case "📚 자기계발 끝판왕": selectedTitle.classList.add('title-self'); break;
                    case "🌱 새싹 디버거": selectedTitle.classList.add('title-sprout'); break;
                    case "🔍 버그 헌터": selectedTitle.classList.add('title-hunter'); break;
                    case "🛠️ 디버깅 마스터": selectedTitle.classList.add('title-debug'); break;
                    case "🐆 wild-mental": selectedTitle.classList.add('title-wild-mental'); break;
                }
            }
            console.log("✅ 칭호 초기화 완료");
        }
    }

    function addTitleToDropdown(title) {
        if (dropdownMenu && selectedTitle) {
            // 중복 체크를 DB에서 수행하므로 localStorage 제거
            const exists = db.exec("SELECT COUNT(*) FROM user_title ut JOIN title t ON ut.title_id = t.title_id WHERE ut.user_id = ? AND t.title = ?",
                [currentUser.user_id, title])[0].values[0][0] > 0;
            if (!exists) {
                db.run("INSERT OR IGNORE INTO title (title, trigger) VALUES (?, ?)", [title, "업적 해금"]);
                const titleIdResult = db.exec("SELECT title_id FROM title WHERE title = ?", [title]);
                if (titleIdResult.length > 0 && titleIdResult[0].values.length > 0) {
                    const titleId = titleIdResult[0].values[0][0];
                    db.run("INSERT OR IGNORE INTO user_title (user_id, title_id) VALUES (?, ?)",
                        [currentUser.user_id, titleId]);
                    saveUserTitleToLocalStorage();
                }
            }

            // const item = document.createElement('div');
            // item.className = 'dropdown-item';
            // item.textContent = title;
            // item.addEventListener('click', () => {
            //     selectedTitle.textContent = title;
            //     selectedTitle.className = 'userTitle text-white fw-bold';
            //     switch (title) {
            //         case "☕ Java의 신": selectedTitle.classList.add('title-java'); break;
            //         case "🐍 Python의 신": selectedTitle.classList.add('title-python'); break;
            //         case "📜 HTML의 신": selectedTitle.classList.add('title-html'); break;
            //         case "🎨 CSS의 신": selectedTitle.classList.add('title-css'); break;
            //         case "🧩 JS 코드 마스터": selectedTitle.classList.add('title-js'); break;
            //         case "🗄️ SQL의 신": selectedTitle.classList.add('title-sql'); break;
            //         case "🏡 정원 관리사": selectedTitle.classList.add('title-gardener'); break;
            //         case "🔥 지옥에서 온": selectedTitle.classList.add('title-hell'); break;
            //         case "⏳ 닥터 스트레인지": selectedTitle.classList.add('title-strange'); break;
            //         case "👻 버그 엑소시스트": selectedTitle.classList.add('title-exorcist'); break;
            //         case "🐣 코린이": selectedTitle.classList.add('title-newbie'); break;
            //         case "🚀 프로 갓생러": selectedTitle.classList.add('title-pro'); break;
            //         case "⚡ 파워 J": selectedTitle.classList.add('title-power'); break;
            //         case "📚 자기계발 끝판왕": selectedTitle.classList.add('title-self'); break;
            //         case "🌱 새싹 디버거": selectedTitle.classList.add('title-sprout'); break;
            //         case "🔍 버그 헌터": selectedTitle.classList.add('title-hunter'); break;
            //         case "🛠️ 디버깅 마스터": selectedTitle.classList.add('title-debug'); break;
            //         case "🐆 wild-mental": selectedTitle.classList.add('title-wild-mental'); break;
            //     }
            // });
            // 수정: 드롭다운에 중복 없이 추가
            const existingItems = Array.from(dropdownMenu.querySelectorAll('.dropdown-item')).map(item => item.textContent);
            if (!existingItems.includes(title)) {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = title;
                item.addEventListener('click', () => {
                    selectedTitle.textContent = title;
                    selectedTitle.className = 'userTitle text-white fw-bold';
                    switch (title) {
                        case "☕ Java의 신":
                            selectedTitle.classList.add('title-java');
                            break;
                        case "🐍 Python의 신":
                            selectedTitle.classList.add('title-python');
                            break;
                        case "📜 HTML의 신":
                            selectedTitle.classList.add('title-html');
                            break;
                        case "🎨 CSS의 신":
                            selectedTitle.classList.add('title-css');
                            break;
                        case "🧩 JS 코드 마스터":
                            selectedTitle.classList.add('title-js');
                            break;
                        case "🗄️ SQL의 신":
                            selectedTitle.classList.add('title-sql');
                            break;
                        case "🏡 정원 관리사":
                            selectedTitle.classList.add('title-gardener');
                            break;
                        case "🔥 지옥에서 온":
                            selectedTitle.classList.add('title-hell');
                            break;
                        case "⏳ 닥터 스트레인지":
                            selectedTitle.classList.add('title-strange');
                            break;
                        case "👻 버그 엑소시스트":
                            selectedTitle.classList.add('title-exorcist');
                            break;
                        case "🐣 코린이":
                            selectedTitle.classList.add('title-newbie');
                            break;
                        case "🚀 프로 갓생러":
                            selectedTitle.classList.add('title-pro');
                            break;
                        case "⚡ 파워 J":
                            selectedTitle.classList.add('title-power');
                            break;
                        case "📚 자기계발 끝판왕":
                            selectedTitle.classList.add('title-self');
                            break;
                        case "🌱 새싹 디버거":
                            selectedTitle.classList.add('title-sprout');
                            break;
                        case "🔍 버그 헌터":
                            selectedTitle.classList.add('title-hunter');
                            break;
                        case "🛠️ 디버깅 마스터":
                            selectedTitle.classList.add('title-debug');
                            break;
                        case "🐆 wild-mental":
                            selectedTitle.classList.add('title-wild-mental');
                            break;
                    }
                    // 선택된 칭호 저장
                    localStorage.setItem('selectedTitle', title);
                    console.log(`✅ 칭호 선택: ${title}`);
                });
                dropdownMenu.appendChild(item);
                console.log(`칭호 추가됨: ${title}`);
            }
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
            calendarInstance.addEvent({
                title: `${title} (${category})`,
                start: date,
                allDay: true,
                backgroundColor: categoryColors[category],
                borderColor: categoryColors[category],
                extendedProps: { memo, completed: false }
            });
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

    // 모달 이벤트 디버깅
    const modalEl = document.getElementById('exampleModal');
    if (modalEl) {
        modalEl.addEventListener('shown.bs.modal', function () {
            console.log("✅ 모달이 열림");
            const iframe = document.getElementById('gameFrame');
            iframe.onload = function() {
                console.log("✅ 게임 iframe 로드 완료");
            };
            iframe.onerror = function() {
                console.error("❌ 게임 iframe 로드 실패");
                iframe.contentDocument.body.innerHTML = "<h1>게임 로드 실패</h1>";
            };
        });
        modalEl.addEventListener('hidden.bs.modal', function () {
            console.log("✅ 모달이 닫힘");
        });
    }

    initializeTitles();
    updateMedals();
    updateLevelAndExp();
    console.log("addEventListener 실행 완료");
});

function loadEventsFromLocalStorage() {
    try {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const eventList = [];
        for (const date in events) {
            // 수정: events[date]가 배열인지 확인
            const dateEvents = Array.isArray(events[date]) ? events[date] : [];
            dateEvents.forEach(event => {
                eventList.push({
                    title: `${event.title} (${event.category})`,
                    start: date,
                    allDay: true,
                    backgroundColor: categoryColors[event.category] || '#000000', // 기본 색상 추가
                    borderColor: categoryColors[event.category] || '#000000',
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