// URL에서 날짜 가져오기
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// 이벤트 목록 렌더링
function renderEvents(selectedDate, events) {
    const eventList = document.getElementById('event-list');
    const doneList = document.getElementById('done-list');
    eventList.innerHTML = '';
    doneList.innerHTML = '';

    if (selectedDate && events[selectedDate] && Array.isArray(events[selectedDate])) {
        events[selectedDate].forEach((event, index) => {
            const li = document.createElement('li');
            li.className = 'event-item';
            if (event.completed) {
                li.innerHTML = `
            <span>${event.title} (${event.category})</span>
            <button class="edit-btn" data-index="${index}">수정</button>
            <button class="delete-btn" data-index="${index}">삭제</button>
          `;
                doneList.appendChild(li);
            } else {
                li.innerHTML = `
            <input type="checkbox" data-index="${index}">
            <span>${event.title} (${event.category})</span>
            <button class="edit-btn" data-index="${index}">수정</button>
            <button class="delete-btn" data-index="${index}">삭제</button>
          `;
                eventList.appendChild(li);
            }
        });
    }

    if (eventList.children.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-events';
        li.textContent = '일정을 추가하세요!';
        eventList.appendChild(li);
    }
    if (doneList.children.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-events';
        li.textContent = '완료된 항목이 없습니다.';
        doneList.appendChild(li);
    }
}

