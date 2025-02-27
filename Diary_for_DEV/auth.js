const currentUser = {
    user_id: null,
    username: null,
    email: null,
    password: null,
    lv: 1,
    xp: 0,
    img: 'default_profile.png',
    highscore: 0,
    xpUp: function (xp) {
        this.xp += xp;
        console.log(`✅ 경험치 ${xp} 획득! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        if (this.xp >= this.lv + 1) {
            this.xp -= this.lv + 1;
            this.lv++;
            console.log(`✨ 레벨 업! (현재 레벨: ${this.lv}, 현재 경험치: ${this.xp}`);
        }
        db.exec("UPDATE user SET xp=?, lv=? WHERE user_id=?", [this.xp, this.lv, this.user_id]);
        console.log("✅ 데이터베이스에 경험치 및 레벨 업데이트 완료!");
    }
};

let db;

async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    db = new SQL.Database();
    db.run(`
        CREATE TABLE IF NOT EXISTS user (
                                            user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
                                            username    TEXT UNIQUE NOT NULL COLLATE NOCASE,
                                            email       TEXT UNIQUE NOT NULL,
                                            password    TEXT NOT NULL,
                                            lv          INTEGER DEFAULT 1,
                                            xp          INTEGER DEFAULT 0,
                                            img         TEXT DEFAULT 'default_profile.png'
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS diary_event (
                                                   event_id    INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   user_id     INTEGER NOT NULL,
                                                   title       TEXT NOT NULL,
                                                   category    TEXT NOT NULL,
                                                   memo        TEXT,
                                                   date        TEXT NOT NULL,
                                                   completed   BOOLEAN DEFAULT FALSE,
                                                   FOREIGN KEY (user_id) REFERENCES user(user_id)
            );
    `);
    console.log("✅ 데이터베이스 초기화 완료!");

    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.length > 0) {
        userData[0].values.forEach(user => {
            db.run("INSERT INTO user (user_id, username, email, password, lv, xp, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [user[0], user[1], user[2], user[3], user[4], user[5], user[6]]);
        });
        console.log("✅ user 테이블 데이터 로드 완료!");
    }

    const diaryEventData = JSON.parse(localStorage.getItem('diary_event'));
    if (diaryEventData && diaryEventData.length > 0) {
        diaryEventData[0].values.forEach(event => {
            db.run("INSERT INTO diary_event (event_id, user_id, title, category, memo, date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [event[0], event[1], event[2], event[3], event[4], event[5], event[6]]);
        });
        console.log("✅ diary_event 테이블 데이터 로드 완료!");
    }
}

function saveUserToLocalStorage() {
    const user = db.exec("SELECT * FROM user");
    localStorage.setItem('user', JSON.stringify(user));
    console.log("✅ user 테이블 데이터 저장 완료!");
}

function saveDiaryEventToLocalStorage() {
    const diary_event = db.exec("SELECT * FROM diary_event");
    localStorage.setItem('diary_event', JSON.stringify(diary_event));
    console.log("✅ diary_event 테이블 데이터 저장 완료!");
}

function addUser(name, email, password) {
    db.run("INSERT INTO user (username, email, password) VALUES (?, ?, ?)", [name, email, password]);
}

function validateEmail(email) {
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

async function signup() {
    let username = document.getElementById('signup-username').value;
    let email = document.getElementById('signup-email').value;
    let password = document.getElementById('signup-password').value;
    let confirmPassword = document.getElementById('signup-password-confirm').value;

    if (!username || !email || !password || !confirmPassword) {
        alert('모든 필드를 입력하세요.');
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

    try {
        addUser(username, email, password);
        saveUserToLocalStorage();
        alert('회원가입 성공! 로그인 해주세요.');
        showLogin();
    } catch (error) {
        alert('회원가입 실패: 이미 존재하는 이메일 또는 사용자 이름입니다.');
        console.error("Signup Error:", error);
    }
}

function login() {
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력하세요.');
        return;
    }

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
        window.location.href = 'main.html';
    } else {
        alert('이메일 또는 비밀번호가 잘못되었습니다.');
    }
}

function showLogin() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function showSignup() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async function() {
    await initDatabase();
    localStorage.setItem('current_user', JSON.stringify([]));
    console.log("addEventListener 실행 완료");
});