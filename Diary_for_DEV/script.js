///todo 1: 캘린더 생성
///todo 2: 날짜별 일정 등 등록/ 수정/ 삭제
///todo 3: 카테고리
///todo 4: 일정 완료시 경험치 반환 -> 나중에
///todo 5: 배너
// let db;
// // SQLite 환경 초기화
// async function initDatabase() {
//     const SQL = await initSqlJs({
//         locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
//     });    // DB 없으면 새로 생성
//     db = new SQL.Database();
//
//     // users 테이블 생성
//     db.run(
//         `CREATE TABLE users (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name VARCHAR(30) NOT NULL,
//             email VARCHAR(30) NOT NULL
//         );`
//     );
//     displayUsers();
// }

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: "100%"
    });
    calendar.render();
});

// 날짜 클릭 -> 일정 추가
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

