const achievementCategoryMap = {
    "Java 첫걸음": { category: "Java", requiredCount: 1, title: "", condition: "Java 일정 1개 완료" },
    "Java 고수": { category: "Java", requiredCount: 2, title: "", condition: "Java 일정 2개 완료" },
    "Java의 신": { category: "Java", requiredCount: 3, title: "☕ Java의 신", condition: "Java 일정 3개 완료" },

    // Python (기존)
    "Python 첫걸음": { category: "Python", requiredCount: 1, title: "", condition: "Python 일정 1개 완료" },
    "Python 마스터": { category: "Python", requiredCount: 2, title: "", condition: "Python 일정 2개 완료" },
    "Python의 신": { category: "Python", requiredCount: 3, title: "🐍 Python의 신", condition: "Python 일정 3개 완료" },

    // JavaScript (기존)
    "JS 첫걸음": { category: "JavaScript", requiredCount: 1, title: "", condition: "JavaScript 일정 1개 완료" },
    "JS DOM의 달인": { category: "JavaScript", requiredCount: 2, title: "", condition: "JavaScript 일정 2개 완료" },
    "JS 마스터": { category: "JavaScript", requiredCount: 3, title: "🧩 JS 코드 마스터", condition: "JavaScript 일정 3개 완료" },

    // HTML (기존)
    "초보 프론트엔드": { category: "HTML", requiredCount: 1, title: "", condition: "HTML 일정 1개 완료" },
    "HTML 고수": { category: "HTML", requiredCount: 2, title: "", condition: "HTML 일정 2개 완료" },
    "HTML의 신": { category: "HTML", requiredCount: 3, title: "📜 HTML의 신, 🎨 CSS의 신", condition: "HTML 일정 3개 완료" },

    // SQL (기존)
    "SQL 첫걸음": { category: "SQL", requiredCount: 1, title: "", condition: "SQL 일정 1개 완료" },
    "SQL 고수": { category: "SQL", requiredCount: 2, title: "", condition: "SQL 일정 2개 완료" },
    "SQL의 신": { category: "SQL", requiredCount: 3, title: "🗄️ SQL의 신", condition: "SQL 일정 3개 완료" },

    // C (추가)
    "C 첫걸음": { category: "C", requiredCount: 1, title: "", condition: "C 일정 1개 완료" },
    "C 고수": { category: "C", requiredCount: 2, title: "", condition: "C 일정 2개 완료" },
    "C의 신": { category: "C", requiredCount: 3, title: "🔧 C의 신", condition: "C 일정 3개 완료" },

    // Cpp (C++) (추가)
    "C++ 첫걸음": { category: "Cpp", requiredCount: 1, title: "", condition: "C++ 일정 1개 완료" },
    "C++ 고수": { category: "Cpp", requiredCount: 2, title: "", condition: "C++ 일정 2개 완료" },
    "C++의 신": { category: "Cpp", requiredCount: 3, title: "⚙️ C++의 신", condition: "C++ 일정 3개 완료" },

    // Csharp (C#) (추가)
    "C# 첫걸음": { category: "Csharp", requiredCount: 1, title: "", condition: "C# 일정 1개 완료" },
    "C# 고수": { category: "Csharp", requiredCount: 2, title: "", condition: "C# 일정 2개 완료" },
    "C#의 신": { category: "Csharp", requiredCount: 3, title: "🎹 C#의 신", condition: "C# 일정 3개 완료" },

    // R (추가)
    "R 첫걸음": { category: "R", requiredCount: 1, title: "", condition: "R 일정 1개 완료" },
    "R 고수": { category: "R", requiredCount: 2, title: "", condition: "R 일정 2개 완료" },
    "R의 신": { category: "R", requiredCount: 3, title: "📊 R의 신", condition: "R 일정 3개 완료" },

    // Kotlin (추가)
    "Kotlin 첫걸음": { category: "Kotlin", requiredCount: 1, title: "", condition: "Kotlin 일정 1개 완료" },
    "Kotlin 고수": { category: "Kotlin", requiredCount: 2, title: "", condition: "Kotlin 일정 2개 완료" },
    "Kotlin의 신": { category: "Kotlin", requiredCount: 3, title: "🤖 Kotlin의 신", condition: "Kotlin 일정 3개 완료" },

    // Commit
    "정원 관리사": { category: "Commit", requiredCount: 3, title: "🏡 정원 관리사", condition: "커밋 3개 완료" },
    "지옥에서 온": { category: "Commit", requiredCount: 5, title: "🔥 지옥에서 온", condition: "커밋 5개 완료" },

    // General
    "코린이": { category: "General", requiredCount: 1, title: "🐣 코린이", condition: "일정 1개 완료" },
    "프로갓생러": { category: "General", requiredCount: 3, title: "🚀 프로 갓생러", condition: "일정 3개 완료" },
    "파워J": { category: "General", requiredCount: 4, title: "⚡ 파워 J", condition: "일정 4개 완료" },
    "자기계발왕": { category: "General", requiredCount: 5, title: "📚 자기계발 끝판왕", condition: "일정 5개 완료" },

    "닥터 스트레인지": { category: "General", requiredCount: 6, title: "⏳ 닥터 스트레인지", condition: "일정 6개 완료" },

    // 버그 헌터 관련 업적
    // "새싹 디버거": { category: "Debug", requiredCount: 1, title: "🌱 새싹 디버거" },
    // "버그 헌터": { category: "Debug", requiredCount: 2, title: "🔍 버그 헌터" },
    // "디버깅 마스터": { category: "Debug", requiredCount: 3, title: "🛠️ 디버깅 마스터" },
    // "버그 엑소시스트": { category: "Debug", requiredCount: 4, title: "👻 버그 엑소시스트" },
    // "와일드 멘탈": { category: "Debug", requiredCount: 1, title: "🐆 wild-mental" }

};

