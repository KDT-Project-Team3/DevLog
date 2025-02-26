// 배너 문구 변경 및 캘린더 설정
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.querySelector(".banner");
    const messages = [
        "🚀 코드 한 줄이 세상을 바꾼다!",
        "🐞 버그 없는 코드? 신화일 뿐!",
        "💡 주석이 없는 코드는 마법이다. 이해할 수 없으니까!",
        "🔨 '작동하면 건들지 마라' - 개발자의 철학",
        "⚡ console.log('디버깅 중...')",
        "🌎 Java는 커피, JavaScript는 스크립트!",
        "⏳ 99% 완료? 남은 1%가 99%의 시간!",
        "🔥 Git은 기억하지 않는다. 하지만 로그는 기억한다.",
        "🚧 내 코드는 잘 돌아가, 하지만 이유는 몰라!",
        "📌 Stack Overflow가 없으면 개발이 안 돼!",
        "🎯 '이건 임시 코드야' - 10년 지난 코드",
        "🖥️ '이상하네, 내 컴퓨터에서는 되는데?'",
        "💾 'Ctrl + S'는 내 생명줄",
        "📜 TODO: 나중에 리팩토링하기 (절대 안 함)",
        "🎭 CSS는 마법이다. 예상대로 동작할 때가 없다.",
        "🌐 HTML은 프로그래밍 언어가 아니다! 하지만 없으면 웹도 없다!",
        "💀 'undefined'는 개발자의 최악의 악몽",
        "📌 null과 undefined의 차이를 안다면 이미 고수다.",
        "🔁 while(true) { work(); sleep(0); } // 개발자의 현실",
        "🔧 '이건 쉬운 수정이야'라고 말하면 안 돼...",
        "🤯 개발자는 코드를 짜는 게 아니라 버그를 고치는 직업이다.",
        "🚀 컴파일은 성공했지만 실행은 안 된다? 축하합니다, 진정한 개발자입니다!",
        "🤖 AI가 코드를 짜는 날이 와도, 버그는 우리가 고쳐야 한다!",
        "💡 '일단 작동하게 만들고, 나중에 깔끔하게 정리하자' - 영원히 정리되지 않음",
        "🔥 '이거 왜 안 돼?' 보다 더 무서운 말: '이거 왜 돼?'",
        "🕵️ '네트워크 문제일 수도 있어' - 모든 문제의 만능 변명",
        "🐛 '이거 분명히 어제는 잘 됐는데…'",
        "🔄 '새벽 2시에 급하게 수정한 코드가 제일 오래 살아남는다'",
        "🛠️ '한 줄만 바꿨는데, 다 망가졌다'",
        "🎭 '리팩토링'이란 코드를 고치는 게 아니라 다시 짜는 것",
        "🚀 '이거 프로덕션에 올려도 괜찮겠지?' - 가장 위험한 말",
        "💾 '우리 서비스는 안전해! 매일 AWS에 5달러를 쓰고 있거든!'",
        "🤯 '이 코드를 작성한 사람 누구야?' (Git blame 했더니 나옴)",
        "🕶️ '이거 대충 짜고 나중에 고치자' = 절대 고치지 않음",
        "💀 '설마 이거 한 줄 바꾼다고 터지겠어?' -> 터짐",
        "🕹️ '야, 이거 왜 안 돼?' '캐시 지웠어?' '어…'",
        "🧩 '배포 전에 테스트 해봤어?' '아니, 근데 내 로컬에서는 잘 됐어!'",
        "🔎 '네가 짠 코드인데 이해 못 하는 건 정상임'",
        "👾 '이거 버그야?' '아냐, 기능이야'",
        "💡 '개발자는 코드를 작성하는 게 아니라 Stack Overflow에서 카피 & 페이스트하는 직업이다'",
        "🚀 '마지막 수정이에요!' - 무조건 한 번 더 수정하게 됨",
        "🔄 'npm install' 했다가 프로젝트 터지는 중…",
        "🔑 '비밀번호는 1234로 해두자, 나중에 바꾸면 돼' -> 절대 안 바꿈",
        "💥 '이 코드 지워도 돼?' -> (지운 후) -> '어… 다시 살려야 할 것 같은데?'",
        "📊 '이거 왜 빨라?' -> 원인 모름",
        "📉 '이거 왜 느려?' -> 원인 모름",
        "🔥 '이 코드 완벽해!' -> 배포 후 에러 로그 폭발",
        "👨‍💻 '개발자는 기획서를 보고 개발하는 게 아니라, 기획자와 싸우면서 개발한다'",
        "🧐 '이 코드 누가 짰어?' (Git blame) -> '아… 나네'",
        "🔍 '이게 왜 안 돼?' (5시간 후) -> '아, 세미콜론 하나 빠졌네'",
        "🎮 '게임 한 판만 하고 일해야지' -> 새벽 3시",
        "🛠️ '다시 실행해보세요' -> 만능 해결책",
        "🔄 '야, 이거 다시 시작해봤어?' -> 개발자 기술지원 1단계",
        "🚀 '아무도 안 건드렸는데 갑자기 안 돼요!' -> 자동으로 고장 난 서버는 없다"
    ];

    let currentIndex = 0;
    function changeBannerText() {
        banner.textContent = messages[currentIndex];
        currentIndex = (currentIndex + 1) % messages.length;
    }
    setInterval(changeBannerText, 3000);

    // 카테고리별 색상 매핑
    const categoryColors = {
        Java: '#ff7a33',       // 주황색
        C: '#0000FF',          // 파란색
        JavaScript: '#ffae00', // 노란색
        HTML: '#008000'        // 초록색
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
            window.open('check_event.html?date=' + info.dateStr, 'eventPopup',
                'width=500,height=500,top=100,left=100,scrollbars=no,resizable=no');
        },
        eventClick: function(info) {
            window.open('check_event.html?date=' + info.event.startStr, 'eventPopup',
                'width=500,height=500,top=100,left=100,scrollbars=no,resizable=no');
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

    // 모달 창 닫기 (사용되지 않음 제거 가능)
    document.querySelector('.close').onclick = function() {
        document.getElementById('eventModal').style.display = 'none';
    };

    // 일정 저장 (빈 제목 경고 문제 해결)
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

        if (selectedEvent) {
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

    // 일정 삭제 (사용되지 않음 제거 가능)
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
        Java: '#ff7a33',
        C: '#0000FF',
        JavaScript: '#ffae00',
        HTML: '#008000'
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