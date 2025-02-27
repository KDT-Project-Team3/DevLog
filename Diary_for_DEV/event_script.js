function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

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
                    <input type="checkbox" data-index="${index}" ${event.completed ? 'checked' : ''}>
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

function saveAndClose() {
    window.close();
}

document.addEventListener('DOMContentLoaded', function() {
    const selectedDate = getQueryParam('date');
    let events = JSON.parse(localStorage.getItem('events') || '{}');

    document.getElementById('event-date').textContent = selectedDate ? `📅 ${selectedDate}` : '날짜를 선택하세요';
    renderEvents(selectedDate, events);

    const addBtn = document.getElementById('add-btn');

    function addEventHandler() {
        const title = document.getElementById('new-title').value.trim();
        const category = document.getElementById('new-category').value;

        if (!title || !selectedDate) {
            console.warn('제목 또는 날짜가 누락되었습니다.');
            return;
        }

        try {
            if (window.opener && window.opener.addEventToCalendar) {
                window.opener.addEventToCalendar(selectedDate, title, category);
                events = JSON.parse(localStorage.getItem('events') || '{}');
                renderEvents(selectedDate, events);
                document.getElementById('new-title').value = '';
                console.log(`✅ 팝업에서 일정 추가 완료: ${title}`);
            }
        } catch (error) {
            console.error('일정 추가 실패:', error);
            events = JSON.parse(localStorage.getItem('events') || '{}');
            renderEvents(selectedDate, events);
            document.getElementById('new-title').value = '';
            if (window.opener && window.opener.calendar) {
                window.opener.calendar.refetchEvents();
            }
        }
    }

    addBtn.addEventListener('click', addEventHandler);

    // 이벤트 리스트 컨테이너에 이벤트 위임
    const eventContainer = document.getElementById('event-list');
    const doneContainer = document.getElementById('done-list');

    [eventContainer, doneContainer].forEach(container => {
        container.addEventListener('click', function(e) {
            const target = e.target;
            const index = target.dataset.index;
            if (index === undefined) return;

            if (target.type === 'checkbox') {
                const wasCompleted = events[selectedDate][index].completed;
                events[selectedDate][index].completed = target.checked;
                localStorage.setItem('events', JSON.stringify(events));
                renderEvents(selectedDate, events);
                if (!wasCompleted && target.checked && window.opener && window.opener.completeEvent) {
                    try {
                        window.opener.completeEvent(selectedDate, index);
                        console.log(`✅ 팝업에서 일정 완료: ${events[selectedDate][index].title}`);
                    } catch (error) {
                        console.error('완료 처리 실패:', error);
                    }
                }
            } else if (target.classList.contains('edit-btn')) {
                const event = events[selectedDate][index];
                const titleInput = document.getElementById('new-title');
                const categorySelect = document.getElementById('new-category');

                titleInput.value = event.title;
                categorySelect.value = event.category;
                addBtn.textContent = '수정 저장';
                addBtn.dataset.editIndex = index;

                const editHandler = function() {
                    const newTitle = titleInput.value.trim();
                    const newCategory = categorySelect.value;

                    if (newTitle) {
                        events[selectedDate][index].title = newTitle;
                        events[selectedDate][index].category = newCategory;
                        localStorage.setItem('events', JSON.stringify(events));
                        if (window.opener && window.opener.calendar) {
                            window.opener.calendar.refetchEvents();
                        }
                        renderEvents(selectedDate, events);
                        titleInput.value = '';
                        addBtn.textContent = '+';
                        delete addBtn.dataset.editIndex;
                        addBtn.removeEventListener('click', editHandler);
                        addBtn.addEventListener('click', addEventHandler);
                    }
                };

                addBtn.removeEventListener('click', addEventHandler);
                addBtn.addEventListener('click', editHandler, { once: true });
            } else if (target.classList.contains('delete-btn')) {
                if (confirm('정말 삭제하시겠습니까?')) {
                    events[selectedDate].splice(index, 1);
                    if (events[selectedDate].length === 0) delete events[selectedDate];
                    localStorage.setItem('events', JSON.stringify(events));
                    renderEvents(selectedDate, events);
                    if (window.opener && window.opener.calendar) {
                        window.opener.calendar.refetchEvents();
                    }
                }
            }
        });
    });
});