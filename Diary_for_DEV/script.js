let db;
let isDbInitialized = false;
let SQL;

// 로그인한 사용자 정보
const currentUser = {
    name: 'suyeong',
    email: 'suyeong@example.com',
    lv: 2,
    xp: 50,
    img: 'suyeong.png',
    lvUp: function () {
        this.xp -= (this.lv - 1) * 100 + 50;
        this.lv++;
    },
    xpUp: function (xp) {
        this.xp += xp;
        if (this.xp >= this.lv * 100 + 50) {
            this.lvUp();
        }
    }
};

// 업적 목록
// 업적 달성 확인 함수 테스트 후 db에서 데이터를 가져오도록 변경 예정
const achievements = [
    {
        name: 'JavaScript 마스터',
        flavor: 'JavaScript 1개 달성',
        img: 'js.png',
        isChecked: true
    },
    {
        name: 'Python 마스터',
        flavor: 'Python 2개 달성',
        img: 'python.png',
        isChecked: false
    },
    {
        name: 'HTML/CSS 연습',
        flavor: 'HTML 2개 달성',
        img: 'htmlcss.png',
        isChecked: false
    }
];

function saveDatabase() {
    localStorage.setItem('database', db.export());
}

function loadDatabase() {
    const data = localStorage.getItem('database');
    if (data) {
        db = new SQL.Database(new Uint8Array(data));
        console.log("✅ 저장된 데이터베이스 로드 성공!");
    } else {
        db = new SQL.Database();
        console.log("🔹 새로운 데이터베이스 생성!");
        // 테이블 생성
        db.run(`
            CREATE TABLE IF NOT EXISTS user (
                user_id  INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                email    TEXT UNIQUE NOT NULL,
                password CHAR(60) NOT NULL,
                lv       INTEGER NOT NULL DEFAULT 1,
                xp       INTEGER NOT NULL DEFAULT 0,
                img      TEXT DEFAULT 'default_profile.png'
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS diary_events (
                event_id    INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL,
                title       TEXT NOT NULL DEFAULT '',
                com_lang    TEXT NOT NULL,
                xp          INTEGER NOT NULL,
                description TEXT DEFAULT '',
                event_date  TEXT NOT NULL CHECK (event_date GLOB '????-??-??'),
                FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS achievement (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name      TEXT NOT NULL,
                flavor    TEXT NOT NULL CHECK (LENGTH(flavor) <= 255),
                img      TEXT
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS user_achievement (
                user_id    INTEGER NOT NULL,
                achievement_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE,
                FOREIGN KEY (achievement_id) REFERENCES achievement (id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, achievement_id)
            );
        `);
        insertDummyData(); // 더미 데이터 삽입
    }
    isDbInitialized = true;
}

function insertDummyData() {
    // 로그인 더미 데이터 (user 테이블)
    db.run(`
        INSERT INTO user (username, email, password, lv, xp, img) VALUES
            ('suyeong', 'suyeong@example.com', 'pass123', 2, 50, 'suyeong.png'),
            ('minji', 'minji@example.com', 'secure456', 3, 100, 'minji.png'),
            ('1', '1@1.1', '1', 1, 0, '.png'),
            ('joon', 'joon@example.com', 'test789', 1, 10, 'default_profile.png');
    `);

    // 기타 더미 데이터 (diary_events 테이블)
    db.run(`
        INSERT INTO diary_events (user_id, title, com_lang, xp, description, event_date) VALUES
            (1, 'JavaScript 배우기', 'JavaScript', 30, '기본 문법 공부 완료', '2025-03-01'),
            (2, 'Python 프로젝트', 'Python', 50, '간단한 웹 앱 제작', '2025-03-02'),
            (3, 'HTML/CSS 연습', 'HTML', 20, '반응형 디자인 연습', '2025-03-03'),
            (1, 'Python 프로젝트', 'Python', 50, '데이터 분석 프로젝트', '2025-03-04'),
            (1, 'HTML/CSS 연습', 'HTML', 20, '포트폴리오 제작', '2025-03-05');
    `);
    db.run(`
        INSERT INTO achievement (name, flavor, img) VALUES
            ('JavaScript 마스터', '{"category":"JavaScript","count":"1"}', 'js.png'),
            ('Python 마스터', '{"category":"Python","count":"2"}', 'python.png'),
            ('HTML/CSS 연습', '{"category":"HTML","count":"2"}', 'htmlcss.png');
    `);
    console.log("✅ 더미 데이터 삽입 완료!");
}

