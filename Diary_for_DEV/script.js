///todo 1: 캘린더 생성 예은 O
///todo 2: 날짜별 일정 등 등록/ 수정/ 삭제 예은
///todo 3: 카테고리 예은
///todo 4: 일정 완료시 경험치 반환 -> 나중에
///todo 5: 배너 수영 O
///todo 6: DDL 작성 수영 O

let db; // 데이터베이스 객체

// SQLite 환경 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    db = new SQL.Database(); // 새 SQLite DB 생성

    db.run(`
        CREATE TABLE users (
            user_id    INTEGER PRIMARY KEY AUTOINCREMENT, -- 사용자 ID (고유 값)
            username   TEXT UNIQUE NOT NULL COLLATE NOCASE, -- 사용자 이름 (대소문자 구별 없이 UNIQUE)
            password   TEXT NOT NULL                     -- 비밀번호 (해싱 필요)
        );

        CREATE TABLE diary_events (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT, -- 일정 ID (고유 값)
            user_id     INTEGER NOT NULL,                 -- 사용자 ID (FK)
            title       TEXT NOT NULL DEFAULT '',         -- 일정 제목 (기본값 '')
            com_lang    TEXT NOT NULL,                    -- 사용 언어
            xp          INTEGER NOT NULL,
            description TEXT DEFAULT '',                  -- 일정 내용 (기본값 '')
            event_date  TEXT NOT NULL CHECK (event_date GLOB '????-??-??'), -- 일정 날짜 (YYYY-MM-DD 형식 강제)

            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
    `);

    displayUsers(); // 사용자 목록 표시 (테스트용)
}

// ======== 배너 문구 ========
document.addEventListener("DOMContentLoaded", function () {
    const bannerText = document.querySelector(".banner-text"); // 배너 텍스트 요소
    const messages = [
        "🚀 개발은 창조다!",
        "🔥 버그를 잡자!",
        "💡 오늘도 성장 중!",
        "🔨 코드 한 줄, 미래 한 걸음!",
        "🌍 Hello, World!",
        "🌐 HTML 은 프로그래밍 언어가 아니다!",
        "🏷️ 태그는 중요해!"
    ];

    let currentIndex = 0;

    function changeBannerText() {
        bannerText.textContent = messages[currentIndex]; // 텍스트 변경
        currentIndex = (currentIndex + 1) % messages.length; // 다음 메시지
    }

    setInterval(changeBannerText, 3000); // 3초마다 변경
});
// ======== 로그인 & 로그아웃 ========
function validateEmail(email) {
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function signup() {
    let email = document.getElementById('signup-email').value;
    let password = document.getElementById('signup-password').value;
    let confirmPassword = document.getElementById('signup-password-confirm').value;

    if (!email || !password || !confirmPassword) {
        alert('이메일과 비밀번호를 입력하세요.');
        return;
    }

    if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력하세요.');
        return;
    }

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    alert('회원가입 성공! 로그인 해주세요.');
    showLogin();
}

function login() {
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력하세요.');
        return;
    }

    alert('로그인 성공!');
    window.location.href = 'index.html';
}

function showLogin() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function showSignup() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}