let db;  // 데이터베이스 객체

// SQLite 환경 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // DB 없으면 새로 생성
    db = new SQL.Database();

    // user 테이블 생성
    db.run(
        `CREATE TABLE user (
            user_id   INTEGER PRIMARY KEY AUTOINCREMENT, -- 사용자 ID (고유 값)
            username  TEXT UNIQUE NOT NULL COLLATE NOCASE, -- 사용자 이름 (대소문자 구별 없이 UNIQUE)
            email     TEXT UNIQUE NOT NULL, -- 사용자 이메일 (중복 방지)
            password  CHAR(60) NOT NULL, -- 해싱된 비밀번호
            lv        INTEGER NOT NULL DEFAULT 1, -- 사용자 레벨
            xp        INTEGER NOT NULL DEFAULT 0, -- 사용자 경험치 (exp → xp로 통일)
            img       TEXT DEFAULT 'default_profile.png' -- 기본 프로필 이미지
         );
        CREATE TABLE diary_events (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT, -- 일정 ID (고유 값)
            user_id     INTEGER NOT NULL, -- 사용자 ID (FK)
            title       TEXT NOT NULL DEFAULT '', -- 일정 제목 (기본값 '')
            com_lang    TEXT NOT NULL, -- 사용 언어
            xp          INTEGER NOT NULL, -- 경험치 (exp → xp로 통일)
            description TEXT DEFAULT '', -- 일정 내용 (기본값 '')
            event_date  TEXT NOT NULL CHECK (event_date GLOB '????-??-??'), -- 일정 날짜 (YYYY-MM-DD 형식 강제)

            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
        );
        CREATE TABLE achievement (
            id      INTEGER PRIMARY KEY AUTOINCREMENT, -- 업적 고유번호
            name    TEXT NOT NULL, -- 업적 이름
            flavor  TEXT NOT NULL CHECK (LENGTH(flavor) <= 255), -- 플레이버 텍스트 (길이 제한 가능)
            img     TEXT -- 업적 이미지
        );
        CREATE TABLE user_achievement (
            user_id        INTEGER NOT NULL, -- 사용자 고유번호
            achievement_id INTEGER NOT NULL, -- 업적 고유번호
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE, -- 유저 삭제 시 함께 삭제
            FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE -- 업적 삭제 시 함께 삭제
        );`
    );
}

//

// 페이지 로딩 시 DB 초기화
window.onload = initDatabase;
