///todo 1: 캘린더 생성 예은 O
///todo 2: 날짜별 일정 등 등록/ 수정/ 삭제 예은
///todo 3: 카테고리 예은
///todo 4: 일정 완료시 경험치 반환 -> 나중에
///todo 5: 배너 수영 O
///todo 6: DDL 작성 수영 O

// 데이터 베이스
let db; // 데이터베이스 객체

// SQLite 환경 초기화
async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    db = new SQL.Database(); // 새 SQLite DB 생성

    db.run(`
        CREATE TABLE user (
            user_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            username  TEXT UNIQUE NOT NULL COLLATE NOCASE,
            email     TEXT UNIQUE NOT NULL,
            password  CHAR(60) NOT NULL,
            lv        INTEGER NOT NULL DEFAULT 1,
            xp        INTEGER NOT NULL DEFAULT 0,
            img       TEXT DEFAULT 'default_profile.png'
        );

        CREATE TABLE diary_events (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            title       TEXT NOT NULL DEFAULT '',
            com_lang    TEXT NOT NULL,
            xp          INTEGER NOT NULL,
            description TEXT DEFAULT '',
            event_date  TEXT NOT NULL CHECK (event_date GLOB '????-??-??'),
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
        );

        CREATE TABLE achievement (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            name    TEXT NOT NULL,
            flavor  TEXT NOT NULL CHECK (LENGTH(flavor) <= 255),
            img     TEXT
        );

        CREATE TABLE user_achievement (
            user_id        INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
            FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE
        );
    `);

    console.log("Database initialized successfully.");

    // 사용자 목록 표시 (테스트용)
    displayUsers();

    // 캘린더 렌더링은 데이터베이스가 완전히 초기화된 후 실행
    calendar.render();
}

// 데이터베이스 초기화 실행
initDatabase().catch(error => console.error("Database Initialization Error:", error));



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

    let currentIndex = 0; // currentIndex 선언 (초기값 0)


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




// 로컬 스토리지에서 이벤트 로드
function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem('events')) || {};
    const eventList = [];
    for (const date in events) {
        if (Array.isArray(events[date])) {
            events[date].forEach(event => {
                eventList.push({
                    title: `${event.title} (${event.category})`,
                    start: date,
                    allDay: true
                });
            });
        } else {
            console.warn(`${date}에 해당하는 데이터가 배열이 아닙니다.`, events[date]);
        }
    }
    return eventList;
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM 로드 완료 - 스크립트 시작");

    var calendarEl = document.getElementById('calendar');

    if (!calendarEl) {
        console.error("❌ #calendar 요소를 찾을 수 없음!");
        return;
    }

    var calendar = new FullCalendar.Calendar(calendarEl, {
        height: '700px',
        expandRows: true,
        slotMinTime: '08:00',
        slotMaxTime: '20:00',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },

        initialView: 'dayGridMonth',
        initialDate: '2025-02-26',
        navLinks: true,
        editable: true,
        selectable: true,
        nowIndicator: true,
        dayMaxEvents: true,
        locale: 'ko',

        eventAdd: function(obj) {
            console.log("🟢 이벤트 추가됨:", obj.event);
        },

        eventChange: function(obj) {
            console.log("🟡 이벤트 변경됨:", obj.event);
        },

        eventRemove: function(obj){
            console.log("🔴 이벤트 삭제됨:", obj.event);
        },

        select: function(arg) {
            var title = prompt('이벤트 제목을 입력하세요:');
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: arg.start,
                    end: arg.end,
                    allDay: arg.allDay
                });
            }
            calendar.unselect();
        },

        events: [
            { title: 'All Day Event', start: '2025-02-01' },
            { title: 'Long Event', start: '2025-02-02', end: '2025-02-10' },
            { groupId: 999, title: 'Repeating Event', start: '2025-02-09T16:00:00' },
            { title: 'Conference', start: '2025-02-11', end: '2025-02-13' },
            { title: 'Meeting', start: '2025-02-12T10:30:00', end: '2025-02-12T12:30:00' },
            { title: 'Lunch', start: '2025-02-12T12:00:00' },
            { title: 'Meeting', start: '2025-02-12T14:30:00' },
            { title: 'Dinner', start: '2025-02-12T20:00:00' },
            { title: 'Birthday Party', start: '2025-02-13T02:00:00' },
            { title: 'Click for Google', url: 'http://google.com/', start: '2025-02-28' }
        ]
    });

    calendar.render();
    console.log("✅ FullCalendar 렌더링 완료");
});

// // 캘린더 생성
// document.addEventListener('DOMContentLoaded', function() {
//     var calendarEl = document.getElementById('calendar');
//     var calendar = new FullCalendar.Calendar(calendarEl, {
//         initialView: 'dayGridMonth', // 월간 뷰
//         events: loadEventsFromLocalStorage(), // 로컬 스토리지에서 이벤트 로드
//         dateClick: function(info) {
//             window.open(`check_event.html?date=${info.dateStr}`, '_blank', 'width=600,height=400');
//         }
//     });
//     calendar.render();
//
//     // window 객체에 함수 추가 (팝업에서 호출 가능하도록)
//     window.addEventToCalendar = function(date, title, category) {
//         calendar.addEvent({
//             title: `${title} (${category})`,
//             start: date,
//             allDay: true
//         });
//         console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
//     };
// });