// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNfIoc9mgdmIza8GsD3pJudutghm1Q4eg",
  authDomain: "cotc-3aa38.firebaseapp.com",
  projectId: "cotc-3aa38",
  storageBucket: "cotc-3aa38.firebasestorage.app",
  messagingSenderId: "1004946843216",
  appId: "1:1004946843216:web:94963a3b86bfe12b1ed355",
  measurementId: "G-J2NP4M73D3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log("✅ Firebase initialized successfully!");
console.log("Firebase App:", app);


export const auth = getAuth(app);