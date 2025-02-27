// 페이지가 로드될 때 실행되는 이벤트 리스너
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.querySelector(".banner");
    const messages = ["🚀 코드 한 줄이 세상을 바꾼다!", "🐞 버그 없는 코드? 신화일 뿐!" /* 생략 */];
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
    const selectedTitle = document.getElementById("selectedTitle");
    const levelDisplay = document.querySelector(".LV h1");

    // 초기 상태 설정
    profileInner.classList.add("profileInvisible");
    expBarContainer.classList.add("profileInvisible");
    medalBox.classList.add("profileInvisible");
    userInfoLayout.classList.remove("profileInvisible");

    function changeBannerText() {
        const randomIndex = Math.floor(Math.random() * messages.length);
        banner.textContent = messages[randomIndex];
    }
    changeBannerText();
    setInterval(changeBannerText, 3000);

    sidebar.addEventListener("mouseenter", function () {
        profileInner.classList.remove("profileInvisible");
        expBarContainer.classList.remove("profileInvisible");
        medalBox.classList.remove("profileInvisible");
        medalBox.style.height = "30%";
        userInfoLayout.classList.add("profileInvisible");
        profileLayout.style.marginTop = "0";
        profileLayout.style.marginBottom = "0";
        profileImg.style.width = "140px";
        profileImg.style.height = "140px";
        profile.style.left = "70%";
        userInfoLayout.style.marginTop = "0";
        achievement_p.forEach(p => p.style.opacity = "1");
    });

    sidebar.addEventListener("mouseleave", function () {
        profileInner.classList.add("profileInvisible");
        expBarContainer.classList.add("profileInvisible");
        medalBox.classList.add("profileInvisible");
        medalBox.style.height = "0";
        userInfoLayout.classList.remove("profileInvisible");
        profileImg.style.width = "170px";
        profileImg.style.height = "170px";
        userInfoLayout.style.marginTop = "20%";
        achievement_p.forEach(p => p.style.opacity = "0");
    });

    const categoryColors = {
        Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
        JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
        Holiday: '#FF0000'
    };

    content_title.forEach(title => {
        title.style.fontSize = "1.6em";
        title.style.marginLeft = "1em";
        title.style.width = "150px";
    });

    window.userData = JSON.parse(localStorage.getItem('userData')) || { level: 1, xp: 0 };
    updateLevelAndExp();

    const calendarEl = document.getElementById('calendar');
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
            window.open('check_event.html?date=' + info.dateStr, 'eventPopup', 'width=500,height=500');
        },
        eventClick: function(info) {
            window.open('check_event.html?date=' + info.event.startStr, 'eventPopup', 'width=500,height=500');
        },
        events: async function(fetchInfo, successCallback) {
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
                extendedProps: { memo: holiday.name || '', category: 'Holiday', isHoliday: true, completed: false }
            }));
        } catch (error) {
            console.error('공휴일 가져오기 오류:', error);
            return [];
        }
    }

    // 이벤트 추가 함수 (중복 체크 강화)
    window.addEventToCalendar = function(date, title, category) {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (!events[date]) events[date] = [];
        const exists = events[date].some(event => event.title === title && event.category === category);
        if (!exists) {
            events[date].push({ title, category, memo: '', completed: false });
            localStorage.setItem('events', JSON.stringify(events));
            // 캘린더에 이벤트 추가 후 중복 렌더링 방지를 위해 refetchEvents 호출 제거
            calendar.addEvent({
                title: `${title} (${category})`,
                start: date,
                allDay: true,
                backgroundColor: categoryColors[category],
                borderColor: categoryColors[category],
                extendedProps: { memo: '', completed: false }
            });
            console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`);
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
                window.userData.xp += 1;
                console.log(`XP 증가: 현재 XP: ${window.userData.xp}`);
                checkLevelUp();
                updateLevelAndExp();
                updateMedals();
                window.calendar.refetchEvents();
            }
        }
    };

    function checkLevelUp() {
        const requiredXp = window.userData.level * 5;
        while (window.userData.xp >= requiredXp) {
            window.userData.level += 1;
            window.userData.xp -= requiredXp;
            console.log(`🎉 레벨업! 현재 레벨: ${window.userData.level}, 남은 XP: ${window.userData.xp}`);
        }
        localStorage.setItem('userData', JSON.stringify(window.userData));
    }

    function updateLevelAndExp() {
        const requiredXp = window.userData.level * 5;
        levelDisplay.textContent = `LV: ${window.userData.level}`;
        const expPercentage = (window.userData.xp / requiredXp) * 100;
        expBar.style.width = `${expPercentage}%`;
        expBar.textContent = `${window.userData.xp}/${requiredXp}`;
        localStorage.setItem('userData', JSON.stringify(window.userData));
    }

    function updateMedals() {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const completedCounts = {};
        for (const date in events) {
            events[date].forEach(event => {
                if (event.completed) {
                    completedCounts[event.category] = (completedCounts[event.category] || 0) + 1;
                }
            });
        }
        Object.keys(categoryColors).forEach(category => {
            const medal = document.getElementById(category.toLowerCase());
            if (medal) {
                const count = completedCounts[category] || 0;
                if (count >= 1) medal.classList.add('unlocked');
                else medal.classList.remove('unlocked');
            }
        });
    }
    updateMedals();

    dropdownItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedTitle.textContent = this.textContent;
        });
    });

    // 모달 관련 코드 생략
});

function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem('events') || '{}');
    const eventList = [];
    const categoryColors = {
        Python: '#3776AB', Java: '#007396', C: '#A8B9CC', Cpp: '#00599C', Csharp: '#68217A',
        JavaScript: '#F7DF1E', HTML: '#E34F26', R: '#276DC3', Kotlin: '#F18E33', SQL: '#4479A1',
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
                extendedProps: { memo: event.memo || '', completed: event.completed || false }
            });
        });
    }
    return eventList;
}