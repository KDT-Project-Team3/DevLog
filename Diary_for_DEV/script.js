// TODO: 1. 유저 데이터 구조 정의
//       2. 업적 데이터 구조 정의
//       3. 각 객체의 웹페이지와의 상호작용 구현
//       4. DB 구현 및 연동

// 하단의 유저 데이터는 DB 구현 및 연동 전까지 사용할 임시 데이터
let user = {
    username: "John",       // 유저명
    lv: 1,                  // 레벨
    xp: 0,                  // 경험치
    img: "img/profile1.png" // 프로필 이미지
}; // 레벨당 필요 경험치를 어떻게 할당할 것인가? -> 일단 50 + 100 * (lv - 1)로 가정

let achievements = [
    // 업적 데이터 구조:
    // name: 업적 이름
    // flavor: 업적 설명
    // img: 업적 이미지
    // isCompleted: 업적 달성 여부
    // 달성 조건은 DB에서 TEXT로 저장, 읽어온 뒤 JSON.parse()로 변환
    {
        name: "CSS 마스터",
        flavor: '{"category":"CSS", "count": 10}',
        img: "img/medal1.png",
        isCompleted: true
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


