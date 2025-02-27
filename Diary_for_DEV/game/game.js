// 게임 데이터: 레벨별 버그 있는 Java 코드와 정답 코드
const levels = [
    // 레벨 1: 매우 쉬움
    [
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 5\n        System.out.println(x);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 5;\n        System.out.println(x);\n    }\n}",
            hint: "세미콜론이 누락되었습니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        System.out.println('Hello')\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n    }\n}",
            hint: "문자열은 큰따옴표로 감싸야 합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int num = 10;\n        System.out.println(num)\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int num = 10;\n        System.out.println(num);\n    }\n}",
            hint: "문장 끝에 세미콜론이 필요합니다."
        }
    ],
    // 레벨 2: 쉬움
    [
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int a = 5;\n        int b = '10';\n        System.out.println(a + b);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int a = 5;\n        int b = 10;\n        System.out.println(a + b);\n    }\n}",
            hint: "문자 '10'은 숫자가 아니므로 올바른 정수 값을 사용해야 합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        String name = \"Alice\"\n        if (name = \"Bob\") {\n            System.out.println(\"Hi, Bob!\");\n        }\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        String name = \"Alice\";\n        if (name.equals(\"Bob\")) {\n            System.out.println(\"Hi, Bob!\");\n        }\n    }\n}",
            hint: "문자열 비교는 equals 메서드를 사용해야 합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 0;\n        x + 1;\n        System.out.println(x);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 0;\n        x = x + 1;\n        System.out.println(x);\n    }\n}",
            hint: "변수에 값을 다시 할당해야 합니다."
        }
    ],
    // 레벨 3: 보통
    [
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {1, 2, 3};\n        for (int i = 0; i <= numbers.length; i++) {\n            System.out.println(numbers[i]);\n        }\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {1, 2, 3};\n        for (int i = 0; i < numbers.length; i++) {\n            System.out.println(numbers[i]);\n        }\n    }\n}",
            hint: "인덱스가 배열 길이를 초과하면 ArrayIndexOutOfBoundsException이 발생합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 5;\n        doubleNumber(x);\n        System.out.println(x);\n    }\n    public static void doubleNumber(int num) {\n        num * 2;\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 5;\n        x = doubleNumber(x);\n        System.out.println(x);\n    }\n    public static int doubleNumber(int num) {\n        return num * 2;\n    }\n}",
            hint: "메서드에서 값을 반환하고 호출 측에서 사용해야 합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        arr[3] = 4;\n        System.out.println(arr[3]);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int[] arr = new int[4];\n        arr[0] = 1;\n        arr[1] = 2;\n        arr[2] = 3;\n        arr[3] = 4;\n        System.out.println(arr[3]);\n    }\n}",
            hint: "배열 크기를 초과하여 접근하면 오류가 발생합니다. 배열을 새로 생성해야 합니다."
        }
    ],
    // 레벨 4: 어려움
    [
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        String text = null;\n        System.out.println(text.length());\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        String text = \"Hello\";\n        System.out.println(text.length());\n    }\n}",
            hint: "null 문자열의 길이를 구하려 하면 NullPointerException이 발생합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int x = 5 / 0;\n        System.out.println(x);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        try {\n            int x = 5 / 0;\n            System.out.println(x);\n        } catch (ArithmeticException e) {\n            System.out.println(\"0으로 나눌 수 없습니다.\");\n        }\n    }\n}",
            hint: "0으로 나누는 연산은 예외 처리가 필요합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int[] data = {1, 2, 3};\n        int sum = 0;\n        for (int i : data) {\n            sum += i++;\n        }\n        System.out.println(sum);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int[] data = {1, 2, 3};\n        int sum = 0;\n        for (int i : data) {\n            sum += i;\n        }\n        System.out.println(sum);\n    }\n}",
            hint: "for-each 루프에서 i++는 배열 요소를 변경하지 않습니다."
        }
    ],
    // 레벨 5: 매우 어려움
    [
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        List<String> list = new ArrayList<>();\n        list.add(\"One\");\n        list = null;\n        list.add(\"Two\");\n        System.out.println(list);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        List<String> list = new ArrayList<>();\n        list.add(\"One\");\n        list.add(\"Two\");\n        System.out.println(list);\n    }\n}",
            hint: "list를 null로 설정하면 NullPointerException이 발생합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        int[] copy = arr;\n        copy[0] = 10;\n        System.out.println(arr[0]);\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        int[] arr = {1, 2, 3};\n        int[] copy = arr.clone();\n        copy[0] = 10;\n        System.out.println(arr[0]);\n    }\n}",
            hint: "배열을 단순히 할당하면 참조가 복사되므로 clone을 사용해야 합니다."
        },
        {
            buggyCode: "public class Main {\n    public static void main(String[] args) {\n        Thread t = new Thread(() -> {\n            System.out.println(\"Running\");\n        });\n        t.run();\n    }\n}",
            correctCode: "public class Main {\n    public static void main(String[] args) {\n        Thread t = new Thread(() -> {\n            System.out.println(\"Running\");\n        });\n        t.start();\n    }\n}",
            hint: "run()은 새 스레드를 생성하지 않으므로 start()를 사용해야 합니다."
        }
    ]
];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// 게임 상태 변수
let currentLevel = 0;
let timeLeft = 90; // 초기 시간 (레벨별로 조정)
let timer;
let currentProblemIndex;
let score = 0;

