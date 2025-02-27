// 페이지가 로드될 때 실행되는 이벤트 리스너
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.querySelector(".banner"); // 배너 요소 선택
    const messages = [ // 배너에 표시할 메시지 배열
        "🚀 코드 한 줄이 세상을 바꾼다!",
        "🐞 버그 없는 코드? 신화일 뿐!",
        "💡 주석이 없는 코드는 마법이다. 이해할 수 없으니까!",
        "🔨 '작동하면 건들지 마라' - 개발자의 철학",
        "⚡ console.log('디버깅 중...')",
        "🌎 Java는 커피, JavaScript는 스크립트!",
        "⏳ 99% 완료? 남은 1%가 99%의 시간!",
        "🔥 Git은 기억하지 않는다. 하지만 로그는 기억한다。",
        "🚧 내 코드는 잘 돌아가, 하지만 이유는 몰라!",
        "📌 Stack Overflow가 없으면 개발이 안 돼!",
        "🎯 '이건 임시 코드야' - 10년 지난 코드",
        "🖥️ '이상하네, 내 컴퓨터에서는 되는데?'",
        "💾 'Ctrl + S'는 내 생명줄",
        "📜 TODO: 나중에 리팩토링하기 (절대 안 함)",
        "🎭 CSS는 마법이다. 예상대로 동작할 때가 없다。",
        "🌐 HTML은 프로그래밍 언어가 아니다! 하지만 없으면 웹도 없다!",
        "💀 'undefined'는 개발자의 최악의 악몽",
        "📌 null과 undefined의 차이를 안다면 이미 고수다。",
        "🔁 while(true) { work(); sleep(0); } // 개발자의 현실",
        "🔧 '이건 쉬운 수정이야'라고 말하면 안 돼...",
        "🤯 개발자는 코드를 짜는 게 아니라 버그를 고치는 직업이다。",
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

    // UI 요소 선택
    const sidebar = document.querySelector(".sidebar"); // 사이드바 요소
    const profileLayout = document.querySelector(".profileLayout"); // 프로필 레이아웃
    const profileInner = document.querySelector(".profileInner"); // 프로필 내부 요소
    const profileImg = document.querySelector(".profileImg"); // 프로필 이미지
    const expBarContainer = document.querySelector(".exp-bar-container"); // 경험치 바 컨테이너
    const expBar = document.querySelector(".exp-bar"); // 경험치 바
    const medalBox = document.querySelector(".medalBox"); // 메달 박스
    const userInfoLayout = document.querySelector(".userInfoLayout"); // 사용자 정보 레이아웃
    const profile = document.querySelector(".profile"); // 프로필 요소
    const achievement_p = document.querySelectorAll(".achievement .content p"); // 업적 설명 텍스트
    const content_title = document.querySelectorAll(".achievement .content h2"); // 업적 제목
    const dropdownItems = document.querySelectorAll(".dropdown-item"); // 드롭다운 항목
    const dropdownMenu = document.querySelector(".dropdown-menu"); // 드롭다운 메뉴
    const selectedTitle = document.getElementById("selectedTitle"); // 선택된 칭호
    const levelDisplay = document.querySelector(".LV h1"); // 레벨 표시 요소

    // 초기 상태 설정
    profileInner.classList.add("profileInvisible"); // 프로필 내부 숨김
    expBarContainer.classList.add("profileInvisible"); // 경험치 바 숨김
    medalBox.classList.add("profileInvisible"); // 메달 박스 숨김
    userInfoLayout.classList.remove("profileInvisible"); // 사용자 정보 표시

    // 배너 문구를 랜덤으로 표시하는 함수
    function changeBannerText() {
        const randomIndex = Math.floor(Math.random() * messages.length); // 랜덤 인덱스 생성
        banner.textContent = messages[randomIndex]; // 배너 텍스트 변경
    }
    changeBannerText(); // 초기 호출
    setInterval(changeBannerText, 3000); // 3초마다 호출

    // 사이드바 호버 이벤트: 확장 시 표시
    sidebar.addEventListener("mouseenter", function () {
        profileInner.classList.remove("profileInvisible"); // 프로필 내부 표시
        expBarContainer.classList.remove("profileInvisible"); // 경험치 바 표시
        medalBox.classList.remove("profileInvisible"); // 메달 박스 표시
        medalBox.style.height = "30%"; // 메달 박스 높이 설정
        userInfoLayout.classList.add("profileInvisible"); // 사용자 정보 숨김

        profileLayout.style.marginTop = "0"; // 프로필 레이아웃 상단 여백 제거
        profileLayout.style.marginBottom = "0"; // 하단 여백 제거
        profileImg.style.width = "140px"; // 프로필 이미지 크기 조정
        profileImg.style.height = "140px";
        profile.style.left = "70%"; // 프로필 위치 조정
        userInfoLayout.style.marginTop = "0"; // 사용자 정보 상단 여백 제거

        achievement_p.forEach(p => p.style.opacity = "1"); // 업적 설명 표시
    });

    // 사이드바 호버 종료: 축소 시 숨김
    sidebar.addEventListener("mouseleave", function () {
        profileInner.classList.add("profileInvisible"); // 프로필 내부 숨김
        expBarContainer.classList.add("profileInvisible"); // 경험치 바 숨김
        medalBox.classList.add("profileInvisible"); // 메달 박스 숨김
        medalBox.style.height = "0"; // 메달 박스 높이 초기화
        userInfoLayout.classList.remove("profileInvisible"); // 사용자 정보 표시

        profileImg.style.width = "170px"; // 프로필 이미지 원래 크기로
        profileImg.style.height = "170px";
        userInfoLayout.style.marginTop = "20%"; // 사용자 정보 상단 여백 설정

        achievement_p.forEach(p => p.style.opacity = "0"); // 업적 설명 숨김
    });

    // 카테고리별 색상 정의
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

    // 업적 - 카테고리 매핑 객체 정의 { 카테고리, 완료 수, 칭호, 이미지 } // 테스트를 위해 조건을 낮게 수정!!
    const achievementCategoryMap = {
        "Java 첫걸음": { category: "Java", requiredCount: 1, title: "", condition: "Java 일정 1개 완료" },
        "Java 고수": { category: "Java", requiredCount: 2, title: "", condition: "Java 일정 2개 완료" },
        "객체지향 달인": { category: "Java", requiredCount: 3, title: "", condition: "Java 일정 3개 완료" },
        "Java의 신": { category: "Java", requiredCount: 4, title: "☕ Java의 신", condition: "Java 일정 4개 완료" },
        "Python 첫걸음": { category: "Python", requiredCount: 1, title: "", condition: "Python 일정 1개 완료" },
        "Python 마스터": { category: "Python", requiredCount: 2, title: "", condition: "Python 일정 2개 완료" },
        "Python의 신": { category: "Python", requiredCount: 3, title: "🐍 Python의 신", condition: "Python 일정 3개 완료" },
        "JS 첫걸음": { category: "JavaScript", requiredCount: 1, title: "", condition: "JavaScript 일정 1개 완료" },
        "JS DOM의 달인": { category: "JavaScript", requiredCount: 2, title: "", condition: "JavaScript 일정 2개 완료" },
        "JS 마스터": { category: "JavaScript", requiredCount: 3, title: "🧩 JS 코드 마스터", condition: "JavaScript 일정 3개 완료" },
        "초보 프론트엔드": { category: "HTML", requiredCount: 1, title: "", condition: "HTML 일정 1개 완료" }, // "HTML 초보"로 변경 필요
        "HTML 고수": { category: "HTML", requiredCount: 2, title: "", condition: "HTML 일정 2개 완료" },
        "HTML의 신": { category: "HTML", requiredCount: 3, title: "📜 HTML의 신, 🎨 CSS의 신", condition: "HTML 일정 3개 완료" },
        "SQL 첫걸음": { category: "SQL", requiredCount: 1, title: "", condition: "SQL 일정 1개 완료" },
        "SQL 고수": { category: "SQL", requiredCount: 2, title: "", condition: "SQL 일정 2개 완료" },
        "SQL의 신": { category: "SQL", requiredCount: 3, title: "🗄️ SQL의 신", condition: "SQL 일정 3개 완료" },
        "정원 관리사": { category: "General", requiredCount: 1, title: "🏡 정원 관리사", condition: "어떤 일정 1개 완료" },
        "지옥에서 온": { category: "General", requiredCount: 2, title: "🔥 지옥에서 온", condition: "어떤 일정 2개 완료" },
        "코린이": { category: "General", requiredCount: 1, title: "🐣 코린이", condition: "어떤 일정 1개 완료" },
        "프로갓생러": { category: "General", requiredCount: 2, title: "🚀 프로 갓생러", condition: "어떤 일정 2개 완료" },
        "파워J": { category: "General", requiredCount: 3, title: "⚡ 파워 J", condition: "어떤 일정 3개 완료" },
        "자기계발왕": { category: "General", requiredCount: 4, title: "📚 자기계발 끝판왕", condition: "어떤 일정 4개 완료" },
        "닥터 스트레인지": { category: "General", requiredCount: 5, title: "⏳ 닥터 스트레인지", condition: "어떤 일정 5개 완료" }

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

    // 레벨 및 경험치 초기화 (전역 변수로 설정)
    window.userData = JSON.parse(localStorage.getItem('userData')) || { level: 1, xp: 0 }; // 사용자 데이터 로드 또는 초기화
    updateLevelAndExp(); // 초기 레벨 및 경험치 UI 업데이트

    // 수정: 칭호 초기화 및 로드
    let unlockedTitles = JSON.parse(localStorage.getItem('unlockedTitles')) || [];
    initializeTitles();

    // 캘린더 초기화
    const calendarEl = document.getElementById('calendar'); // 캘린더 요소 선택
    const calendar = new FullCalendar.Calendar(calendarEl, {
        height: '700px', // 캘린더 높이
        locale: 'ko', // 한국어 설정
        headerToolbar: { // 상단 툴바 설정
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth', // 기본 뷰: 월간
        initialDate: '2025-02-26', // 초기 날짜
        selectable: true, // 날짜 선택 가능
        dateClick: function(info) { // 날짜 클릭 시 팝업 열기
            window.open('check_event.html?date=' + info.dateStr, 'eventPopup',
                'width=500,height=500,top=100,left=100,scrollbars=no,resizable=no');
        },
        eventClick: function(info) { // 이벤트 클릭 시 팝업 열기
            window.open('check_event.html?date=' + info.event.startStr, 'eventPopup',
                'width=500,height=500,top=100,left=100,scrollbars=no,resizable=no');
        },
        events: async function(fetchInfo, successCallback, failureCallback) { // 이벤트 데이터 로드
            const localEvents = loadEventsFromLocalStorage(); // 로컬 이벤트 로드
            const holidayEvents = await fetchHolidays(); // 공휴일 데이터 로드
            successCallback([...localEvents, ...holidayEvents]); // 이벤트 결합 후 반환
        },
        eventDidMount: function(info) { // 이벤트 렌더링 후 실행
            if (info.event.extendedProps.completed) { // 완료된 이벤트에 취소선 추가
                info.el.querySelector('.fc-event-title').style.textDecoration = 'line-through';
            }
        }
    });
    calendar.render(); // 캘린더 렌더링

    // 캘린더를 전역으로 노출
    window.calendar = calendar;

    // 공휴일 데이터 가져오기
    async function fetchHolidays() {
        const url = 'https://date.nager.at/api/v3/publicholidays/2025/KR'; // 공휴일 API URL
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
            const holidays = await response.json(); // 공휴일 데이터 가져오기
            return holidays.map(holiday => ({ // 공휴일 데이터를 이벤트 형식으로 변환
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
            console.error('공휴일 가져오기 오류:', error); // 오류 로그 출력
            return [];
        }
    }

    // 이벤트 추가 함수
    window.addEventToCalendar = function(date, title, category) {
        const events = JSON.parse(localStorage.getItem('events') || '{}'); // 기존 이벤트 로드
        if (!events[date]) events[date] = []; // 날짜별 이벤트 배열 초기화
        events[date].push({ title, category, memo: '', completed: false }); // 새 이벤트 추가
        localStorage.setItem('events', JSON.stringify(events)); // 로컬 스토리지 저장
        calendar.addEvent({ // 캘린더에 이벤트 추가
            title: `${title} (${category})`,
            start: date,
            allDay: true,
            backgroundColor: categoryColors[category],
            borderColor: categoryColors[category],
            extendedProps: { memo: '', completed: false }
        });
        content_title.forEach(title => { // 업적 제목 스타일 조정
            title.style.fontSize = "2em";
            title.style.marginLeft = "1em";
            title.style.width = "200px";
        });
        console.log(`✅ 일정 추가 완료: ${date}, ${title}, ${category}`); // 추가 완료 로그
    };

    // 일정 완료 시 호출되는 함수
    window.completeEvent = function(date, index) {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        if (events[date] && events[date][index]) {
            const wasCompleted = events[date][index].completed;
            if (!wasCompleted) { // 이벤트가 완료되지 않은 경우에만 처리
                events[date][index].completed = true;
                localStorage.setItem('events', JSON.stringify(events));

                // XP 증가 및 레벨업 체크
                window.userData.xp += 1;
                console.log(`XP 증가: 현재 XP: ${window.userData.xp}`);
                checkLevelUp();
                updateLevelAndExp();
                updateMedals();
                window.calendar.refetchEvents(); // 캘린더 갱신
            } else {
                console.log(`이미 완료된 이벤트: ${date}, ${index}`);
            }
        } else {
            console.log(`완료 처리 실패: 이벤트 없음 - Date: ${date}, Index: ${index}`);
        }
    };

    // 레벨업 체크 및 경험치 초기화
    function checkLevelUp() {
        const requiredXp = window.userData.level + 1; // 다음 레벨까지 필요한 XP 계산
        if (window.userData.xp >= requiredXp) {
            window.userData.level += 1; // 레벨 증가
            window.userData.xp = 0; // 경험치 초기화
            localStorage.setItem('userData', JSON.stringify(window.userData)); // 저장
            console.log(`🎉 레벨업! 현재 레벨: ${window.userData.level}`);
        }
    }

    // 레벨 및 경험치 UI 업데이트
    function updateLevelAndExp() {
        const requiredXp = window.userData.level + 1;
        levelDisplay.textContent = `LV: ${window.userData.level}`; // 레벨 표시 업데이트
        const expPercentage = (window.userData.xp / requiredXp) * 100; // 경험치 퍼센트 계산
        expBar.style.width = `${expPercentage}%`; // 경험치 바 너비 설정
        expBar.textContent = `${window.userData.xp}/${requiredXp}`; // 경험치 텍스트 설정
        localStorage.setItem('userData', JSON.stringify(window.userData)); // 저장
        console.log(`레벨 UI 업데이트 - Level: ${window.userData.level}, XP: ${window.userData.xp}/${requiredXp}`);
    }

    //
    // 칭호 초기화 함수
    function initializeTitles() {
        dropdownMenu.innerHTML = ''; // 기존 항목 초기화
        const defaultItem = document.createElement('div');
        defaultItem.className = 'dropdown-item';
        defaultItem.textContent = '칭호 없음';
        defaultItem.addEventListener('click', () => selectedTitle.textContent = '칭호 없음');
        dropdownMenu.appendChild(defaultItem);

        unlockedTitles.forEach(title => addTitleToDropdown(title));
    }

    // 드롭다운에 칭호 추가 함수
    function addTitleToDropdown(title) {
        if (!unlockedTitles.includes(title)) {
            unlockedTitles.push(title);
            localStorage.setItem('unlockedTitles', JSON.stringify(unlockedTitles));
        }
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = title;
        item.addEventListener('click', () => selectedTitle.textContent = title);
        dropdownMenu.appendChild(item);
        console.log(`칭호 추가됨: ${title}`);
    }

    // 카테고리별 완료된 일정 집계 및 메달 업데이트
    function updateMedals() {
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const completedCounts = {};
        let totalCompleted = 0; // 모든 카테고리의 완료된 일정 수 합산

        for (const date in events) { // 모든 날짜의 이벤트 순회
            events[date].forEach(event => {
                if (event.completed) {
                    completedCounts[event.category] = (completedCounts[event.category] || 0) + 1; // 완료된 이벤트 카운트
                    totalCompleted++; // 전체 완료 수 증가
                }
            });
        }

        Object.keys(categoryColors).forEach(category => { // 각 카테고리에 대해 메달 상태 업데이트
            const medal = document.getElementById(category.toLowerCase());
            if (medal) {
                const count = completedCounts[category] || 0;
                if (count >= 1) {       // 테스트를 위해서 임시로 1 설정
                    medal.classList.add('unlocked'); // 20개 이상 완료 시 메달 표시
                } else {
                    medal.classList.remove('unlocked');
                }
            }
        });

        // 업적 해금 로직 (조건 기반)
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

    // 초기 메달 상태 설정
    updateMedals();

    // 칭호 드랍다운 이벤트 처리
    dropdownItems.forEach(item => {
        item.addEventListener("click", function () {
            selectedTitle.textContent = this.textContent; // 선택된 칭호로 텍스트 변경
        });
    });

    // 모달 관련 기능 (기존 모달 창 처리)
    let selectedEvent = null;
    function openModal(date, event) { // 모달 창 열기
        const modal = document.getElementById('eventModal');
        const titleInput = document.getElementById('eventTitle');
        const categorySelect = document.getElementById('eventCategory');
        const memoInput = document.getElementById('eventMemo');
        const deleteBtn = document.getElementById('deleteEvent');
        window.selectedDate = date;

        if (event) { // 기존 이벤트 수정 시
            selectedEvent = event;
            titleInput.value = event.title.split(' (')[0];
            categorySelect.value = event.title.match(/\(([^)]+)\)/)?.[1] || 'Java';
            memoInput.value = event.extendedProps.memo || '';
            deleteBtn.style.display = event.extendedProps.isHoliday ? 'none' : 'inline';
        } else { // 새 이벤트 추가 시
            selectedEvent = null;
            titleInput.value = '';
            categorySelect.value = 'Java';
            memoInput.value = '';
            deleteBtn.style.display = 'none';
        }
        modal.style.display = 'block'; // 모달 표시
    }

    document.querySelector('.close').onclick = function() { // 모달 닫기 버튼
        document.getElementById('eventModal').style.display = 'none';
    };

    document.getElementById('eventForm').onsubmit = function(e) { // 모달 폼 제출 처리
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

        if (selectedEvent) { // 이벤트 수정
            selectedEvent.remove();
            if (!events[date]) events[date] = [];
            events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
            alert('일정이 수정되었습니다!');
        } else if (!selectedEvent) { // 새 이벤트 추가
            alert('일정이 등록되었습니다!');
        }

        if (!events[date]) events[date] = [];
        events[date].push({ title, category, memo, completed: false });
        localStorage.setItem('events', JSON.stringify(events));
        calendar.addEvent({
            title: `${title} (${category})`,
            start: date,
            allDay: true,
            backgroundColor: categoryColors[category],
            borderColor: categoryColors[category],
            extendedProps: { memo, completed: false }
        });

        document.getElementById('eventModal').style.display = 'none';
        document.getElementById('eventForm').reset();
    };

    document.getElementById('deleteEvent').onclick = function() { // 모달에서 이벤트 삭제
        if (selectedEvent && !selectedEvent.extendedProps.isHoliday && confirm('일정을 정말 삭제하시겠습니까?')) {
            const date = window.selectedDate;
            const events = JSON.parse(localStorage.getItem('events') || '{}');
            events[date] = events[date].filter(ev => ev.title !== selectedEvent.title.split(' (')[0]);
            if (events[date].length === 0) delete events[date];
            localStorage.setItem('events', JSON.stringify(events));
            selectedEvent.remove();
            document.getElementById('eventModal').style.display = 'none';
            alert('일정이 삭제되었습니다!');
        }
    };

    // check_event.html에서 사용하는 함수들 통합
    window.getQueryParam = function(name) { // URL 쿼리 파라미터 가져오기
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    };

    window.renderEvents = function(selectedDate, events) { // 이벤트 목록 렌더링
        const eventList = document.getElementById('event-list');
        const doneList = document.getElementById('done-list');
        if (!eventList || !doneList) return;

        eventList.innerHTML = '';
        doneList.innerHTML = '';

        if (selectedDate && events[selectedDate] && Array.isArray(events[selectedDate])) {
            events[selectedDate].forEach((event, index) => {
                const li = document.createElement('li');
                li.className = 'event-item';
                if (event.completed) { // 완료된 이벤트
                    li.innerHTML = `
                        <span>${event.title} (${event.category})</span>
                        <button class="edit-btn" data-index="${index}">수정</button>
                        <button class="delete-btn" data-index="${index}">삭제</button>
                    `;
                    doneList.appendChild(li);
                } else { // 미완료 이벤트
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

        if (eventList.children.length === 0) { // 할 일 목록이 비어 있을 때
            const li = document.createElement('li');
            li.className = 'no-events';
            li.textContent = '일정을 추가하세요!';
            eventList.appendChild(li);
        }
        if (doneList.children.length === 0) { // 완료 목록이 비어 있을 때
            const li = document.createElement('li');
            li.className = 'no-events';
            li.textContent = '완료된 항목이 없습니다.';
            doneList.appendChild(li);
        }
    };

    window.saveAndClose = function() { // 저장 후 팝업 닫기
        const selectedDate = window.getQueryParam('date');
        const events = JSON.parse(localStorage.getItem('events') || '{}');
        const updatedEvents = events[selectedDate] || [];

        if (window.opener) {
            window.opener.calendar.refetchEvents(); // 부모 캘린더 갱신
        } else {
            console.warn('Failed to save events');
        }
        window.close(); // 팝업 창 닫기
    };

    // check_event.html의 이벤트 처리 통합
    if (document.querySelector('.event')) { // check_event.html에서만 실행
        const selectedDate = window.getQueryParam('date');
        const events = JSON.parse(localStorage.getItem('events') || '{}');

        document.getElementById('event-date').textContent = selectedDate ? `📅 ${selectedDate}` : '날짜를 선택하세요'; // 날짜 표시
        window.renderEvents(selectedDate, events); // 초기 이벤트 렌더링

        const addBtn = document.getElementById('add-btn');
        function addEventHandler() { // 새 이벤트 추가 처리
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
        addBtn.addEventListener('click', addEventHandler);

        document.querySelector('.event').addEventListener('click', function(e) { // 이벤트 클릭 처리
            const target = e.target;
            const index = target.dataset.index;
            if (index === undefined) return;

            if (target.type === 'checkbox') { // 체크박스 클릭 시
                const wasCompleted = events[selectedDate][index].completed;
                events[selectedDate][index].completed = target.checked;
                localStorage.setItem('events', JSON.stringify(events));
                window.renderEvents(selectedDate, events);

                // 완료 상태가 false -> true로 변경될 때 XP 증가
                if (!wasCompleted && target.checked && window.opener && window.opener.completeEvent) {
                    console.log(`체크박스 완료: ${selectedDate}, ${index}`);
                    window.opener.completeEvent(selectedDate, index);
                }
                if (window.opener && window.opener.calendar) {
                    window.opener.calendar.refetchEvents();
                } else {
                    console.warn('부모 창의 캘린더 객체를 찾을 수 없음');
                }
            } else if (target.classList.contains('edit-btn')) { // 수정 버튼 클릭 시
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
            } else if (target.classList.contains('delete-btn')) { // 삭제 버튼 클릭 시
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
});

// 로컬 스토리지에서 이벤트 불러오기
function loadEventsFromLocalStorage() { // 저장된 이벤트를 캘린더 형식으로 변환
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
                    memo: event.memo,
                    completed: event.completed || false
                }
            });
        });
    }
    return eventList; // 변환된 이벤트 목록 반환
}

/* TODO : 업적 칸 비율 조절
         메달 hover 효과 수정
         드랍다운 메뉴 수정 */