// DB 관련
let db; // 데이터베이스 객체
const DB_NAME = 'sqliteDB'; // IndexedDB 데이터베이스 이름

// SQLite 환경 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // 1) 브라우저 IndexedDB 를 통한 초기화
    const savedDb = await loadDBFromIdxDB();
    if (savedDb) {
        db = new SQL.Database(new Uint8Array(savedDb));
        console.log("✅ 브라우저 IndexedDB 에서 데이터 초기화 완료!");
        displayUsers();
        return;
    }

    // 2) 새로운 데이터베이스 생성
    db = new SQL.Database();
    db.run(`
        CREATE TABLE IF NOT EXISTS user (
            user_id     INTEGER PRIMARY KEY AUTOINCREMENT,      -- 사용자 ID
            username    TEXT UNIQUE NOT NULL COLLATE NOCASE,    -- 사용자 이름
            email       TEXT UNIQUE NOT NULL,                   -- 이메일
            password    TEXT NOT NULL,                          -- 비밀번호
            lv          INTEGER DEFAULT 1,                      -- 레벨
            xp          INTEGER DEFAULT 0,                      -- 경험치
            img         TEXT DEFAULT 'default_profile.png'      -- 프로필 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS diary_event (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT,  -- 이벤트 ID
            user_id     INTEGER NOT NULL,                   -- 사용자 ID
            title       TEXT NOT NULL,                      -- 제목
            com_lang    TEXT NOT NULL,                      -- 관련 언어
            memo        TEXT,                               -- 메모
            date        TEXT NOT NULL,                      -- 날짜
            completed   BOOLEAN DEFAULT FALSE,              -- 완료 여부
            
            FOREIGN KEY (user_id) REFERENCES user(user_id)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS achievement (
            ach_id  INTEGER PRIMARY KEY AUTOINCREMENT,-- 칭호 ID
            title   TEXT NOT NULL,  -- 칭호명
            flavor  TEXT NOT NULL,  -- 칭호 설명
            trigger TEXT NOT NULL,  -- 칭호 획득 조건
            img     TEXT NOT NULL   -- 칭호 이미지
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS user_achievement (
            user_id INTEGER NOT NULL,   -- 사용자 ID
            ach_id  INTEGER NOT NULL,   -- 칭호 ID
            
            FOREIGN KEY (user_id) REFERENCES user(user_id),
            FOREIGN KEY (ach_id) REFERENCES achievement(ach_id),
            PRIMARY KEY (user_id, ach_id)
        );
    `);
    console.warn("⚠️ 새로 브라우저 DB 생성 (빈 스키마 초기화)");
}

// 데이터베이스 IndexedDB에 저장
function saveDBToIdxDB() {
    const dbData = db.export();
    const buffer = dbData.buffer; // ArrayBuffer 추출
    // indexedDB.deleteDatabase(DB_NAME);
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (event) => {
        const db = event.target.result;
        // 오브젝트 스토어 존재 여부 확인
        if (!db.objectStoreNames.contains("sqliteDB")) {
            console.log("❌ 'sqliteDB' 오브젝트 스토어가 생성되지 않아 종료합니다.");
        }
        const transaction = db.transaction("sqliteDB", "readwrite");
        const store = transaction.objectStore("sqliteDB");
        const putRequest = store.put(buffer, "db");
        putRequest.onsuccess = () => {
            console.log("💾 데이터베이스가 IndexedDB에 안전하게 저장되었습니다.");
        };
        putRequest.onerror = (err) => {
            console.error("❌ IndexedDB 저장 실패:", err);
        };
        // 트랜잭션 완료 시점까지 기다리기
        transaction.oncomplete = () => {
            console.log("✅ (DB 저장) IndexedDB 트랜잭션 완료");
        }
    };
    request.onerror = (err) => {
        console.error("❌ IndexedDB 열기 실패:", err);
    };
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("sqliteDB");
    };
}

// IndexedDB 에서 데이터베이스 불러오기
async function loadDBFromIdxDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            // 오브젝트 스토어 존재 여부 확인
            if (!db.objectStoreNames.contains("sqliteDB")) {
                console.warn("⚠️ 'sqliteDB' 오브젝트 스토어가 존재하지 않습니다.");
                resolve(null);
                return;
            }
            const transaction = db.transaction("sqliteDB", "readonly");
            const store = transaction.objectStore("sqliteDB");
            const getRequest = store.get("db");
            getRequest.onsuccess = () => {
                resolve(getRequest.result ? getRequest.result.arrayBuffer() : null);
            };
            getRequest.onerror = () => reject("❌ 데이터베이스 로딩 실패");
            // 트랜잭션 완료 시점 명확히 처리
            transaction.oncomplete = () => {
                console.log("✅ IndexedDB 트랜잭션 완료");
            };
        };
        request.onerror = () => reject("❌ IndexedDB 열기 실패");
    });
}

// IndexedDB의 DB 삭제 (초기화)
// 텍스트 목적으로 콘솔에서만 사용할 것!
async function clearIdxDB() {
    console.log("🗑 IndexedDB 삭제 시작...");
    // 현재 IndexedDB 목록 가져오기
    const databases = await indexedDB.databases();
    const dbExists = databases.some(db => db.name === DB_NAME);
    if (!dbExists) {
        console.log("📂 IndexedDB가 존재하지 않음. 삭제 작업을 중단합니다.");
        return;  // ❌ DB가 없으면 함수 종료
    }

    console.log("🔒 열린 IndexedDB 닫기...");
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = (event) => {
        const db = event.target.result;
        db.close();  // DB 닫기
        console.log("✅ IndexedDB 연결 닫음. 삭제 시작...");
        deleteDatabase();
    };
    request.onerror = (err) => {
        console.error("❌ DB 열기 실패:", err);
    };
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

// 회원 정보 수정(현재는 콘솔용)
function updateUser(name, email, password, lv, xp, img, id) {
    db.run("UPDATE user SET username=?, email=?, password=?, lv=?, xp=?, img=? WHERE user_id=?", [name, email, password, lv, xp, img, id]);
    displayUsers();
}

// 회원 삭제(현재는 콘솔용)
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
        saveDBToIdxDB(); // 로그인 성공 시 IndexedDB에 저장
        alert('로그인 성공!');
        window.location.href = '../index.html'; // 캘린더 페이지로 이동
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
});