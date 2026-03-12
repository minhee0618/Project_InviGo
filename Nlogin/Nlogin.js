// ✅ Firebase 초기화 (signup 페이지와 동일하게 필요)
const firebaseConfig = {
  apiKey: "AIzaSyAvUQ7igS4lvz_8h-WxgHdyT_GgulZKksg",
  authDomain: "nproject2025-88217.firebaseapp.com",
  projectId: "nproject2025-88217",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ✅ 로그인 처리
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      localStorage.setItem("userId", user.uid);

      alert(`${user.email}님 환영합니다!`);
      // 로그인 성공 후 페이지 이동
      window.location.href = "/Nmy/Nmy.html"; // 개인 페이지로 이동하거나 대시보드로 이동
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        alert("❌ 비밀번호가 일치하지 않습니다.");
      } else if (error.code === "auth/user-not-found") {
        alert("❌ 가입되지 않은 이메일입니다.");
      } else {
        alert("로그인 실패: " + error.message);
      }
    }
  });
});