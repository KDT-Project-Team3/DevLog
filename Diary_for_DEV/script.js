document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const profileInner = document.querySelector(".profileInner");
    const profileImg = document.querySelector(".profileImg");
    const expBar = document.querySelector(".exp");
    const medalBox = document.querySelector(".medalBox");
    const userInfoLayout = document.querySelector(".userInfoLayout");
    const profile = document.querySelector(".profile");

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
        // profileLayout.style.marginLeft = "0";
        profileImg.style.width = "120px";
        profileImg.style.height = "120px";
        profile.style.left = "70%";
        // profileLayout.style.height = "100%";

        //업적 설명 텍스트
        // achievement_p.style.opacity = "1";\

    });

    // hover 해제되면 클래스 추가
    sidebar.addEventListener("mouseleave", function () {
        profileInner.classList.add("profileInvisible"); // hover 해제 시 숨김
        expBar.classList.add("profileInvisible"); // hover 시 보이게
        medalBox.classList.add("profileInvisible");
        medalBox.style.height = "5%";
        userInfoLayout.classList.remove("profileInvisible");

        //프로필 비율
        // profileLayout.style.marginLeft = "47px";
        profileImg.style.width = "160px";
        profileImg.style.height = "160px";
        // profileLayout.style.height = "25%";
        // profile.style.left = "-7000px";


        //업적 설명 텍스트
        // achievement_p.style.opacity = "0";

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
});
