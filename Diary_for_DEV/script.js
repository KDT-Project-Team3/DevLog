document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const profileInner = document.querySelector(".profileInner");
    const profileImg = document.querySelector(".profileImg");
    const expBar = document.querySelector(".exp");
    const medalBox = document.querySelector(".medalBox");
    const userInfoLayout = document.querySelector(".userInfoLayout");
    const profileLayout = document.querySelector(".profileLayout");
    const achievement = document.querySelector(".achievement");
    const achiveDiv = document.querySelector(".achievement div");
    const medal = document.querySelector(".medal");

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
        userInfoLayout.classList.add("profileInvisible");

        //프로필 비율
        profileLayout.style.marginLeft = "0";
        profileImg.style.width = "110px";
        profileImg.style.height = "110px";

        //업적별 칸 가로비율
        achiveDiv.style.width = "96%";

    });

    // hover 해제되면 클래스 추가
    sidebar.addEventListener("mouseleave", function () {
        profileInner.classList.add("profileInvisible"); // hover 해제 시 숨김
        expBar.classList.add("profileInvisible"); // hover 시 보이게
        medalBox.classList.add("profileInvisible");
        userInfoLayout.classList.remove("profileInvisible");

        //프로필 비율
        profileLayout.style.marginLeft = "47px";
        profileImg.style.width = "160px";
        profileImg.style.height = "160px";

        //업적별 칸 가로비율
        achiveDiv.style.width = "93%";
    });

});
