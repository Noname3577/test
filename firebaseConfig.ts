// Fix: Use Firebase v8 namespaced API which is compatible with older versions of the SDK.
// Fix: To resolve errors on lines 33, 34, and 39, the Firebase v9 compat libraries are needed to use the v8 namespaced API.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// =================================================================
// !! สำคัญ: กรุณาใส่ข้อมูล Firebase Configuration ของคุณที่นี่ !!
// =================================================================
//
// 1. ไปที่โปรเจกต์ Firebase ของคุณ: https://console.firebase.google.com/
// 2. ไปที่ Project settings (ไอคอนรูปฟันเฟือง) > General tab
// 3. ในส่วน "Your apps" ให้เลือกเว็บแอปของคุณ (หรือสร้างใหม่)
// 4. ในส่วน "SDK setup and configuration" ให้เลือก "Config" และคัดลอก object ทั้งหมดมาวางแทนที่ `firebaseConfig` ด้านล่าง
//
// **หลังจากตั้งค่าแล้ว, อย่าลืม:**
// - **สร้างฐานข้อมูล:** ไปที่เมนู Build > Cloud Firestore และสร้างฐานข้อมูล (แนะนำให้เริ่มใน "Test mode" ซึ่งจะตั้งค่า Security Rules ให้เข้าถึงได้ง่าย)
// - **ตรวจสอบ Security Rules:** ตรวจสอบว่ากฎอนุญาตให้แอปของคุณอ่านและเขียนข้อมูลได้
//
// =================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDFI7nzxUNw1sdp0ze6A2Kj_ldbalN3nk4",
  authDomain: "testone-6bdd4.firebaseapp.com",
  projectId: "testone-6bdd4",
  storageBucket: "testone-6bdd4.firebasestorage.app",
  messagingSenderId: "1077149362871",
  appId: "1:1077149362871:web:c00647d842857bc15b7b32",
  measurementId: "G-H5RQ0W934Y"
};


// Initialize Firebase
// Fix: Use Firebase v8 syntax and check if app is already initialized to prevent errors during hot-reloading.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get a Firestore instance
// Fix: Use Firebase v8 syntax to get Firestore instance.
export const db = firebase.firestore();