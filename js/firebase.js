// 1️⃣ Firebase 기본 SDK 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// 2️⃣ Firestore 불러오기
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 3️⃣ Firebase 콘솔에서 복사한 설정
const firebaseConfig = {
  apiKey: "AIzaSyCxcw26w76BNVXI7E6iAJ-zJ1UoZAevX60",
  authDomain: "cheonyeo-landmark.firebaseapp.com",
  projectId: "cheonyeo-landmark",
  storageBucket: "cheonyeo-landmark.appspot.com",
  messagingSenderId: "50125990442",
  appId: "1:50125990442:web:37d09179a6b325ea047153"
};

// 4️⃣ Firebase 초기화
const app = initializeApp(firebaseConfig);

// 5️⃣ Firestore 연결해서 export
export const db = getFirestore(app);