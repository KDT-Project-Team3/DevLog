///todo 1: 캘린더 생성
///todo 2: 날짜별 일정 등 등록/ 수정/ 삭제
///todo 3: 카테고리
///todo 4: 일정 완료시 경험치 반환 -> 나중에
///todo 5: 배너
///todo 6: DDL 작성 O

let db; // 데이터베이스 객체

// SQLite 환경 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // DB 없으면 새로 생성
    db = new SQL.Database();

    // users 테이블 생성
    db.run(
        `
        CREATE TABLE users (
            user_id    INTEGER PRIMARY KEY AUTOINCREMENT, -- 사용자 ID (고유 값)
            username   TEXT UNIQUE NOT NULL,             -- 사용자 이름 (고유)
            password   TEXT NOT NULL                     -- 비밀번호 (해싱 필요)
        );

        CREATE TABLE diary_events (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT, -- 일정 ID (고유 값)
            user_id     INTEGER NOT NULL,                 -- 사용자 ID (FK)
            title       TEXT NOT NULL,                    -- 일정 제목
            com_lang    TEXT NOT NULL,                    -- 언어
            description TEXT,                              -- 일정 내용
            event_date  TEXT NOT NULL,                     -- 일정 날짜 (SQLite 에서 DATE 대신 TEXT 사용)

            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );`
    );

    displayUsers();
}