// x 버튼 클릭시 저장 및 닫기
function saveAndClose() {
    const selectedDate = getQueryParam('date');
    const events = JSON.parse(localStorage.getItem('events') || '{}');

    // localStorage에 저장된 이벤트를 변수로 준비
    const updatedEvents = events[selectedDate] || [];

    // 부모 창의 캘린더에 반영
    if (window.opener) {
        window.opener.updateEvents = updatedEvents; // 변슈 전달
        window.opener.location.reload(); // 부모 창 새로 고침
        console.log('updated events', updatedEvents);
    } else {
        console.warn('failed to save events');
    }
    // 창 닫기
    window.close();
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const selectedDate = getQueryParam('date');
    const events = JSON.parse(localStorage.getItem('events')) || {};

    // 날짜 표시
    document.getElementById('event-date').textContent = selectedDate ? `📅 ${selectedDate}` : '날짜를 선택하세요';

    // 초기 이벤트 렌더링
    renderEvents(selectedDate, events);

    // 추가 버튼 클릭 이벤트
    document.getElementById('add-btn').addEventListener('click', function() {
        const title = document.getElementById('new-title').value.trim();
        const category = document.getElementById('new-category').value;

        if (title && selectedDate) {
            if (!events[selectedDate]) events[selectedDate] = [];
            events[selectedDate].push({ title, category, completed: false });

            localStorage.setItem('events', JSON.stringify(events));

            // 부모 창의 캘린더 업데이트
            // if (window.opener && window.opener.addEventToCalendar) {
            //     window.opener.addEventToCalendar(selectedDate, title, category);
            // }

            // if (window.opener && window.opener.calendar) {
            //   window.opener.calendar.addEvent({
            //     title: `${title} (${category})`,
            //     start: selectedDate,
            //     allDay: true
            //   });
            //   window.opener.location.reload();
            // }

            console.log("Checking window.calendar:", window.calendar);
            console.log("Checking window.calendar.addEvent:", window.calendar?.addEvent);
            console.log('window.calendar:', window.calendar);

            // 수정 1: addEvent로 즉시 반영
            if (window.calendar && typeof window.calendar.addEvent === 'function') {
                window.calendar.addEvent({
                    title: `${title} (${category})`,
                    start: selectedDate,
                    allDay: true
                });
                console.log(`Event added to calendar: ${title} (${category})`);
            } else {
                console.warn('Calendar or addEvent not available');
                if (window.opener) window.opener.location.reload();
            }

            renderEvents(selectedDate, events); // 팝업창에 즉시 반영
            document.getElementById('new-title').value = '';

        }
    });




    // 이벤트 위임으로 체크박스, 수정, 삭제 버튼 처리
    document.querySelector('.event').addEventListener('click', function(e) {
        const target = e.target;
        const index = target.dataset.index;
        if (index === undefined) return;

        if (target.type === 'checkbox') {
            events[selectedDate][index].completed = target.checked;
            localStorage.setItem('events', JSON.stringify(events));
            // renderEvents(selectedDate, events);

            // 부모 캘린더 업데이트
            // if (window.opener && window.opener.calendar) {
            //     window.opener.calendar.refetchEvents();
            // }
            // if (window.opener) {
            //     window.opener.location.reload();
            // }

            // 수정 2: 체크박스 상태 변경 시 메인 캘린더에 반영
            // if (window.calendar && typeof window.calendar.addEvent === 'function') {
            //     const event = events[selectedDate][index];
            //     const eventTitle = `${event.title} (${event.category})`;
            //     const calendarEvents = window.calendar.getEvents();
            //     const matchingEvent = calendarEvents.find(ev =>
            //         ev.title === eventTitle && ev.startStr === selectedDate
            //     );
            //     if (matchingEvent) {
            //         matchingEvent.remove(); // 기존 이벤트 제거
            //     }
            //     window.calendar.addEvent({
            //         title: eventTitle,
            //         start: selectedDate,
            //         allDay: true,
            //         extendedProps: { completed: event.completed } // 수정 2: completed 상태 전달
            //     });
            //     console.log(`Event updated in calendar: ${eventTitle}, completed: ${event.completed}`);
            // } else {
            //     console.warn('Calendar or addEvent not available');
            //     if (window.opener) window.opener.location.reload();
            // }

            if (window.calendar) {
                const event = events[selectedDate][index];
                const eventTitle = `${event.title} (${event.category})`;

                const calendarEvents = window.calendar.getEvents();
                const matchingEvent = calendarEvents.find(ev =>
                    ev.title === eventTitle && ev.startStr === selectedDate
                );

                if (matchingEvent) {
                    matchingEvent.setProp('display', event.completed ? 'list-item' : 'block'); // 취소선 반영
                    matchingEvent.setExtendedProp('completed', event.completed);
                    
                    // 완료된 이벤트에 취소선 적용
                    if (event.completed) {
                        matchingEvent.el.style.textDecoration = 'line-through';
                    } else {
                        matchingEvent.el.style.textDecoration = 'none';
                    }
                } else {
                    // 새로운 이벤트 추가될 떄
                    window.calendar.addEvent({
                        title: eventTitle,
                        start: selectedDate,
                        allDay: true,
                        extendedProps: { completed: event.completed },
                        display: event.completed ? 'list-item' : 'block' // 취소선 반영
                    });
                }
            }

            renderEvents(selectedDate, events);

        } else if (target.classList.contains('edit-btn')) {
            const newTitle = prompt('새 제목을 입력하세요:', events[selectedDate][index].title);
            const newCategory = prompt('새 카테고리를 입력하세요:', events[selectedDate][index].category);
            if (newTitle && newCategory) {
                events[selectedDate][index].title = newTitle;
                events[selectedDate][index].category = newCategory;
                localStorage.setItem('events', JSON.stringify(events));
                renderEvents(selectedDate, events);

                // 부모 캘린더 업데이트
                // if (window.opener && window.opener.calendar) {
                //     window.opener.calendar.refetchEvents();
                // }

                if (window.opener) {
                    window.opener.location.reload();
                }
            }
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('정말 삭제하시겠습니까?')) {
                events[selectedDate].splice(index, 1);
                if (events[selectedDate].length === 0) delete events[selectedDate];
                localStorage.setItem('events', JSON.stringify(events));
                renderEvents(selectedDate, events);

                // 부모 캘린더 업데이트
                // if (window.opener && window.opener.calendar) {
                //     window.opener.calendar.refetchEvents();
                // }

                if (window.opener) {
                    window.opener.location.reload();
                }
            }
        }
    });
});