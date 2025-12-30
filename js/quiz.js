import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================
// 현재 퀴즈 번호
// ==========================
const quizNumber = Number(document.body.dataset.quiz);

// ==========================
// 문제별 정답 클래스 (TM 클래스명과 정확히 일치)
// ==========================
const QUIZ_ANSWERS = {
  1: "로비",
  2: "냥이",
  3: "달",
  4: "자판기",
  5: "인문사회교실",
  6: "도서반납기"
};

// ==========================
// 현재 문제 정답
// ==========================
const ANSWER_CLASS = QUIZ_ANSWERS[quizNumber];

console.log("quizNumber:", quizNumber);
console.log("ANSWER_CLASS:", ANSWER_CLASS);


// ==========================
// Firebase 연결
// ==========================
import { db } from "./firebase.js";

// ==========================
// Teachable Machine
// ==========================
const URL = "https://teachablemachine.withgoogle.com/models/NJ3ZUnayX/";
let model, maxPredictions;

// 정답 클래스 이름 (TM에서 설정한 이름과 정확히 일치해야 함)
const THRESHOLD = 0.7; // 70%

async function loadModel() {
  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );
  maxPredictions = model.getTotalClasses();
}

window.onload = async () => {
  await loadModel();
  console.log("모델 로드 완료");
};

// ==========================
// 기본 설정
// ==========================
const TOTAL_QUIZ = 6;

// 현재 사용자
const userId = localStorage.getItem("userId");

async function goNextQuiz() {
  if (quizNumber < TOTAL_QUIZ) {
    location.href = `quiz${quizNumber + 1}.html`;
  } else {
    await setDoc(
      doc(db, "users", userId),
      { completed: true },
      { merge: true }
    );
    location.href = "clear.html";
  }
}

// 로그인 안 했으면 되돌리기
if (!userId) {
  alert("로그인이 필요합니다.");
  location.href = "index.html";
}

// 시도 횟수
let attempts = 0;

// ==========================
// 최고 확률 예측 찾기
// ==========================
function getBestPrediction(predictions) {
  return predictions.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );
}

// ==========================
// 이미지 업로드 처리
// ==========================
const imageUpload = document.getElementById("imageUpload");
const previewImg = document.getElementById("preview");

imageUpload.addEventListener("change", () => {
  const file = imageUpload.files[0];
  if (!file) return;

  if (!isValidImage(file)) {
    alert(
      "사진 형식이 맞지 않습니다.\n" +
      "JPG, PNG, WEBP 파일만 업로드 가능합니다.\n\n" +
      "👉 카메라로 이미지를 제출해주세요!"
    );
    imageUpload.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    previewImg.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ==========================
// 카메라 촬영 처리
// ==========================
const cameraUpload = document.getElementById("cameraUpload");

cameraUpload.addEventListener("change", () => {
  const file = cameraUpload.files[0];
  if (!file) return;

  if (!isValidImage(file)) {
    alert("카메라 촬영 이미지를 다시 시도해주세요.");
    cameraUpload.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    previewImg.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ==========================
// 버튼 → input 연결
// ==========================
document.getElementById("uploadBtn").addEventListener("click", () => {
  document.getElementById("imageUpload").click();
});

document.getElementById("cameraBtn").addEventListener("click", () => {
  document.getElementById("cameraUpload").click();
});


// ==========================
// 제출 버튼 클릭
// ==========================
document.getElementById("submitBtn").addEventListener("click", async () => {
  attempts++;

  const img = document.getElementById("preview");

  if (!img || img.style.display === "none") {
    alert("이미지를 먼저 업로드하거나 촬영하세요.");
    return;
  }

  const predictions = await model.predict(img);
  const best = getBestPrediction(predictions);

  console.log("예측 결과:");
  predictions.forEach(p =>
    console.log(p.className, Math.round(p.probability * 100) + "%")
  );

  const isCorrect =
    best.className === ANSWER_CLASS &&
    best.probability >= THRESHOLD;

  if (isCorrect) {
  await saveResult("correct", best.probability);
  showCorrectUI(best);
  }
  else {
    showWrongUI(best);
  }
});

// ==========================
// 이미지 파일 검증
// ==========================
function isValidImage(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  // MIME 타입 검사
  if (allowedTypes.includes(file.type)) {
    return true;
  }

  // HEIC 확실히 차단
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
    return false;
  }

  return false;
}

// ==========================
// 다시 도전
// ==========================
document.getElementById("retryBtn").addEventListener("click", () => {
  document.getElementById("wrongBox").style.display = "none";
});

// ==========================
// 다음 문제로 스킵
// ==========================
document.getElementById("skipBtn").addEventListener("click", async () => {
  await saveResult("skip", null);
  goNextQuiz();
});

// ==========================
// Firestore 저장
// ==========================
async function saveResult(result, probability) {
  const quizId = `quiz${quizNumber}`;

  await setDoc(
    doc(db, "users", userId, "quizzes", quizId),
    {
      result: result,              // correct | skip
      attempts: attempts,
      probability: probability,    // 정답일 때만 저장
      timestamp: serverTimestamp()
    }
  );
}

// ==========================
// 정답 UI 표시
// ==========================
function showCorrectUI(best) {
  const correctBox = document.getElementById("correctBox");
  const correctText = document.getElementById("correctText");

  correctText.innerText =
    `🎉 정답입니다!\n(${Math.round(best.probability * 100)}% 일치)`;

  correctBox.style.display = "block";

  // 제출 버튼 비활성화 (중복 방지)
  document.getElementById("submitBtn").disabled = true;
}

// ==========================
// 다음 퀴즈 버튼
// ==========================
document.getElementById("nextBtn").addEventListener("click", () => {
  goNextQuiz();
});

function showWrongUI(best) {
  document.getElementById("correctBox").style.display = "none";

  const wrongBox = document.getElementById("wrongBox");
  const resultText = document.getElementById("resultText");

  resultText.innerText =
    `❌ 오답 (${Math.round(best.probability * 100)}%)\n다시 시도하거나 다음 문제로 넘어가세요.`;

  wrongBox.style.display = "block";
}

if (quizNumber === TOTAL_QUIZ) {
  document.getElementById("nextBtn").innerText = "클리어 페이지로";
}