// 게임 초기화
function initGame() {
    // 레벨별 시간 설정
    const levelTimes = [20, 40, 60, 80, 80]; // 레벨 1: 90초, 레벨 5: 30초
    timeLeft = levelTimes[currentLevel];
    document.getElementById('current-level').textContent = currentLevel + 1;
    document.getElementById('time-left').textContent = timeLeft;

    // 랜덤 문제 선택
    const problems = levels[currentLevel];
    currentProblemIndex = Math.floor(Math.random() * problems.length);
    const problem = problems[currentProblemIndex];
    document.getElementById('buggy-code').textContent = problem.buggyCode;
    document.getElementById('user-input').value = '';
    document.getElementById('message').textContent = problem.hint;

    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    document.getElementById('submit-btn').disabled = false;
}

// 타이머 업데이트
function updateTimer() {
    timeLeft--;
    document.getElementById('time-left').textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timer);
        document.getElementById('message').textContent = '시간 초과! 게임 오버!';
        document.getElementById('submit-btn').disabled = true;
        setTimeout(() => {
            window.location.href = '../main/main.html'; // 시간 초과 시 게임 오버 페이지로 이동
        }, 2000);
    }
}

// 코드 제출 처리
document.getElementById('submit-btn').addEventListener('click', function() {
    const userCode = document.getElementById('user-input').value.trim();
    const correctCode = levels[currentLevel][currentProblemIndex].correctCode.trim();

    if (userCode === correctCode) {
        clearInterval(timer);
        score++;
        document.getElementById('message').textContent = '정답입니다! 다음 레벨로 이동합니다.';
        updateHighscore(); // 점수 갱신
        currentLevel++;
        if (currentLevel < levels.length) {
            setTimeout(initGame, 2000); // 2초 후 다음 레벨
        } else {
            document.getElementById('message').textContent = '축하합니다! 모든 레벨을 클리어했습니다!';
            document.getElementById('submit-btn').disabled = true;
            setTimeout(() => {
                window.location.href = '../main/main.html'; // 모든 레벨 클리어 후 승리 페이지로 이동
            }, 2000);
        }
    } else {
        score = 0;
        document.getElementById('message').textContent = '틀렸습니다! 다시 시도하세요.';
    }
});

// 점수 갱신 함수
// 새로운 창으로 넘어가는 방식이 아닌 새로운 창을 여는
function updateHighscore() {
    if (currentUser && currentUser.length > 0) {
        const userId = currentUser[0].values[0][0]; // user_id
        const highscore = currentUser[0].values[0][7]; // highscore

        if (score > highscore) {
            // currentUser의 highscore 갱신
            currentUser[0].values[0][7] = score;
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            // localStorage에 저장된 user의 highscore 갱신
            const users = JSON.parse(localStorage.getItem('user'));
            if (users && users.length > 0) {
                users[0].values.forEach(user => {
                    if (user[0] === userId) {
                        user[7] = score;
                    }
                });
                localStorage.setItem('user', JSON.stringify(users));
            }
            console.log('✅ 최고기록 갱신 완료!');
        }
    } else {
        console.warn("⚠️ 로그인중인 사용자 정보를 불러오지 못했습니다.");
    }
}

// 게임 시작
initGame();