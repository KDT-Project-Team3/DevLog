// 데이터베이스 초기화
let db;
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });
    db = new SQL.Database();
    db.run(`
        CREATE TABLE user (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL COLLATE NOCASE,
            email TEXT UNIQUE NOT NULL,
            password CHAR(60) NOT NULL,
            lv INTEGER NOT NULL DEFAULT 1,
            xp INTEGER NOT NULL DEFAULT 0,
            img TEXT DEFAULT 'default_profile.png'
        );
        CREATE TABLE diary_events (
            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            com_lang TEXT NOT NULL,
            xp INTEGER NOT NULL,
            description TEXT DEFAULT '',
            event_date TEXT NOT NULL CHECK (event_date GLOB '????-??-??'),
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
        );
        CREATE TABLE achievement (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            flavor TEXT NOT NULL CHECK (LENGTH(flavor) <= 255),
            img TEXT
        );
        CREATE TABLE user_achievement (
            user_id INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
            FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE
        );
    `);
    console.log("Database initialized successfully.");
}
initDatabase().catch(error => console.error("Database Initialization Error:", error));

// 이메일 유효성 검사
function validateEmail(email) {
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// 회원가입 함수
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

    // 데이터베이스에 사용자 추가
    try {
        db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
            [email.split('@')[0], email, password]); // username은 이메일 앞부분으로 가정
        alert('회원가입 성공! 로그인 해주세요.');
        showLogin();
    } catch (error) {
        alert('회원가입 실패: 이미 존재하는 이메일입니다.');
        console.error("Signup Error:", error);
    }
}

// 로그인 함수
function login() {
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력하세요.');
        return;
    }

    // 데이터베이스에서 사용자 확인
    const result = db.exec("SELECT * FROM user WHERE email = ? AND password = ?", [email, password]);
    if (result.length > 0) {
        alert('로그인 성공!');
        window.location.href = '../main.html'; // 캘린더 페이지로 이동
    } else {
        alert('이메일 또는 비밀번호가 잘못되었습니다.');
    }
}

// 화면 전환 함수
function showLogin() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function showSignup() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}



// 페이지 로드 시 실행 **********************
document.addEventListener('DOMContentLoaded', async function() {
    await initDatabase();
    localStorage.setItem('current_user', JSON.stringify([])); // 현재 사용자 초기화
    console.log("addEventListener 실행 완료");
});