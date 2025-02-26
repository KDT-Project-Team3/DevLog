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

// x 버튼 클릭 시 저장 및 닫기
function saveAndClose() {
    const selectedDate = getQueryParam('date');
    const events = JSON.parse(localStorage.getItem('events') || '{}');
    const updatedEvents = events[selectedDate] || [];

    if (window.opener) {
        window.opener.location.reload();
    } else {
        console.warn('Failed to save events');
    }
    window.close();
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const selectedDate = getQueryParam('date');
    const events = JSON.parse(localStorage.getItem('events') || '{}');

    document.getElementById('event-date').textContent = selectedDate ? `📅 ${selectedDate}` : '날짜를 선택하세요';
    renderEvents(selectedDate, events);

    const addBtn = document.getElementById('add-btn');
    function addEventHandler() {
        const title = document.getElementById('new-title').value.trim();
        const category = document.getElementById('new-category').value;

        if (title && selectedDate) {
            if (!events[selectedDate]) events[selectedDate] = [];
            events[selectedDate].push({ title, category, completed: false });
            localStorage.setItem('events', JSON.stringify(events));

            if (window.opener && window.opener.addEventToCalendar) {
                window.opener.addEventToCalendar(selectedDate, title, category);
            }

            renderEvents(selectedDate, events);
            document.getElementById('new-title').value = '';
        }
    }
    addBtn.addEventListener('click', addEventHandler);

    document.querySelector('.event').addEventListener('click', function(e) {
        const target = e.target;
        const index = target.dataset.index;
        if (index === undefined) return;

        if (target.type === 'checkbox') {
            events[selectedDate][index].completed = target.checked;
            localStorage.setItem('events', JSON.stringify(events));
            renderEvents(selectedDate, events);
            if (window.opener) {
                window.opener.location.reload();
            }
        } else if (target.classList.contains('edit-btn')) {
            const event = events[selectedDate][index];
            const titleInput = document.getElementById('new-title');
            const categorySelect = document.getElementById('new-category');
            const addBtn = document.getElementById('add-btn');

            titleInput.value = event.title;
            categorySelect.value = event.category;
            addBtn.textContent = '수정 저장';
            addBtn.dataset.editIndex = index;

            addBtn.removeEventListener('click', addEventHandler);
            addBtn.addEventListener('click', function editHandler() {
                const newTitle = titleInput.value.trim();
                const newCategory = categorySelect.value;

                if (newTitle) {
                    events[selectedDate][index].title = newTitle;
                    events[selectedDate][index].category = newCategory;
                    localStorage.setItem('events', JSON.stringify(events));

                    if (window.opener) {
                        window.opener.location.reload();
                    }

                    renderEvents(selectedDate, events);
                    titleInput.value = '';
                    addBtn.textContent = '+';
                    delete addBtn.dataset.editIndex;

                    addBtn.removeEventListener('click', editHandler);
                    addBtn.addEventListener('click', addEventHandler);
                }
            }, { once: true });
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('정말 삭제하시겠습니까?')) {
                events[selectedDate].splice(index, 1);
                if (events[selectedDate].length === 0) delete events[selectedDate];
                localStorage.setItem('events', JSON.stringify(events));
                renderEvents(selectedDate, events);

                if (window.opener) {
                    window.opener.location.reload();
                }
            }
        }
    });
});