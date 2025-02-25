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
    calendar.render();
});

    db = new SQL.Database(); // 새 SQLite DB 생성

    db.run(`
        CREATE TABLE user (
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
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: 'dayGridMonth today',
            center: 'title',
            right: 'prev,next'
        },
        initialDate: '2023-01-12',
        navLinks: true,
        selectable: true,
        selectMirror: true,
        events: function(info, successCallback) {
            let events = JSON.parse(localStorage.getItem('event')) || [];
            let filteredEvents = events.filter(event => {
                return event.date === info.startStr;
            });
            successCallback(filteredEvents);
        },
        dateClick: function(info) {
            const modal = new bootstrap.Modal(document.getElementById('eventModal'));
            document.getElementById('eventDetails').innerHTML = ''; // 이전 내용 초기화

            let events = JSON.parse(localStorage.getItem('event')) || [];
            let filteredEvents = events.filter(event => {
                return event.date === info.dateStr; // 클릭한 날짜에 해당하는 일정들만 필터링
            });

            // 해당 날짜에 있는 일정들을 표시
            filteredEvents.forEach(event => {
                let eventDiv = document.createElement('div');
                eventDiv.style.backgroundColor = event.color; // 색상 적용
                eventDiv.style.padding = '5px';
                eventDiv.style.marginBottom = '5px';
                eventDiv.style.color = 'white';
                eventDiv.style.borderRadius = '5px';
                eventDiv.innerText = event.title; // 제목 표시
                document.getElementById('eventDetails').appendChild(eventDiv);
            });

            modal.show();
        },
        select: function(info) {
            const modal = new bootstrap.Modal(document.getElementById('eventModal')); // 일정 확인 모달 초기화
            const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal')); // 일정 추가 모달 초기화

            // 일정 확인 모달 띄우기
            modal.show();

            // 플러스 버튼 클릭 시 일정 추가 모달 띄우기
            document.getElementById('add-event').onclick = function() {
                addEventModal.show();  // 일정 추가 모달 띄우기
            };

            // 일정 추가 모달에서 저장 버튼 클릭 시 일정 추가
            document.getElementById('save-event').onclick = function() {
                var title = document.getElementById('event-title').value;
                var category = document.getElementById('event-category').value;
                var color = categoryColor(category); // 카테고리에 맞는 색상 반환

                if (title && category) {
                    // 일정 추가
                    calendar.addEvent({
                        title: title,
                        start: info.startStr,
                        allDay: true,
                        description: category,
                        backgroundColor: color // 일정 색상 추가
                    });

                    // 로컬스토리지에 저장
                    let event = JSON.parse(localStorage.getItem('event')) || [];
                    event.push({
                        title: title,
                        date: info.startStr,
                        category: category,
                        color: color // 색상 추가
                    });
                    localStorage.setItem('event', JSON.stringify(event));

                    // 일정 추가 후 해당 날짜 클릭 시 자동으로 일정 표시되게 설정
                    document.getElementById('eventDetails').innerHTML =
                        `<div style="background-color: ${color}; padding: 5px; color: white; border-radius: 5px;">${title}</div>`;

                    // 일정 추가 후 모달 닫고, 일정 확인 모달 띄우기
                    setTimeout(function() {
                        modal.show(); // 일정 확인 모달 다시 띄우기
                        addEventModal.hide(); // 일정 추가 모달 닫기
                    }, 300); // 300ms 후에 모달 닫기
                } else {
                    alert('일정 제목과 카테고리를 입력해주세요!');
                }
            };
        }
    });

    calendar.render();
});

function categoryColor(category) {
    switch (category) {
        case 'Java':
            return '#ff5733'; // 예시: Work는 빨간색
        case 'C':
            return '#094dff'; // 예시: Meeting은 파란색
        case 'JavaScript':
            return '#ffd70f'; // 예시: Personal은 초록색
        case 'HTML':
            return '#4caf50'; // 예시: Personal은 초록색
        default:
            return '#ccc'; // 기본 색상
    }
}

