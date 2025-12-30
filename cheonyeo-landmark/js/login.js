// Firestore 연결 가져오기
import { db } from "./firebase.js";

// Firestore에서 사용할 함수들
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 로그인 버튼 클릭 이벤트
document.getElementById("loginBtn").addEventListener("click", async () => {
  const studentId = document.getElementById("studentId").value.trim();
  const name = document.getElementById("name").value.trim();

  // 입력값 검사
  if (!studentId || !name) {
    alert("학번과 이름을 모두 입력하세요.");
    return;
  }

  // 사용자 고유 ID (문서 ID로 사용)
  const userId = `${studentId}_${name}`;

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // 이미 로그인한 적이 없는 경우에만 새로 생성
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        studentId: studentId,
        name: name,
        startTime: serverTimestamp(),
        completed: false
      });
    }

    // 로컬 저장 (페이지 이동용)
    localStorage.setItem("userId", userId);
    localStorage.setItem("currentQuiz", "1");

    // 첫 번째 퀴즈로 이동
    window.location.href = "quiz1.html";

  } catch (error) {
    console.error("로그인 오류:", error);
    alert("로그인 중 오류가 발생했습니다.");
  }
});
