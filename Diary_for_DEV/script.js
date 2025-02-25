// TODO: 1. 유저 데이터 구조 정의 - 완료
//       2. 업적 데이터 구조 정의 - 완료
//       3. 각 객체의 웹페이지와의 상호작용 구현 - 진행중
//       4. DB 구현 및 연동 - 진행중

import { initDatabase, addUser, getUser, getUsers, saveDatabase, loadDatabase } from './dbhelper.js';

// 현재 유저 객체
// 하단의 유저 데이터는 DB 구현 및 연동 전까지 사용할 임시 데이터
const user = {
    username: "John",       // 유저명
    lv: 1,                  // 레벨
    xp: 0,                  // 경험치
    img: "img/profile1.png", // 프로필 이미지
    // 레벨업 함수
    lvUp() {
        if (this.xp >= (50 + 100 * (this.lv - 1))) {
            this.lv++;
            this.xp -= (50 + 100 * (this.lv - 1));
        }
    },
    // 경험치 획득 함수
    gainXP(xp) {
        this.xp += xp;
        this.lvUp();
    },
    // 프로필 이미지 변경 함수
    imgChange(img) {
        this.img = img;
    }
};

// 업적 목록 배열
const achievements = [
    // 업적 데이터 구조:
    // name: 업적 이름
    // flavor: 업적 설명
    // img: 업적 이미지
    // isCompleted: 업적 달성 여부
    // 달성 조건은 DB에서 TEXT로 저장, 읽어온 뒤 JSON.parse()로 변환
    {
        name: "CSS 마스터",
        flavor: '{"category":"CSS", "count": 5}',
        img: "img/medal1.png",
        isCompleted: false
    },
    {
        name: "JS 마스터",
        flavor: '{"category":"JS", "count": 10}',
        img: "img/medal2.png",
        isCompleted: false
    },
    {
        name: "HTML 마스터",
        flavor: '{"category":"HTML", "count": 10}',
        img: "img/medal3.png",
        isCompleted: true
    }
]

// 더미용 일정 데이터
const events = [
    {
        title: "CSS 공부하기 1회차",
        com_lang: "CSS",
        xp: 10,
        description: "CSS 선택자 공부하기",
        event_date: "2021-09-01"
    },
    {
        title: "CSS 공부하기 2회차",
        com_lang: "CSS",
        xp: 10,
        description: "CSS 선택자 공부하기",
        event_date: "2021-09-02"
    },
    {
        title: "CSS 공부하기 3회차",
        com_lang: "CSS",
        xp: 10,
        description: "CSS 선택자 공부하기",
        event_date: "2021-09-03"
    },
    {
        title: "CSS 공부하기 4회차",
        com_lang: "CSS",
        xp: 10,
        description: "CSS 선택자 공부하기",
        event_date: "2021-09-04"
    },
    {
        title: "CSS 공부하기 5회차",
        com_lang: "CSS",
        xp: 10,
        description: "CSS 선택자 공부하기",
        event_date: "2021-09-05"
    }
]

// 업적 달성 여부 갱신 함수
function updateAchievements() { // 일정 완료 시 호출
    achievements.forEach(achievement => {
        const condition = JSON.parse(achievement.flavor); // DB에서 TEXT로 저장된 조건을 JSON으로 변환
        // 조건에 맞는 업적을 찾아 isCompleted를 true로 변경
        let count = 0;
        events.forEach(event => {
            if (event.com_lang === condition.category) {
                count++;
            }
        });
        if (count >= condition.count) {
            achievement.isCompleted = true;
        }
    });
}

// 화면 오픈 시 db 연결 및 초기화
window.onload = initDatabase;
window.onload = loadDatabase;