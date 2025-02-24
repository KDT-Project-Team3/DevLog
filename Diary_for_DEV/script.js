///todo 1: 캘린더 생성
///todo 2: 날짜별 일정 등 등록/ 수정/ 삭제
///todo 3: 카테고리
///todo 4: 일정 완료시 경험치 반환 -> 나중에
///todo 5: 배너
// let db;
// // SQLite 환경 초기화
// async function initDatabase() {
//     const SQL = await initSqlJs({
//         locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
//     });    // DB 없으면 새로 생성
//     db = new SQL.Database();
//
//     // users 테이블 생성
//     db.run(
//         `CREATE TABLE users (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name VARCHAR(30) NOT NULL,
//             email VARCHAR(30) NOT NULL
//         );`
//     );
//     displayUsers();
// }