async function initDatabase() {
    console.log("🔹 1. 데이터베이스 초기화 시작...");
    try {
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.wasm`
        });
        console.log("🔹 2. SQL.js 로드 완료!");
        loadDatabase();
        console.log("✅ 데이터베이스 초기화 성공!");
    } catch (error) {
        console.error("❌ 데이터베이스 초기화 실패:", error.message, error.stack);
        alert("🚨 데이터베이스 초기화에 실패했습니다. 콘솔을 확인하세요.");
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signup() {
    if (!isDbInitialized) {
        alert("🚨 데이터베이스가 아직 초기화 중입니다. 잠시 후 다시 시도하세요.");
        return;
    }
    let username = document.getElementById('signup-username')?.value;
    let email = document.getElementById('signup-email')?.value;
    let password = document.getElementById('signup-password')?.value;
    let confirmPassword = document.getElementById('signup-password-confirm')?.value;

    if (!username || !email || !password || !confirmPassword) {
        alert('📢 사용자 이름, 이메일, 비밀번호를 모두 입력하세요.');
        return;
    }

    if (!validateEmail(email)) {
        alert('📢 올바른 이메일 형식을 입력하세요.');
        return;
    }

    if (password !== confirmPassword) {
        alert('📢 비밀번호가 일치하지 않습니다.');
        return;
    }

    let checkStmt = db.prepare("SELECT * FROM user WHERE email = ? OR username = ?");
    checkStmt.bind([email, username]);
    if (checkStmt.step()) {
        alert('❌ 이미 존재하는 이메일 또는 사용자 이름입니다.');
        checkStmt.free();
        return;
    }
    checkStmt.free();

    console.log("🔍 삽입할 데이터:", { username, email, password });
    db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [username, email, password]);
    saveDatabase();
    alert('✅ 회원가입 성공! 로그인 해주세요.');
    showLogin();
    showUsers();
}

function login() {
    if (!isDbInitialized) {
        alert("🚨 데이터베이스가 아직 초기화 중입니다. 잠시 후 다시 시도하세요.");
        return;
    }
    let email = document.getElementById('login-email')?.value;
    let password = document.getElementById('login-password')?.value;

    if (!email || !password) {
        alert('📢 이메일과 비밀번호를 입력하세요.');
        return;
    }

    let stmt = db.prepare("SELECT * FROM user WHERE email = ? AND password = ?");
    stmt.bind([email, password]);
    if (stmt.step()) {
        let user = stmt.getAsObject(); // 로그인한 사용자 정보 전달
        currentUser.name = user.username;
        currentUser.email = user.email;
        currentUser.lv = user.lv;
        currentUser.xp = user.xp;
        currentUser.img = user.img;

        alert('✅ 로그인 성공!');
        window.location.href = 'index.html';
    } else {
        alert('❌ 이메일 또는 비밀번호가 잘못되었습니다.');
    }
    stmt.free();
}

function showLogin() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function showSignup() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}

function toggleButtons(disabled) {
    const signupButton = document.getElementById("signup-button");
    const loginButton = document.getElementById("login-button");
    if (signupButton) signupButton.disabled = disabled;
    if (loginButton) loginButton.disabled = disabled;
}

function showUsers() {
    if (!isDbInitialized) {
        console.log("🚨 데이터베이스가 초기화되지 않았습니다.");
        return;
    }
    // 🚨 `user` 테이블이 존재하는지 확인
    let checkTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user';");
    if (!checkTable.step()) {
        console.warn("⚠️ `user` 테이블이 존재하지 않음! 새로 생성합니다.");
        db.run(`
            CREATE TABLE IF NOT EXISTS user (
                user_id  INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                email    TEXT UNIQUE NOT NULL,
                password CHAR(60) NOT NULL,
                lv       INTEGER NOT NULL DEFAULT 1,
                xp       INTEGER NOT NULL DEFAULT 0,
                img      TEXT DEFAULT 'default_profile.png'
            );
        `);
        console.log("✅ `user` 테이블을 다시 생성했습니다.");
    } else {
        console.log("✅ `user` 테이블 확인 완료.");
    }
    checkTable.free();

    console.log("🔍 저장된 사용자 목록:");
    let stmt = db.prepare("SELECT user_id, username, email, password, lv, xp, img FROM user");
    while (stmt.step()) {
        let row = stmt.getAsObject();
        console.log(row);
    }
    stmt.free();

    let userList = document.getElementById('user-list');
    if (userList) {
        userList.innerHTML = '<h3>저장된 사용자</h3><ul>';
        stmt = db.prepare("SELECT user_id, username, email FROM user");
        while (stmt.step()) {
            let row = stmt.getAsObject();
            userList.innerHTML += `<li>ID: ${row.user_id}, 사용자 이름: ${row.username}, 이메일: ${row.email}</li>`;
        }
        stmt.free();
        userList.innerHTML += '</ul>';
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    console.log("🔹 DOM 로드 완료. 데이터베이스 초기화 시작...");
    toggleButtons(true);

    const statusElement = document.createElement('div');
    statusElement.id = 'init-status';
    statusElement.textContent = '🔄 데이터베이스 초기화 중...';
    statusElement.style.position = 'fixed';
    statusElement.style.top = '10px';
    statusElement.style.left = '50%';
    statusElement.style.transform = 'translateX(-50%)';
    document.body.appendChild(statusElement);

    await initDatabase();

    if (isDbInitialized) {
        toggleButtons(false);
        statusElement.textContent = '✅ 초기화 완료!';
        console.log("✅ 모든 초기화 완료!");
        showUsers();
        setTimeout(() => statusElement.remove(), 2000);
    } else {
        console.error("❌ 데이터베이스 초기화 실패로 추가 작업 중단");
        statusElement.textContent = '❌ 초기화 실패. 새로고침을 시도하세요.';
        toggleButtons(true);
    }
});