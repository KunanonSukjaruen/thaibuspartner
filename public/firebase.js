// firebase.js - ไฟล์สำหรับการกำหนดค่า Firebase และส่งออกอินสแตนซ์ที่ใช้งาน

// การกำหนดค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnbHkZdTBFVJeqo0oPoqhcAW0nuYX_KKM",
  authDomain: "thaibuspartner.firebaseapp.com",
  projectId: "thaibuspartner",
  storageBucket: "thaibuspartner.firebasestorage.app",
  messagingSenderId: "501829297518",
  appId: "1:501829297518:web:36f9c1ed163748e3f9cd7f",
  measurementId: "G-9W24TDHWMB"
};

// ฟังก์ชัน initializeFirebase สำหรับเริ่มต้นการใช้งาน Firebase
function initializeFirebase() {
  // ตรวจสอบว่า Firebase ถูกเริ่มต้นแล้วหรือไม่
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // ตั้งค่าภาษาไทยสำหรับ Firebase Authentication
  firebase.auth().useDeviceLanguage();
  
  return {
    auth: firebase.auth(),
    db: firebase.firestore()
  };
}

// กำหนดตัวแปรสำหรับใช้งานทั่วไป
const firebaseApp = initializeFirebase();
const auth = firebaseApp.auth;
const db = firebaseApp.db;

// เพิ่มไว้ใน window object เพื่อให้สามารถเข้าถึงได้จากภายนอก
window.firebaseApp = firebaseApp;
window.firebase_auth = auth;
window.firebase_db = db;