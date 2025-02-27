let db; // 데이터베이스 객체 (auth.js에서 정의됨)
let unlockedTitles = JSON.parse(localStorage.getItem('unlockedTitles')) || [];

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

async function initDatabase() {
    if (!db) {
        console.error("Database not initialized. Ensure auth.js is loaded first.");
        return;
    }
    console.log("✅ script.js에서 데이터베이스 사용 준비 완료!");
}

document.addEventListener("DOMContentLoaded", async function () {
    await initDatabase();

    const banner = document.querySelector(".banner");
    const sidebar = document.querySelector(".sidebar");
    const profileLayout = document.querySelector(".profileLayout");
    const profileInner = document.querySelector(".profileInner");
    const profileImg = document.querySelector(".profileImg");
    const expBarContainer = document.querySelector(".exp-bar-container");
    const expBar = document.querySelector(".exp-bar");
    const medalBox = document.querySelector(".medalBox");
    const userInfoLayout = document.querySelector(".userInfoLayout");
    const profile = document.querySelector(".profile");
    const achievement_p = document.querySelectorAll(".achievement .content p");
    const content_title = document.querySelectorAll(".achievement .content h2");
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const selectedTitle = document.getElementById("selectedTitle");
    const levelDisplay = document.querySelector(".LV h1");
    const calendarEl = document.getElementById('calendar');

    if (!calendarEl) console.error("Calendar element not found!");
    if (!sidebar) console.error("Sidebar element not found!");

    if (profileInner) profileInner.classList.add("profileInvisible");
    if (expBarContainer) expBarContainer.classList.add("profileInvisible");
    if (medalBox) medalBox.classList.add("profileInvisible");
    if (userInfoLayout) userInfoLayout.classList.remove("profileInvisible");

    const messages = [
        "🚀 코드 한 줄이 세상을 바꾼다!",
        "🐞 버그 없는 코드? 신화일 뿐!",
        // ... (기존 메시지 유지)
    ];

    function changeBannerText() {
        if (banner) {
            const randomIndex = Math.floor(Math.random() * messages.length);
            banner.textContent = messages[randomIndex];
        }
    }
    changeBannerText();
    setInterval(changeBannerText, 3000);

    if (sidebar) {
        sidebar.addEventListener("mouseenter", function () {
            if (profileInner) profileInner.classList.remove("profileInvisible");
            if (expBarContainer) expBarContainer.classList.remove("profileInvisible");
            if (medalBox) {
                medalBox.classList.remove("profileInvisible");
                medalBox.style.height = "30%";
            }
            if (userInfoLayout) userInfoLayout.classList.add("profileInvisible");
            if (profileLayout) {
                profileLayout.style.marginTop = "0";
                profileLayout.style.marginBottom = "0";
            }
            if (profileImg) {
                profileImg.style.width = "140px";
                profileImg.style.height = "140px";
            }
            if (profile) profile.style.left = "70%";
            if (userInfoLayout) userInfoLayout.style.marginTop = "0";
            achievement_p.forEach(p => p.style.opacity = "1");
        });

        sidebar.addEventListener("mouseleave", function () {
            if (profileInner) profileInner.classList.add("profileInvisible");
            if (expBarContainer) expBarContainer.classList.add("profileInvisible");
            if (medalBox) {
                medalBox.classList.add("profileInvisible");
                medalBox.style.height = "0";
            }
            if (userInfoLayout) userInfoLayout.classList.remove("profileInvisible");
            if (profileImg) {
                profileImg.style.width = "170px";
                profileImg.style.height = "170px";
            }
            if (userInfoLayout) userInfoLayout.style.marginTop = "20%";
            achievement_p.forEach(p => p.style.opacity = "0");
        });
    }

    const categoryColors = {
        Python: '#3776AB',
        Java: '#007396',
        C: '#A8B9CC',
        Cpp: '#00599C',
        Csharp: '#68217A',
        JavaScript: '#F7DF1E',
        HTML: '#E34F26',
        R: '#276DC3',
        Kotlin: '#F18E33',
        SQL: '#4479A1',
        Holiday: '#FF0000'
    };

    const categorySelect = document.getElementById("eventCategory");
    if (categorySelect) {
        const categories = Object.keys(categoryColors);
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // 업적 - 카테고리 매핑 객체 정의 { 카테고리, 완료 수, 칭호, 이미지 } // 테스트를 위해 조건을 낮게 수정!!
    const achievementCategoryMap = {
        // Java
        "Java 첫걸음": { category: "Java", requiredCount: 1, title: "", condition: "Java 일정 1개 완료" },
        "Java 고수": { category: "Java", requiredCount: 2, title: "", condition: "Java 일정 2개 완료" },
        "Java의 신": { category: "Java", requiredCount: 3, title: "☕ Java의 신", condition: "Java 일정 3개 완료" },

        // Python
        "Python 첫걸음": { category: "Python", requiredCount: 1, title: "", condition: "Python 일정 1개 완료" },
        "Python 마스터": { category: "Python", requiredCount: 2, title: "", condition: "Python 일정 2개 완료" },
        "Python의 신": { category: "Python", requiredCount: 3, title: "🐍 Python의 신", condition: "Python 일정 3개 완료" },

        // JavaScript
        "JS 첫걸음": { category: "JavaScript", requiredCount: 1, title: "", condition: "JavaScript 일정 1개 완료" },
        "JS DOM의 달인": { category: "JavaScript", requiredCount: 2, title: "", condition: "JavaScript 일정 2개 완료" },
        "JS 마스터": { category: "JavaScript", requiredCount: 3, title: "🧩 JS 코드 마스터", condition: "JavaScript 일정 3개 완료" },

        // HTML
        "초보 프론트엔드": { category: "HTML", requiredCount: 1, title: "", condition: "HTML 일정 1개 완료" },
        "HTML 고수": { category: "HTML", requiredCount: 2, title: "", condition: "HTML 일정 2개 완료" },
        "HTML의 신": { category: "HTML", requiredCount: 3, title: "📜 HTML의 신, 🎨 CSS의 신", condition: "HTML 일정 3개 완료" },

        // SQL
        "SQL 첫걸음": { category: "SQL", requiredCount: 1, title: "", condition: "SQL 일정 1개 완료" },
        "SQL 고수": { category: "SQL", requiredCount: 2, title: "", condition: "SQL 일정 2개 완료" },
        "SQL의 신": { category: "SQL", requiredCount: 3, title: "🗄️ SQL의 신", condition: "SQL 일정 3개 완료" },

        // C
        "C 첫걸음": { category: "C", requiredCount: 1, title: "", condition: "C 일정 1개 완료" },
        "C 고수": { category: "C", requiredCount: 2, title: "", condition: "C 일정 2개 완료" },
        "C의 신": { category: "C", requiredCount: 3, title: "🔧 C의 신", condition: "C 일정 3개 완료" },

        // Cpp (C++)
        "C++ 첫걸음": { category: "Cpp", requiredCount: 1, title: "", condition: "C++ 일정 1개 완료" },
        "C++ 고수": { category: "Cpp", requiredCount: 2, title: "", condition: "C++ 일정 2개 완료" },
        "C++의 신": { category: "Cpp", requiredCount: 3, title: "⚙️ C++의 신", condition: "C++ 일정 3개 완료" },

        // Csharp (C#)
        "C# 첫걸음": { category: "Csharp", requiredCount: 1, title: "", condition: "C# 일정 1개 완료" },
        "C# 고수": { category: "Csharp", requiredCount: 2, title: "", condition: "C# 일정 2개 완료" },
        "C#의 신": { category: "Csharp", requiredCount: 3, title: "🎹 C#의 신", condition: "C# 일정 3개 완료" },

        // R
        "R 첫걸음": { category: "R", requiredCount: 1, title: "", condition: "R 일정 1개 완료" },
        "R 고수": { category: "R", requiredCount: 2, title: "", condition: "R 일정 2개 완료" },
        "R의 신": { category: "R", requiredCount: 3, title: "📊 R의 신", condition: "R 일정 3개 완료" },

        // Kotlin
        "Kotlin 첫걸음": { category: "Kotlin", requiredCount: 1, title: "", condition: "Kotlin 일정 1개 완료" },
        "Kotlin 고수": { category: "Kotlin", requiredCount: 2, title: "", condition: "Kotlin 일정 2개 완료" },
        "Kotlin의 신": { category: "Kotlin", requiredCount: 3, title: "🤖 Kotlin의 신", condition: "Kotlin 일정 3개 완료" },

        // General
        "정원 관리사": { category: "General", requiredCount: 1, title: "🏡 정원 관리사", condition: "어떤 일정 1개 완료" },
        "지옥에서 온": { category: "General", requiredCount: 2, title: "🔥 지옥에서 온", condition: "어떤 일정 2개 완료" },
        "코린이": { category: "General", requiredCount: 1, title: "🐣 코린이", condition: "어떤 일정 1개 완료" },
        "프로갓생러": { category: "General", requiredCount: 2, title: "🚀 프로 갓생러", condition: "어떤 일정 2개 완료" },
        "파워J": { category: "General", requiredCount: 3, title: "⚡ 파워 J", condition: "어떤 일정 3개 완료" },
        "자기계발왕": { category: "General", requiredCount: 4, title: "📚 자기계발 끝판왕", condition: "어떤 일정 4개 완료" },
        "닥터 스트레인지": { category: "General", requiredCount: 5, title: "⏳ 닥터 스트레인지", condition: "어떤 일정 5개 완료" },

        // 버그 헌터 관련 업적
        // "새싹 디버거": { category: "Debug", requiredCount: 1, title: "🌱 새싹 디버거" },
        // "버그 헌터": { category: "Debug", requiredCount: 3, title: "🔍 버그 헌터" },
        // "디버깅 마스터": { category: "Debug", requiredCount: 5, title: "🛠️ 디버깅 마스터" },
        // "버그 엑소시스트": { category: "Debug", requiredCount: 10, title: "👻 버그 엑소시스트" },
        // "와일드 멘탈": { category: "Debug", requiredCount: 15, title: "" }
    };


    // 업적 제목 스타일 설정
    content_title.forEach(title => {
        title.style.fontSize = "1.3em"; // 글꼴 크기
        title.style.marginLeft = "0.2em"; // 왼쪽 여백
        title.style.width = "300px"; // 너비 설정
    });

    let tmp = JSON.parse(localStorage.getItem('current_user'));
    if (tmp && tmp.length > 0) {
        const user = tmp[0].values[0];
        currentUser.user_id = user[0];
        currentUser.username = user[1];
        currentUser.email = user[2];
        currentUser.password = user[3];
        currentUser.lv = user[4];
        currentUser.xp = user[5];
        currentUser.img = user[6];
    }

    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
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
            events: async function(fetchInfo, successCallback, failureCallback) {
                const localEvents = loadEventsFromLocalStorage();
                const holidayEvents = await fetchHolidays();
                successCallback([...localEvents, ...holidayEvents]);
            },
            eventDidMount: function(info) {
                if (info.event.extendedProps.completed) {
                    info.el.querySelector('.fc-event-title').style.textDecoration = 'line-through';
                }
            }
        });
        calendar.render();
        window.calendar = calendar;
    }

    async function fetchHolidays() {
        const url = 'https://date.nager.at/api/v3/publicholidays/2025/KR';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
            const holidays = await response.json();
            return holidays.map(holiday => ({
                title: holiday.localName,
                start: holiday.date,
                allDay: true,
                backgroundColor: categoryColors['Holiday'],
                borderColor: categoryColors['Holiday'],
                extendedProps: {
                    memo: holiday.name || '',
                    category: 'Holiday',
                    isHoliday: true,
                    completed: false
                }
            }));
        } catch (error) {
            console.error('공휴일 가져오기 오류:', error);
            return [];
        }
    }

    window.addEventToCalendar = function(date, title, category) {
        const existingEvents = db.exec("SELECT * FROM diary_event WHERE date = ? AND title = ? AND category = ?", [date, title, category]);
        if (existingEvents.length === 0) {
            db.run("INSERT INTO diary_event (user_id, title, category, date, completed) VALUES (?, ?, ?, ?, ?)",
                [currentUser.user_id, title, category, date, false]);
            console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
            saveDiaryEventToLocalStorage();

            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (!events[date]) events[date] = [];
            events[date].push({ title, category, memo: '', completed: false });
            localStorage.setItem('events', JSON.stringify(events));

            if (window.calendar) {
                window.calendar.addEvent({
                    title: `${title} (${category})`,
                    start: date,
                    allDay: true,
                    backgroundColor: categoryColors[category],
                    borderColor: categoryColors[category],
                    extendedProps: { memo: '', completed: false }
                });
                window.calendar.refetchEvents();
            }
        } else {
            console.log(`이미 존재하는 일정: ${title} (${category})`);
        }
    };

    window.completeEvent = function(date, index) {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (events[date] && events[date][index]) {
            const wasCompleted = events[date][index].completed;
            if (!wasCompleted) {
                events[date][index].completed = true;
                localStorage.setItem('events', JSON.stringify(events));
                currentUser.xpUp(1);
                saveUserToLocalStorage();
                updateLevelAndExp();
                updateMedals();
                if (window.calendar) window.calendar.refetchEvents();
            }
        }
    };

    function checkLevelUp() {
        const requiredXp = currentUser.lv + 1;
        if (currentUser.xp >= requiredXp) {
            currentUser.xp -= requiredXp;
            currentUser.lv += 1;
            saveUserToLocalStorage();
            console.log(`🎉 레벨업! 현재 레벨: ${currentUser.lv}`);
        }
    }

    function updateLevelAndExp() {
        if (levelDisplay && expBar) {
            const requiredXp = currentUser.lv + 1;
            levelDisplay.textContent = `LV: ${currentUser.lv}`;
            const expPercentage = (currentUser.xp / requiredXp) * 100;
            expBar.style.width = `${expPercentage}%`;
            expBar.textContent = `${currentUser.xp}/${requiredXp}`;
        }
    }

    function initializeTitles() {
        if (dropdownMenu) {
            dropdownMenu.innerHTML = '';
            const defaultItem = document.createElement('div');
            defaultItem.className = 'dropdown-item';
            defaultItem.textContent = ' ';
            defaultItem.addEventListener('click', () => {
                if (selectedTitle) {
                    selectedTitle.textContent = '  ';
                    selectedTitle.className = 'userTitle text-white fw-bold';
                }
            });
            dropdownMenu.appendChild(defaultItem);

            unlockedTitles.forEach(title => addTitleToDropdown(title));
        }
    }

    function addTitleToDropdown(title) {
        if (dropdownMenu && selectedTitle) {
            if (!unlockedTitles.includes(title)) {
                unlockedTitles.push(title);
                localStorage.setItem('unlockedTitles', JSON.stringify(unlockedTitles));
            }
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = title;
            item.addEventListener('click', () => {
                selectedTitle.textContent = title;
                selectedTitle.className = 'userTitle text-white fw-bold';
                if (title === "🔥 지옥에서 온") {
                    selectedTitle.classList.add('title-hell');
                    selectedTitle.style.fontSize = '0.8em';
                }
            });
            dropdownMenu.appendChild(item);
            console.log(`칭호 추가됨: ${title}`);
        }
    }

    // 카테고리별 완료된 일정 집계 및 메달 업데이트
    function updateMedals() {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const completedCounts = {};
        let totalCompleted = 0;

        // 완료된 일정 수 계산
        for (const date in events) {
            events[date].forEach(event => {
                if (event.completed) {
                    completedCounts[event.category] = (completedCounts[event.category] || 0) + 1;
                    totalCompleted++;
                }
            });
        }

        // 디버깅 로그
        console.log("Completed Counts:", completedCounts);
        console.log("Total Completed:", totalCompleted);

        Object.keys(categoryColors).forEach(category => {
            const medal = document.getElementById(category.toLowerCase());
            if (medal) {
                const count = completedCounts[category] || 0;
                if (count >= 1) {
                    medal.classList.add('unlocked');
                } else {
                    medal.classList.remove('unlocked');
                }
            }
        });

        const achievementItems = document.querySelectorAll('.achievementInner');
        const achievementContainer = document.querySelector('.achievement');
        const achievementStatus = {};

        achievementItems.forEach(item => {
            const title = item.querySelector('h2').textContent.trim();
            const mapping = achievementCategoryMap[title] || { category: "General", requiredCount: 1 };
            const category = mapping.category;
            const requiredCount = mapping.requiredCount;
            const completedCount = completedCounts[category] || 0;
            // const isUnlocked = completedCount >= requiredCount;
            const isUnlocked = category === "General" ? totalCompleted >= requiredCount : completedCount >= requiredCount;

            achievementStatus[title] = { item, isUnlocked, mapping };

            const descriptionP = item.querySelector('.content p');

            if (isUnlocked) {
                item.classList.add('unlocked');
                item.style.opacity = '1';
                descriptionP.textContent = descriptionP.dataset.originalText || descriptionP.textContent;

                // 업적 해금되었고, 아직 맨 위로 이동하지 않았다면 이동!
                // if (!item.dataset.movedToBottom) {
                //     achievementContainer.prepend(item); // 맨 아래로 이동
                //     item.dataset.movedToTop = 'true'; // 이동 완료 표시
                //     console.log(`업적 이동: ${title} -> 맨 위로`);
                // }

                // 업적 해금 시 칭호 추가
                if (mapping.title && !item.dataset.titleAdded) {
                    const titles = mapping.title.split(',').map(t => t.trim());
                    titles.forEach(title => {
                        if (title && !unlockedTitles.includes(title)) {
                            addTitleToDropdown(title);
                        }
                    });
                    item.dataset.titleAdded = 'true'; // 중복 추가 방지
                }
            } else {
                item.classList.remove('unlocked');
                item.style.opacity = '0.7';
                // 원래 설명 저장 후 해금 조건으로 변경
                if (!descriptionP.dataset.originalText) {
                    descriptionP.dataset.originalText = descriptionP.textContent;
                }
                descriptionP.textContent = mapping.condition || "해금 조건 미정";
            }

            achievementStatus[title] = { item, isUnlocked, mapping };

        });
        // achievementCategoryMap의 순서대로 재정렬
        const unlockedItems = [];
        const lockedItems = [];

        Object.keys(achievementCategoryMap).forEach(title => {
            const status = achievementStatus[title];
            if (status) {
                if (status.isUnlocked) {
                    unlockedItems.push(status.item);
                } else {
                    lockedItems.push(status.item);
                }
            }
        });

        // 컨테이너 비우고 순서대로 다시 추가
        achievementContainer.innerHTML = '';
        unlockedItems.forEach(item => achievementContainer.appendChild(item));
        lockedItems.forEach(item => achievementContainer.appendChild(item));
    }


    initializeTitles();
    updateMedals();
    updateLevelAndExp();

    if (dropdownItems) {
        dropdownItems.forEach(item => {
            item.addEventListener("click", function () {
                if (selectedTitle) selectedTitle.textContent = this.textContent;
            });
        });
    }

    let selectedEvent = null;
    function openModal(date, event) {
        const modal = document.getElementById('eventModal');
        const titleInput = document.getElementById('eventTitle');
        const categorySelect = document.getElementById('eventCategory');
        const memoInput = document.getElementById('eventMemo');
        const deleteBtn = document.getElementById('deleteEvent');
        window.selectedDate = date;

        if (modal && titleInput && categorySelect && memoInput && deleteBtn) {
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
    }

    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            const modal = document.getElementById('eventModal');
            if (modal) modal.style.display = 'none';
        };
    }

    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.onsubmit = function(e) {
            e.preventDefault();
            const title = document.getElementById('eventTitle').value.trim();
            const category = document.getElementById('eventCategory').value;
            const memo = document.getElementById('eventMemo').value.trim();
            const date = window.selectedDate;

            if (!title) {
                alert('일정을 입력하시오');
                return;
            }

            const events = JSON.parse(localStorage.getItem('events') || '{}');
            if (selectedEvent) {
                selectedEvent.remove();
                if (!events[date]) events[date] = [];
                events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
                alert('일정이 수정되었습니다!');
            } else {
                alert('일정이 등록되었습니다!');
            }

            if (!events[date]) events[date] = [];
            events[date].push({ title, category, memo, completed: false });
            localStorage.setItem('events', JSON.stringify(events));
            if (window.calendar) {
                window.calendar.addEvent({
                    title: `${title} (${category})`,
                    start: date,
                    allDay: true,
                    backgroundColor: categoryColors[category],
                    borderColor: categoryColors[category],
                    extendedProps: { memo, completed: false }
                });
            }

            const modal = document.getElementById('eventModal');
            if (modal) modal.style.display = 'none';
            eventForm.reset();
        };
    }
    // 칭호 드랍다운
    dropdownItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedTitle.textContent = this.textContent;
        });
    });

    // 버그헌터 (클릭 시 새 탭으로 열리는 버전)
    // const bugHunter = document.querySelector(".bugHunter");
    // bugHunter.addEventListener("click", function () {
    //     window.open("game/game.html", "popupWindow", "width=500,height=500,top=100,left=100,scrollbars=no,resizable=no");
    // });

    // 버그헌터 게임종료시, game.js에서 메세지 받아 모달창 닫음
    window.addEventListener("message", function(event) {
        if (event.data.action === "closeModal") {
            var modalElement = document.getElementById('exampleModal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);

            if (modalInstance) {
                modalInstance.hide();
                console.log("game페이지로부터 메세지를 받아 모달 닫힘");
            }
        }
    });


});

    const deleteEventBtn = document.getElementById('deleteEvent');
    if (deleteEventBtn) {
        deleteEventBtn.onclick = function() {
            if (selectedEvent && !selectedEvent.extendedProps.isHoliday && confirm('일정을 정말 삭제하시겠습니까?')) {
                const date = window.selectedDate;
                const events = JSON.parse(localStorage.getItem('events') || '{}');
                events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
                if (events[date].length === 0) delete events[date];
                localStorage.setItem('events', JSON.stringify(events));
                selectedEvent.remove();
                const modal = document.getElementById('eventModal');
                if (modal) modal.style.display = 'none';
                alert('일정이 삭제되었습니다!');
            }
        };
    }

    window.getQueryParam = function(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    };

    window.renderEvents = function(selectedDate, events) {
        const eventList = document.getElementById('event-list');
        const doneList = document.getElementById('done-list');
        if (!eventList || !doneList) return;

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
    };

    window.saveAndClose = function() {
        const selectedDate = window.getQueryParam('date');
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (window.opener && window.opener.calendar) {
            window.opener.calendar.refetchEvents();
        }
        window.close();
    };

    if (document.querySelector('.event')) {
        const selectedDate = window.getQueryParam('date');
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        document.getElementById('event-date').textContent = selectedDate ? `📅 ${selectedDate}` : '날짜를 선택하세요';
        window.renderEvents(selectedDate, events);

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

                window.renderEvents(selectedDate, events);
                document.getElementById('new-title').value = '';
            }
        }
        if (addBtn) {
            addBtn.addEventListener('click', addEventHandler);
        }

        const eventContainer = document.querySelector('.event');
        if (eventContainer) {
            eventContainer.addEventListener('click', function(e) {
                const target = e.target;
                const index = target.dataset.index;
                if (index === undefined) return;

                if (target.type === 'checkbox') {
                    const wasCompleted = events[selectedDate][index].completed;
                    events[selectedDate][index].completed = target.checked;
                    localStorage.setItem('events', JSON.stringify(events));
                    window.renderEvents(selectedDate, events);

                    if (!wasCompleted && target.checked && window.opener && window.opener.completeEvent) {
                        console.log(`체크박스 완료: ${selectedDate}, ${index}`);
                        window.opener.completeEvent(selectedDate, index);
                    }
                    if (window.opener && window.opener.calendar) {
                        window.opener.calendar.refetchEvents();
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

                            if (window.opener && window.opener.calendar) {
                                window.opener.calendar.refetchEvents();
                            }

                            window.renderEvents(selectedDate, events);
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
                        window.renderEvents(selectedDate, events);

                        if (window.opener && window.opener.calendar) {
                            window.opener.calendar.refetchEvents();
                        }
                    }
                }
            });
        }
    }
});

function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem('events') || '{}');
    const eventList = [];
    const categoryColors = {
        Python: '#3776AB',
        Java: '#007396',
        C: '#A8B9CC',
        Cpp: '#00599C',
        Csharp: '#68217A',
        JavaScript: '#F7DF1E',
        HTML: '#E34F26',
        R: '#276DC3',
        Kotlin: '#F18E33',
        SQL: '#4479A1',
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
                extendedProps: {
                    memo: event.memo || '',
                    completed: event.completed || false
                }
            });
        });
    }
    return eventList;
}

