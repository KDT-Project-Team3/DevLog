///todo 1: 캘린더 생성 예은 O
///todo 2: 날짜별 일정 등 등록/ 수정/ 삭제 예은
///todo 3: 카테고리 예은
///todo 4: 일정 완료시 경험치 반환 -> 나중에
///todo 5: 배너 수영 O
///todo 6: DDL 작성 수영 O

// 데이터베이스 초기화 (기존 코드 유지)
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

// 배너 문구 변경 및 캘린더 설정
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.querySelector(".banner");
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
        banner.textContent = messages[currentIndex];
        currentIndex = (currentIndex + 1) % messages.length;
    }
    setInterval(changeBannerText, 3000);

    // 카테고리별 색상 매핑
    const categoryColors = {
        Java: '#FFA500',       // 주황색
        C: '#0000FF',          // 파란색
        JavaScript: '#FFFF00', // 노란색
        HTML: '#008000',       // 초록색
        Holiday: '#FF0000'     // 공휴일은 빨간색으로 설정
    };

    // 캘린더 설정
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        height: '700px',
        locale: 'ko',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        initialDate: '2025-02-26',
        selectable: true,
        dateClick: function(info) {
            openModal(info.dateStr, null);
        },
        eventClick: function(info) {
            openModal(info.event.startStr, info.event);
        },
        events: loadEventsFromLocalStorage()
    });
    calendar.render();

    // 대체 API 로 공휴일 가져오기 (date.nager.at)
    async function fetchHolidays() {
        const url = 'https://date.nager.at/api/v3/publicholidays/2025/KR'; // 공휴일 API
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status} - ${response.statusText}`);
            }
            const holidays = await response.json();
            holidays.forEach(holiday => {
                calendar.addEvent({
                    title: holiday.localName,
                    start: holiday.date,
                    allDay: true,
                    backgroundColor: categoryColors['Holiday'],
                    borderColor: categoryColors['Holiday'],
                    extendedProps: { memo: holiday.name || '', isHoliday: true }
                });
            });
            console.log('공휴일 로드 완료:', holidays);
        } catch (error) {
            console.error('공휴일 가져오기 오류:', error);
        }
    }
    fetchHolidays();

    // 모달 창 열기 함수
    let selectedEvent = null;
    function openModal(date, event) {
        const modal = document.getElementById('eventModal');
        const titleInput = document.getElementById('eventTitle');
        const categorySelect = document.getElementById('eventCategory');
        const memoInput = document.getElementById('eventMemo');
        const deleteBtn = document.getElementById('deleteEvent');
        window.selectedDate = date;

        if (event) {
            selectedEvent = event;
            titleInput.value = event.title.split(' (')[0];
            categorySelect.value = event.title.match(/\(([^)]+)\)/)?.[1] || 'Java';
            memoInput.value = event.extendedProps.memo || '';
            deleteBtn.style.display = event.extendedProps.isHoliday ? 'none' : 'inline';
        } else {
            selectedEvent = null;
            titleInput.value = '';
            categorySelect.value = 'Java';
            memoInput.value = '';
            deleteBtn.style.display = 'none';
        }
        modal.style.display = 'block';
    }

    // 모달 창 닫기
    document.querySelector('.close').onclick = function() {
        document.getElementById('eventModal').style.display = 'none';
    };

    // 일정 저장
    document.getElementById('eventForm').onsubmit = function(e) {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value.trim();
        const category = document.getElementById('eventCategory').value;
        const memo = document.getElementById('eventMemo').value.trim();
        const date = window.selectedDate;

        if (!title) {
            alert('일정을 입력하시오');
            return;
        }

        const events = JSON.parse(localStorage.getItem('events')) || {};

        if (selectedEvent && !selectedEvent.extendedProps.isHoliday) {
            selectedEvent.remove();
            if (!events[date]) events[date] = [];
            events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
            alert('일정이 수정되었습니다.');
        } else if (!selectedEvent) {
            alert('일정이 등록되었습니다!');
        }

        if (!events[date]) events[date] = [];
        events[date].push({ title, category, memo });
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent({
            title: `${title} (${category})`,
            start: date,
            allDay: true,
            backgroundColor: categoryColors[category],
            borderColor: categoryColors[category],
            extendedProps: { memo }
        });

        document.getElementById('eventModal').style.display = 'none';
        document.getElementById('eventForm').reset();
    };

    // 일정 삭제
    document.getElementById('deleteEvent').onclick = function() {
        if (selectedEvent && !selectedEvent.extendedProps.isHoliday && confirm('일정을 정말 삭제하시겠습니까?')) {
            const date = window.selectedDate;
            const events = JSON.parse(localStorage.getItem('events')) || {};
            events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
            if (events[date].length === 0) delete events[date];
            localStorage.setItem('events', JSON.stringify(events));
            selectedEvent.remove();
            document.getElementById('eventModal').style.display = 'none';
            alert('일정이 삭제되었습니다.');
        }
    };
});

// 로컬 스토리지에서 일정 불러오기
function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem('events')) || {};
    const eventList = [];
    const categoryColors = {
        Java: '#FFA500',
        C: '#0000FF',
        JavaScript: '#FFFF00',
        HTML: '#008000',
        Holiday: '#FF0000'
    };
    for (const date in events) {
        events[date].forEach(event => {
            eventList.push({
                title: `${event.title} (${event.category})`,
                start: date,
                allDay: true,
                backgroundColor: categoryColors[event.category],
                borderColor: categoryColors[event.category],
                extendedProps: { memo: event.memo }
            });
        });
    }
    return eventList;
}