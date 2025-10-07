document.addEventListener("DOMContentLoaded", () => {
  // ==================== Music ====================
  const musicSelect = document.getElementById("musicSelect");
  const loginMusic = document.getElementById("loginMusic");
  if (musicSelect && loginMusic) {
    loginMusic.src = musicSelect.value;
    loginMusic.play().catch(() => console.log("Autoplay blocked"));

    musicSelect.addEventListener("change", () => {
      loginMusic.src = musicSelect.value;
      loginMusic.play();
    });
  }

  // ==================== Background ====================
  const backgrounds = [
    "url('loginImages/loginImage.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #ff7e5f, #feb47b)",
    "url('loginImages/dndbgimage3.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #6a11cb, #2575fc)",
    "url('loginImages/dndbgimage4.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #43cea2, #185a9d)",
    "url('loginImages/loginImage2.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #f0e68c, #add8e6)",
    "url('loginImages/loginImage3.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #000000, #ffffff)",
    "url('loginImages/loginImage4.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #005500, #ffffff)",
    "url('loginImages/loginImage5.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #550000, #ffffff)",
    "url('loginImages/loginImage6.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #000055, #ffffff)",
    "url('loginImages/loginImage7.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #000000, #000000)",
    "url('loginImages/loginImage8.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #ffffff, #ffffff)",
    "url('loginImages/loginImage9.jpg') no-repeat center center / cover",
  ];

  let currentBg = 0;
  const changeBgBtn = document.getElementById("changeBgBtn");
  if (changeBgBtn) {
    document.body.style.background = backgrounds[currentBg];
    changeBgBtn.addEventListener("click", () => {
      currentBg = (currentBg + 1) % backgrounds.length;
      document.body.style.background = backgrounds[currentBg];
    });
  }
});
