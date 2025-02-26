document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const profileLayout = document.querySelector(".profileLayout");
    const profileInner = document.querySelector(".profileInner");
    const profileImg = document.querySelector(".profileImg");
    const expBar = document.querySelector(".exp");
    const medalBox = document.querySelector(".medalBox");
    const medal = document.querySelectorAll(".medal");
    const userInfoLayout = document.querySelector(".userInfoLayout");
    const profile = document.querySelector(".profile");
    const achievement_p = document.querySelectorAll(".achievement .content p");
    const content_title = document.querySelectorAll(".achievement .content h2");

    // 초기 상태: profileInner 숨기기
    profileInner.classList.add("profileInvisible");
    expBar.classList.add("profileInvisible");
    medalBox.classList.add("profileInvisible");
    userInfoLayout.classList.remove("profileInvisible");

    // hover 하면 클래스제거
    sidebar.addEventListener("mouseenter", function () {
        profileInner.classList.remove("profileInvisible"); // hover 시 보이게
        expBar.classList.remove("profileInvisible"); // hover 시 보이게
        medalBox.classList.remove("profileInvisible");
        medalBox.style.height = "30%";
        userInfoLayout.classList.add("profileInvisible");

        //프로필 비율
        profileLayout.style.marginTop = "0";
        profileLayout.style.marginBottom = "0";
        // profileLayout.style.height = "20%";
        profileImg.style.width = "140px";
        profileImg.style.height = "140px";
        profile.style.left = "70%";
        userInfoLayout.style.marginTop = "0";


        //업적 설명 텍스트
        achievement_p.forEach(p => {
            p.style.opacity = "1"; // 모든 요소에 opacity 적용
        });

        content_title.forEach(title => {
            title.style.fontSize = "1.6em";
            title.style.marginLeft = "1em";
            title.style.width = "150px";
        });
    });

    // hover 해제되면 클래스 추가
    sidebar.addEventListener("mouseleave", function () {
        profileInner.classList.add("profileInvisible"); // hover 해제 시 숨김
        expBar.classList.add("profileInvisible"); // hover 시 보이게
        medalBox.classList.add("profileInvisible");
        medalBox.style.height = "0";
        userInfoLayout.classList.remove("profileInvisible")

        //프로필 비율
        profileImg.style.width = "170px";
        profileImg.style.height = "170px";
        userInfoLayout.style.marginTop = "20%";


        //업적 설명 텍스트
        achievement_p.forEach(p => {
            p.style.opacity = "0"; // 모든 요소에 opacity 적용
        });

        content_title.forEach(title => {
            title.style.fontSize = "2em";
            title.style.marginLeft = "1em";
            title.style.width = "200px";
        });
    });

    //칭호 드랍다운 버튼
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    const selectedTitle = document.getElementById("selectedTitle");

    dropdownItems.forEach(item => {
        item.addEventListener("click", function () {
            const selectedText = this.textContent;
            selectedTitle.textContent = selectedText;// 칭호 텍스트 변경
        });
    });

    // console.log(medal.document);
    //todo : 메달 호버하면 앞뒤 메달 조금 커지게

    //todo: 레벨 증가 로직

});
