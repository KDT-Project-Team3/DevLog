let db; // 데이터베이스 객체
const currentUser = { // 현재 사용자 정보
    user_id: null,
    username: null,
    email: null,
    password: null,
    lv: null,
    xp: null,
    img: null
};

// 데이터베이스 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // 1) sqliteDB 데이터베이스 생성
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
    console.log("✅ 데이터베이스 초기화 완료!");

    // 2) localStorage에 저장된 튜플들 불러오기
    // user 테이블
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.length > 0) {
        userData[0].values.forEach(user => {
            db.run("INSERT INTO user (user_id, username, email, password, lv, xp, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [user[0], user[1], user[2], user[3], user[4], user[5], user[6]]);
        });
        console.log("✅ user 테이블 데이터 로드 완료!");
    } else {
        console.warn("⚠️ 로컬 스토리지에 저장된 user 데이터가 없습니다.");
    }
}

// user 테이블의 데이터 저장
function saveUserToLocalStorage() {
    const user = db.exec("SELECT * FROM user");
    localStorage.setItem('user', JSON.stringify(user));
    console.log("✅ user 테이블 데이터 저장 완료!");
}

// localStorage 초기화(콘솔용)
function clearLocalStorage() {
    localStorage.clear();
    console.log("✅ localStorage 초기화 완료!");
}

// 회원 추가
function addUser(name, email, password) {
    db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
        [name, email, password]);
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

// 이메일 유효성 검사
function validateEmail(email) {
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// 회원가입 함수
function signup() {
    let username = document.getElementById('signup-username').value;
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
        addUser(email.split('@')[0], email, password);
        alert('회원가입 성공! 로그인 해주세요.');
        showLogin();
    } catch (error) {
        alert('회원가입 실패: 이미 존재하는 이메일 또는 사용자 이름입니다.');
        console.error("Signup Error:", error);
    }
    saveUserToLocalStorage();
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
        const user = result[0].values[0];
        currentUser.user_id = user[0];
        currentUser.username = user[1];
        currentUser.email = user[2];
        currentUser.password = user[3];
        currentUser.lv = user[4];
        currentUser.xp = user[5];
        currentUser.img = user[6];
        localStorage.setItem('current_user', JSON.stringify(result));
        alert('로그인 성공!');
        window.location.href = 'main.html'; // 캘린더 페이지로 이동
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

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async function() {
    await initDatabase();
    localStorage.setItem('current_user', JSON.stringify([])); // 현재 사용자 초기화
    console.log("addEventListener 실행 완료");
});