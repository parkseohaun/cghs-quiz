import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

const TOTAL_QUIZ = 6;
const userId = localStorage.getItem("userId");

if (!userId) {
  alert("잘못된 접근입니다.");
  location.href = "index.html";
}

async function checkAllClear() {
  const quizRef = collection(db, "users", userId, "quizzes");
  const snapshot = await getDocs(quizRef);

  let correctCount = 0;

  snapshot.forEach(doc => {
    if (doc.data().result === "correct") {
      correctCount++;
    }
  });

  // 모든 문제를 맞췄을 경우
  if (correctCount === TOTAL_QUIZ) {
    document.getElementById("allClearBox").style.display = "block";
  }
}

checkAllClear();
