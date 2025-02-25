let db;  // 데이터베이스 객체

// SQLite 환경 초기화
export async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // DB 없으면 새로 생성
    db = new SQL.Database();

    // user 테이블 생성
    db.run(
        `CREATE TABLE user ( -- 사용자 테이블
            user_id   INTEGER PRIMARY KEY AUTOINCREMENT, -- 사용자 ID (고유 값)
            username  TEXT UNIQUE NOT NULL COLLATE NOCASE, -- 사용자 이름 (대소문자 구별 없이 UNIQUE)
            email     TEXT UNIQUE NOT NULL, -- 사용자 이메일 (중복 방지)
            password  CHAR(60) NOT NULL, -- 해싱된 비밀번호
            lv        INTEGER NOT NULL DEFAULT 1, -- 사용자 레벨
            xp        INTEGER NOT NULL DEFAULT 0, -- 사용자 경험치 (exp → xp로 통일)
            img       TEXT DEFAULT 'default_profile.png' -- 기본 프로필 이미지
         );
        CREATE TABLE diary_events ( -- 일정 테이블
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT, -- 일정 ID (고유 값)
            user_id     INTEGER NOT NULL, -- 사용자 ID (FK)
            title       TEXT NOT NULL DEFAULT '', -- 일정 제목 (기본값 '')
            com_lang    TEXT NOT NULL, -- 사용 언어
            xp          INTEGER NOT NULL, -- 경험치 (exp → xp로 통일)
            description TEXT DEFAULT '', -- 일정 내용 (기본값 '')
            event_date  TEXT NOT NULL CHECK (event_date GLOB '????-??-??'), -- 일정 날짜 (YYYY-MM-DD 형식 강제)

            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
        );
        CREATE TABLE achievement ( -- 업적 테이블
            id      INTEGER PRIMARY KEY AUTOINCREMENT, -- 업적 고유번호
            name    TEXT NOT NULL, -- 업적 이름
            flavor  TEXT NOT NULL CHECK (LENGTH(flavor) <= 255), -- 플레이버 텍스트 (길이 제한 가능)
            img     TEXT -- 업적 이미지
        );
        CREATE TABLE user_achievement ( -- 사용자-업적 테이블
            user_id        INTEGER NOT NULL, -- 사용자 고유번호
            achievement_id INTEGER NOT NULL, -- 업적 고유번호
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE, -- 유저 삭제 시 함께 삭제
            FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE -- 업적 삭제 시 함께 삭제
        );`
    );
}

// 사용자 추가 함수
export function addUser(username, email, password) {
    // 비밀번호 해싱은 회원가입 로직에서 진행?
    db.run(
        `INSERT INTO user (username, email, password) VALUES (?, ?, ?);`,
        [username, email, password]
    );
}

// 사용자 조회 함수
export function getUser(username) {
    const stmt = db.prepare(
        `SELECT * FROM user WHERE username = ?;`
    );
    stmt.bind(username);
    const user = stmt.getAsObject();
    stmt.free();
    return user;
}

// 사용자 경험치 업데이트 함수
export function updateUserXp(username, xp) {
    db.run(
        `UPDATE user SET xp = ? WHERE username = ?;`,
        [xp, username]
    );
}

// 사용자 레벨 업데이트 함수
export function updateUserLv(username, lv, xp) {
    db.run(
        `UPDATE user SET lv = ?, xp = ? WHERE username = ?;`,
        [lv, xp, username]
    );
}

// 사용자 이미지 업데이트 함수
export function updateUserImg(username, img) {
    db.run(
        `UPDATE user SET img = ? WHERE username = ?;`,
        [img, username]
    );
}

// 사용자 삭제 함수
export function deleteUser(username) {
    db.run(
        `DELETE FROM user WHERE username = ?;`,
        [username]
    );
}

// 일정 추가 함수
export function addDiaryEvent(user_id, title, com_lang, xp, description, event_date) {
    db.run(
        `INSERT INTO diary_events (user_id, title, com_lang, xp, description, event_date) VALUES (?, ?, ?, ?, ?, ?);`,
        [user_id, title, com_lang, xp, description, event_date]
    );
}

// 일정 조회 함수
export function getDiaryEvents(user_id) {
    const stmt = db.prepare(
        `SELECT * FROM diary_events WHERE user_id = ?;`
    );
    stmt.bind(user_id);
    const diaryEvents = stmt.getAsObject();
    stmt.free();
    return diaryEvents;
}

// 일정 업데이트 함수
export function updateDiaryEvent(event_id, title, com_lang, xp, description, event_date) {
    db.run(
        `UPDATE diary_events SET title = ?, com_lang = ?, xp = ?, description = ?, event_date = ? WHERE event_id = ?;`,
        [title, com_lang, xp, description, event_date, event_id]
    );
}

// 일정 삭제 함수
export function deleteDiaryEvent(event_id) {
    db.run(
        `DELETE FROM diary_events WHERE event_id = ?;`,
        [event_id]
    );
}

// 업적 추가 함수
export function addAchievement(name, flavor, img) {
    db.run(
        `INSERT INTO achievement (name, flavor, img) VALUES (?, ?, ?);`,
        [name, flavor, img]
    );
}

// 업적 조회 함수
export function getAchievements() {
    const stmt = db.prepare(
        `SELECT * FROM achievement;`
    );
    const achievements = stmt.getAsObject();
    stmt.free();
    return achievements;
}

// 업적 업데이트 함수
export function updateAchievement(id, name, flavor, img) {
    db.run(
        `UPDATE achievement SET name = ?, flavor = ?, img = ? WHERE id = ?;`,
        [name, flavor, img, id]
    );
}

// 업적 삭제 함수
export function deleteAchievement(id) {
    db.run(
        `DELETE FROM achievement WHERE id = ?;`,
        [id]
    );
}

// 사용자-업적 추가 함수
export function addUserAchievement(user_id, achievement_id) {
    db.run(
        `INSERT INTO user_achievement (user_id, achievement_id) VALUES (?, ?);`,
        [user_id, achievement_id]
    );
}

// 사용자-업적 조회 함수
export function getUserAchievements(user_id) {
    const stmt = db.prepare(
        `SELECT * FROM user_achievement WHERE user_id = ?;`
    );
    stmt.bind(user_id);
    const userAchievements = stmt.getAsObject();
    stmt.free();
    return userAchievements;
}

// 사용자-업적 업데이트 함수
export function updateUserAchievement(user_id, achievement_id) {
    db.run(
        `UPDATE user_achievement SET user_id = ?, achievement_id = ? WHERE user_id = ?;`,
        [user_id, achievement_id, user_id]
    );
}

// 사용자-업적 삭제 함수 -> 쓸 일이 있나? 없을 것 같긴 한데 혹시 모르니
export function deleteUserAchievement(user_id) {
    db.run(
        `DELETE FROM user_achievement WHERE user_id = ?;`,
        [user_id]
    );
}

// DB 파일 저장 함수
export function saveDatabase() {
    const data = db.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "database.sqlite";
    link.click();
    alert("데이터베이스가 저장되었습니다.");
}

// DB 파일 불러오기 함수
export async function loadDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
        db = new SQL.Database(data);

        alert("데이터베이스가 불러와졌습니다.");
        displayUsers();
    };
    reader.readAsArrayBuffer(file);
}