// 수정: currentUser 객체를 전역적으로 정의 (메인 코드와 동일)
const currentUser = {
    user_id: null
};

// currentUser.user_id를 부모 창에서 가져오기 위한 함수
function initCurrentUser() {
    const currentUserData = JSON.parse(localStorage.getItem('current_user') || '[]');
    if (currentUserData.length > 0 && currentUserData[0].values.length > 0) {
        currentUser.user_id = currentUserData[0].values[0][0]; // user_id는 첫 번째 열
    } else {
        console.warn("⚠️ 사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.");
    }
}

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
    // 부모 창의 캘린더를 새로고침
    if (window.opener && window.opener.calendar) {
        window.opener.calendar.refetchEvents();
    }
    window.close();
}

document.addEventListener('DOMContentLoaded', function() {
    // currentUser.user_id 초기화
    initCurrentUser();
    if (!currentUser.user_id) {
        console.warn("⚠️ 사용자 ID가 없습니다. 로그인이 필요합니다.");
        return;
    }

    const selectedDate = getQueryParam('date');
    let events = JSON.parse(localStorage.getItem(`events_${currentUser.user_id}`) || '{}');

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
                events = JSON.parse(localStorage.getItem(`events_${currentUser.user_id}`) || '{}');
                renderEvents(selectedDate, events);
                document.getElementById('new-title').value = '';
                console.log(`✅ 팝업에서 일정 추가 완료: ${title}`);
            }
        } catch (error) {
            console.error('일정 추가 실패:', error);
            events = JSON.parse(localStorage.getItem(`events_${currentUser.user_id}`) || '{}');
            renderEvents(selectedDate, events);
            document.getElementById('new-title').value = '';
            if (window.opener && window.opener.calendar) {
                window.opener.calendar.refetchEvents();
            }
        }
    }

    addBtn.addEventListener('click', addEventHandler);

    // // 이벤트 리스트 컨테이너에 이벤트 위임
    const eventContainer = document.getElementById('event-list');
    const doneContainer = document.getElementById('done-list');

    [eventContainer, doneContainer].forEach(container => {
        container.addEventListener('click', function(e) {
            const target = e.target;
            const index = target.dataset.index;
            if (index === undefined) return;

            if (target.type === 'checkbox') {
                const wasCompleted = events[selectedDate][index].completed;
                if (!wasCompleted && target.checked) {
                    if (window.confirm("일정을 완료하시겠습니까?")) {
                        events[selectedDate][index].completed = true;
                        localStorage.setItem(`events_${currentUser.user_id}`, JSON.stringify(events));
                        renderEvents(selectedDate, events);

                        if (window.opener && window.opener.completeEvent) {
                            window.opener.completeEvent(selectedDate, index);
                        }

                        console.log("✅ 일정 완료:", events[selectedDate][index].title, "카테고리:", events[selectedDate][index].category);
                        const totalCompleted = Object.values(events).flat().filter(event => event.completed).length;
                        const selectedDateEvents = Array.isArray(events[selectedDate]) ? events[selectedDate] : [];
                        const completedCount = selectedDateEvents.filter(event => event.completed && event.category === events[selectedDate][index].category).length;
                        const category = events[selectedDate][index].category;

                        console.log("🔍 업적 확인 - 전체 완료 수:", totalCompleted, "현재 날짜 카테고리 완료 수:", completedCount, "카테고리:", category);

                        // 카테고리 업적과 General 업적을 별도로 필터링
                        let categoryAchievement = null;
                        let generalAchievement = null;

                        // 카테고리 업적 찾기
                        const categoryAchievements = Object.entries(achievementCategoryMap)
                            .filter(([_, { category: achCategory }]) => achCategory === category)
                            .map(([title, details]) => ({ title, ...details }))
                            .filter(ach => completedCount >= ach.requiredCount)
                            .sort((a, b) => b.requiredCount - a.requiredCount); // 높은 requiredCount 우선
                        if (categoryAchievements.length > 0) {
                            categoryAchievement = categoryAchievements[0];
                            console.log(`✅ 카테고리 업적 선택: ${categoryAchievement.title} (필요 수: ${categoryAchievement.requiredCount})`);
                        }

                        // General 업적 찾기
                        const generalAchievements = Object.entries(achievementCategoryMap)
                            .filter(([_, { category: achCategory }]) => achCategory === "General")
                            .map(([title, details]) => ({ title, ...details }))
                            .filter(ach => totalCompleted >= ach.requiredCount)
                            .sort((a, b) => b.requiredCount - a.requiredCount); // 높은 requiredCount 우선
                        if (generalAchievements.length > 0) {
                            generalAchievement = generalAchievements[0];
                            console.log(`✅ General 업적 선택: ${generalAchievement.title} (필요 수: ${generalAchievement.requiredCount})`);
                        }

                        // 수정: 단일 메시지로 통합, 업적 이름 및 칭호 이름 제거
                        if (categoryAchievement || generalAchievement) {
                            window.alert("업적이 해금되었습니다!\n칭호를 획득합니다!");
                        } else {
                            console.log("⚠️ 해금된 업적 없음");
                        }

                        window.close(); // 팝업 창 닫기
                    } else {
                        target.checked = false; // 취소 시 체크 해제
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
                        localStorage.setItem(`events_${currentUser.user_id}`, JSON.stringify(events));
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
                    localStorage.setItem(`events_${currentUser.user_id}`, JSON.stringify(events));
                    renderEvents(selectedDate, events);
                    if (window.opener && window.opener.calendar) {
                        window.opener.calendar.refetchEvents();
                    }
                }
            }
        });
    });
});